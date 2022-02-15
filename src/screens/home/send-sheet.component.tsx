import { BarCodeEvent } from 'expo-barcode-scanner';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import LottieView from 'lottie-react-native';
import moment from 'moment';
import { block, tools } from 'nanocurrency-web';
import React, { RefObject } from 'react';
import {
	Alert,
	Keyboard,
	Platform,
	StyleSheet,
	TouchableOpacity,
	View,
} from 'react-native';
import { Avatar } from 'react-native-elements';

import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';

import MyBottomSheet from '../../components/bottom-sheet.component';
import CurrencyInput from '../../components/currency-input.component';
import Link from '../../components/link.component';
import NalliButton from '../../components/nalli-button.component';
import NalliInput from '../../components/nalli-input.component';
import NalliNanoAddress from '../../components/nano-address.component';
import QRCodeScanner from '../../components/qrcode-scanner.component';
import SelectedContact from '../../components/selected-contact.component';
import ShowHide from '../../components/show-hide.component';
import NalliText, { ETextSize } from '../../components/text.component';
import Colors from '../../constants/colors';
import layout from '../../constants/layout';
import ClientService from '../../service/client.service';
import ContactsService, { FormattedNumber } from '../../service/contacts.service';
import CurrencyService from '../../service/currency.service';
import { Request } from '../../service/request.service';
import VariableStore, { NalliVariable } from '../../service/variable-store';
import WalletHandler from '../../service/wallet-handler.service';
import WalletStore from '../../service/wallet-store';
import WalletService, { EBlockSubType } from '../../service/wallet.service';
import ContactsModal from './contacts-modal.component';
import PhoneNumberInputModal from './number-input-modal.component';

export interface SendSheetProps {
	onSendSuccess?: (requestPaid: boolean) => void;
	reference: RefObject<any>;
}

export interface SendSheetState {
	contactsModalOpen: boolean;
	convertedAmount: string;
	currency: string;
	inputPhoneNumberModalOpen: boolean;
	isNalliUser: boolean;
	process: boolean;
	recipient: SendSheetRecipient;
	recipientAddress: string;
	recipientLastLoginDate: string;
	requestId: string;
	sendAmount: string;
	success: boolean;
	tab: SendSheetTab;
	walletAddress: string;
}

export interface SendSheetRecipient {
	initials: string;
	name: string;
	number: string;
	formattedNumber: string;
}

enum SendSheetTab {
	X0,
	CONTACT,
	PHONE,
	ADDRESS,
	DONATION,
}

export default class SendSheet extends React.Component<SendSheetProps, SendSheetState> {

	sendSheetRef: RefObject<any>;
	sendAmountRef: RefObject<any>;
	currencyInputRef: CurrencyInput;
	barcodeAlertActive = false;
	sendAnimation;
	sentAnimation;

	constructor(props: SendSheetProps) {
		super(props);
		this.sendAmountRef = React.createRef();
		this.sendSheetRef = props.reference;
		this.state = {
			contactsModalOpen: false,
			convertedAmount: '0',
			currency: 'xno',
			inputPhoneNumberModalOpen: false,
			isNalliUser: false,
			process: false,
			recipient: undefined,
			recipientAddress: undefined,
			recipientLastLoginDate: undefined,
			requestId: undefined,
			sendAmount: undefined,
			success: false,
			tab: SendSheetTab.CONTACT,
			walletAddress: '',
		};
	}

	componentDidMount = () => {
		this.init();
	}

	init = async () => {
		const tab = await VariableStore.getVariable(NalliVariable.SEND_TAB, SendSheetTab.CONTACT);
		this.setState({ tab });
	}

	toggleDonate = async (enable: boolean) => {
		if (enable) {
			this.setState({ tab: SendSheetTab.DONATION, recipient: {} as SendSheetRecipient });
		} else {
			const tab = await VariableStore.getVariable(NalliVariable.SEND_TAB, SendSheetTab.CONTACT);
			this.setState({ tab });
			this.clearRecipient();
		}
	}

	fillWithRequest = async (request: Request) => {
		const contact = ContactsService.getContactByHash(request.phoneHash);
		let recipient: SendSheetRecipient;
		if (contact) {
			recipient = {
				formattedNumber: contact.formattedNumber,
				number: contact.fullNumber,
				initials: contact.initials,
				name: contact.name,
			};
		} else {
			recipient = {
				formattedNumber: '',
				number: '',
				initials: '?',
				name: 'Someone not in your contacts',
			};
		}

		const amount = CurrencyService.formatNanoAmount(Number(tools.convert(request.amount, 'RAW', 'NANO')));
		this.setState({
			tab: SendSheetTab.CONTACT,
			isNalliUser: true,
			recipientAddress: request.address,
			sendAmount: amount,
			recipient,
			requestId: request.requestId,
		}, () => {
			this.currencyInputRef.forceXno();
		});
	}

	onSwitchModePress = async (tab: number) => {
		if (this.state.tab != tab) {
			await VariableStore.setVariable(NalliVariable.SEND_TAB, tab);
			this.clearRecipient();
			this.setState({ tab });
		}
	}

	onChangeAddress = async (walletAddress: string | Promise<string>) => {
		if (typeof walletAddress != 'string') {
			walletAddress = await walletAddress;
			if (!tools.validateAddress(walletAddress)) {
				Alert.alert('Error', 'Clipboard did not contain a valid Nano address');
				return;
			}
		}
		this.setState({ walletAddress });
	}

	onQRCodeScanned = (params: BarCodeEvent): boolean => {
		const address = params.data.replace('nano:', '');
		if (!tools.validateAddress(address)) {
			if (!this.barcodeAlertActive) {
				this.barcodeAlertActive = true;
				Alert.alert(
					'Error',
					'The QR code does not contain a valid Nano address',
					[
						{
							text: 'OK',
							onPress: () => this.barcodeAlertActive = false,
						},
					],
				);
			}
			return false;
		}
		this.setState({ walletAddress: address });
		return true;
	}

	onSelectRecipientPress = async () => {
		Keyboard.dismiss();
		this.setState({ contactsModalOpen: true });
	}

	onConfirmRecipient = async (contact) => {
		Keyboard.dismiss();
		if (contact) {
			const recipient = await ClientService.getClientAddress(contact.fullNumber);
			let address;
			let isNalliUser = false;
			let recipientLastLoginDate;

			// If client is not registered, create a pending send to a custodial account
			if (!recipient) {
				const pendingSend = await WalletService.createPendingSend(contact.fullNumber);
				address = pendingSend.address;
			} else {
				address = recipient.address;
				isNalliUser = recipient.nalliUser;
				recipientLastLoginDate = recipient.lastLogin;
			}

			this.setState({
				contactsModalOpen: false,
				isNalliUser,
				recipient: contact,
				recipientAddress: address,
				recipientLastLoginDate,
			});
		} else {
			this.clearRecipient();
		}
	}

	onSelectInputNumberPress = () => {
		Keyboard.dismiss();
		this.setState({ inputPhoneNumberModalOpen: true });
	}

	onConfirmNumber = async (number: FormattedNumber) => {
		Keyboard.dismiss();
		if (number) {
			const recipientAddress = await ClientService.getClientAddress(number.full);
			let address;
			let isNalliUser = false;

			// If no registered user found for address, create a pending send to a custodial account
			if (!recipientAddress) {
				const pendingSend = await WalletService.createPendingSend(number.full);
				address = pendingSend.address;
			} else {
				address = recipientAddress.address;
				isNalliUser = recipientAddress.nalliUser;
			}

			this.setState({
				recipient: {
					initials: '?',
					name: 'Unknown',
					number: number.full,
					formattedNumber: number.formatted,
				},
				recipientAddress: address,
				inputPhoneNumberModalOpen: false,
				isNalliUser,
			});
		} else {
			this.clearRecipient();
		}
	}

	clearRecipient = () => {
		this.setState({
			contactsModalOpen: false,
			inputPhoneNumberModalOpen: false,
			isNalliUser: false,
			recipient: undefined,
			recipientAddress: undefined,
			recipientLastLoginDate: undefined,
			requestId: undefined,
			walletAddress: undefined,
		});
	}

	clearState = () => {
		Keyboard.dismiss();
		this.setState({
			contactsModalOpen: false,
			inputPhoneNumberModalOpen: false,
			isNalliUser: false,
			recipient: undefined,
			recipientAddress: undefined,
			recipientLastLoginDate: undefined,
			requestId: undefined,
			walletAddress: undefined,
			process: false,
			success: false,
			sendAmount: undefined,
			convertedAmount: '0',
		});
		this.init();
	}

	confirm = () => {
		const sendAmount = this.state.currency == 'xno'
				? this.state.sendAmount
				: this.state.convertedAmount;

		if (sendAmount == '0') {
			Alert.alert('Error', 'Please enter an amount to send');
			return;
		}

		const message = `You are sending Ӿ\xa0${sendAmount} to ${this.getRecipientText()}`;

		Alert.alert(
			'Confirm',
			message,
			[
				{
					text: 'Confirm',
					onPress: this.send,
					style: 'default',
				}, {
					text: 'Cancel',
					onPress: () => undefined,
					style: 'cancel',
				},
			],
		);
	}

	send = async () => {
		Keyboard.dismiss();

		let recipientAddress;
		if (this.state.tab == SendSheetTab.CONTACT || this.state.tab == SendSheetTab.PHONE) {
			recipientAddress = this.state.recipientAddress;
		} else if (this.state.tab == SendSheetTab.DONATION) {
			recipientAddress = 'nano_1iic4ggaxy3eyg89xmswhj1r5j9uj66beka8qjcte11bs6uc3wdwr7i9hepm';
		} else {
			recipientAddress = this.state.walletAddress;
		}

		const sendAmount = this.state.currency == 'xno'
				? this.state.sendAmount
				: this.state.convertedAmount;

		try {
			const wallet = await WalletStore.getWallet();
			const selectedAccountIndex = await VariableStore.getVariable<number>(NalliVariable.SELECTED_ACCOUNT_INDEX, 0);
			const walletInfo = await WalletService.getWalletInfoAddress(wallet.accounts[selectedAccountIndex].address);
			const selectedAccount = await VariableStore.getVariable<string>(NalliVariable.SELECTED_ACCOUNT);

			if (walletInfo.address != selectedAccount) {
				Alert.alert('Error', 'State mismatch, restarting the app might help');
				this.setState({ process: false });
				return;
			}

			const balance = Number(tools.convert(walletInfo.balance, 'RAW', 'NANO'));
			if (Number(sendAmount) > balance) {
				Alert.alert('Error', 'Insufficent funds');
				this.setState({ process: false });
				return;
			}

			this.setState({ process: true, success: false });

			const signedBlock = block.send({
				amountRaw: tools.convert(sendAmount, 'NANO', 'RAW'),
				fromAddress: walletInfo.address,
				toAddress: recipientAddress,
				frontier: walletInfo.frontier,
				representativeAddress: walletInfo.representativeAddress,
				walletBalanceRaw: walletInfo.balance,
				work: walletInfo.work,
			}, wallet.accounts[selectedAccountIndex].privateKey);

			await WalletService.publishTransaction({
				subtype: EBlockSubType.SEND,
				requestId: this.state.requestId,
				block: signedBlock,
			});
		} catch {
			Alert.alert('Error', 'Something went wrong. Please try again.');
			this.setState({ process: false });
			return;
		}

		this.setState({ success: true });
		this.props.onSendSuccess(!!this.state.requestId);
		WalletHandler.getAccountsBalancesAndHandlePending();
		await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
	}

	getRecipientText = (): string => {
		return this.state.tab == SendSheetTab.CONTACT
				? this.state.recipient.name
				: this.state.tab == SendSheetTab.PHONE
					? this.state.recipient.formattedNumber
					: this.state.tab == SendSheetTab.DONATION
						? 'Nalli donations'
						: this.state.walletAddress;
	}

	render = () => {
		const { reference } = this.props;
		const {
			contactsModalOpen,
			convertedAmount,
			inputPhoneNumberModalOpen,
			isNalliUser,
			process,
			recipient,
			recipientAddress,
			recipientLastLoginDate,
			requestId,
			sendAmount,
			success,
			tab,
			walletAddress,
		} = this.state;

		const recipientLastLoginOverMonthAgo = moment(recipientLastLoginDate).isBefore(moment().subtract(1, 'month'));

		let recipientText;
		if (success) {
			if (tab == SendSheetTab.ADDRESS) {
				recipientText = <NalliNanoAddress style={{ textAlign: 'center' }}>{walletAddress}</NalliNanoAddress>;
			} else {
				recipientText = this.getRecipientText();
			}
		}

		let header = '';
		if (requestId) {
			header = 'Accept request';
		} else if (!process) {
			header = 'Send';
		}

		return (
			<MyBottomSheet
					initialSnap={-1}
					reference={reference}
					enablePanDownToClose={!process || success}
					enableLinearGradient
					onClose={this.clearState}
					snapPoints={layout.isSmallDevice ? ['88%'] : ['71.5%']}
					header={header}>
				{process &&
					<View style={styles.sendingContainer}>
						<View style={styles.animationContainer}>
							{success &&
								<LottieView
										ref={animation => {
											this.sendAnimation = animation;
										}}
										onLayout={() => this.sendAnimation.play()}
										loop={false}
										resizeMode='cover'
										source={require('../../assets/lottie/sent.json')} />
							}
							{!success &&
								<LottieView
										ref={animation => {
											this.sendAnimation = animation;
										}}
										onLayout={() => this.sendAnimation.play()}
										loop
										resizeMode='contain'
										source={require('../../assets/lottie/sending.json')} />
							}
						</View>
						{success &&
							<View style={styles.successTextContainer}>
								<NalliText style={styles.successText}>You sent <NalliText style={[styles.successText, styles.successTextColor]}>Ӿ {sendAmount}</NalliText></NalliText>
								<NalliText style={styles.successText}>to <NalliText style={[styles.successText, styles.successTextColor]}>{recipientText}</NalliText></NalliText>
							</View>
						}
						{success &&
							<View style={styles.sendTransactionButton}>
								<NalliButton
										text={'Close'}
										solid
										onPress={() => (this.clearState(), this.sendSheetRef.current.close())} />
							</View>
						}
					</View>
				}
				{!process &&
					<View style={styles.transactionSheetContent}>
						<BottomSheetScrollView keyboardDismissMode={'interactive'}>
							<View style={styles.transactionMoneyInputContainer}>
								<CurrencyInput
										disabled={!!requestId}
										ref={c => this.currencyInputRef = c}
										value={sendAmount}
										convertedValue={convertedAmount}
										reference={this.sendAmountRef}
										onChangeText={(sendAmount: string, convertedAmount: string, currency: string) =>
												this.setState({ sendAmount, convertedAmount, currency })} />
							</View>
							{(tab != SendSheetTab.DONATION && !requestId) && // Don't show different options for donations
								<View style={styles.tabs}>
									<TouchableOpacity
											style={[styles.switchButton, (tab == SendSheetTab.CONTACT ? styles.selected : undefined)]}
											onPress={() => this.onSwitchModePress(SendSheetTab.CONTACT)}>
										<NalliText size={ETextSize.H2} style={styles.switchButtonText}>Contact</NalliText>
									</TouchableOpacity>

									<TouchableOpacity
											style={[styles.switchButton, (tab == SendSheetTab.PHONE ? styles.selected : undefined)]}
											onPress={() => this.onSwitchModePress(SendSheetTab.PHONE)}>
										<NalliText size={ETextSize.H2} style={styles.switchButtonText}>Number</NalliText>
									</TouchableOpacity>

									<TouchableOpacity
											style={[styles.switchButton, (tab == SendSheetTab.ADDRESS ? styles.selected : undefined)]}
											onPress={() => this.onSwitchModePress(SendSheetTab.ADDRESS)}>
										<NalliText size={ETextSize.H2} style={styles.switchButtonText}>Address</NalliText>
									</TouchableOpacity>
								</View>
							}

							{tab == SendSheetTab.CONTACT && !recipient &&
								<NalliButton
										text='Select contact'
										icon='md-person'
										onPress={this.onSelectRecipientPress} />
							}
							{tab == SendSheetTab.CONTACT && recipient &&
								<SelectedContact
										contact={recipient}
										isNalliUser={isNalliUser}
										lastLoginDate={recipientLastLoginDate}
										disableSwap={!!requestId}
										onSwapPress={this.onSelectRecipientPress} />
							}
							{tab == SendSheetTab.PHONE && !recipient &&
								<NalliButton
										text='Input phone number'
										icon='md-person'
										onPress={this.onSelectInputNumberPress} />
							}
							{tab == SendSheetTab.PHONE && recipient &&
								<SelectedContact
										contact={recipient}
										isNalliUser={isNalliUser}
										lastLoginDate={recipientLastLoginDate}
										onSwapPress={this.onSelectInputNumberPress} />
							}
							{tab == SendSheetTab.ADDRESS &&
								<View style={styles.addressView}>
									<View>
										{!!walletAddress &&
											<TouchableOpacity
													onPress={() => this.onChangeAddress('')}>
												<MaterialIcons
														name='close'
														size={23} />
											</TouchableOpacity>
										}
										{!walletAddress &&
											<TouchableOpacity
													onPress={() => this.onChangeAddress(Clipboard.getStringAsync())}>
												<Ionicons
														name='ios-copy'
														size={30} />
											</TouchableOpacity>
										}
									</View>
									<NalliInput
											style={styles.addressInput}
											value={walletAddress}
											readonly
											label='Address'
											multiline
											onChangeText={this.onChangeAddress} />
									<QRCodeScanner
											onQRCodeScanned={this.onQRCodeScanned} />
								</View>
							}
							{tab == SendSheetTab.DONATION &&
								<View style={styles.contactContainer}>
									<Avatar
											icon={{ name: 'star-border', type: 'material' }}
											rounded
											size='medium'
											titleStyle={{ fontSize: 16 }}
											containerStyle={{ marginRight: 15 }}
											overlayContainerStyle={{ backgroundColor: Colors.main }} />
									<View>
										<NalliText size={ETextSize.H2} style={styles.contactName}>
											Nalli donation
										</NalliText>
										<NalliText>
											We really appreciate your help!
										</NalliText>
									</View>
									<TouchableOpacity
											onPress={() => this.toggleDonate(false)}
											style={styles.contactSelectArrow}>
										<MaterialIcons
												name='close'
												size={23} />
									</TouchableOpacity>
								</View>
							}

							{!!recipient && (tab == SendSheetTab.CONTACT || tab == SendSheetTab.PHONE) &&
								<View style={{ marginTop: 10 }}>
									<ShowHide showText='Show details' hideText='Hide details'>
										<View>
											<NalliText size={ETextSize.H2}>Recipient address</NalliText>
											<Link url={`https://nanolooker.com/account/${recipientAddress}`}>{recipientAddress}</Link>
											{!isNalliUser &&
												<NalliText>This is a temporary address. The amount will be transferred to the recipient when they register an account. You are able to cancel the transaction if the recipient doesn't register.</NalliText>
											}
											{recipientLastLoginOverMonthAgo &&
												<NalliText>This user hasn't opened Nalli for some time. Make sure that they are still have control of this account.</NalliText>
											}
										</View>
									</ShowHide>
								</View>
							}
						</BottomSheetScrollView>
						{(recipient || !!walletAddress) &&
							<View style={styles.sendTransactionButton}>
								<NalliButton
										text={tab == SendSheetTab.DONATION ? 'Donate' : (!!walletAddress || isNalliUser) ? 'Send' : 'Invite new user'}
										solid
										onPress={this.confirm}
										disabled={(!recipient && !walletAddress) || !sendAmount || process} />
							</View>
						}
						<ContactsModal
								isOpen={contactsModalOpen}
								onSelectContact={this.onConfirmRecipient} />
						<PhoneNumberInputModal
								isOpen={inputPhoneNumberModalOpen}
								onConfirmNumber={this.onConfirmNumber} />
					</View>
				}
			</MyBottomSheet>
		);
	}

}

const styles = StyleSheet.create({
	sendingContainer: {
		width: '100%',
		height: '100%',
	},
	animationContainer: {
		alignSelf: 'center',
		width: '80%',
		height: '50%',
		flexDirection: 'row',
	},
	successTextContainer: {
		alignSelf: 'center',
		paddingHorizontal: layout.window.width * 0.18,
	},
	successText: {
		textAlign: 'center',
		fontSize: 18,
	},
	successTextColor: {
		color: Colors.main,
		fontFamily: 'OpenSansBold',
	},
	transactionSheetContent: {
		paddingHorizontal: 15,
		width: '100%',
		height: '100%',
	},
	transactionMoneyInputContainer: {
		justifyContent: 'center',
		marginBottom: 20,
	},
	tabs: {
		marginBottom: 25,
		display: 'flex',
		flexDirection: 'row',
	},
	switchButton: {
		paddingHorizontal: 13,
		paddingVertical: 5,
		marginRight: 4,
	},
	switchButtonText: {
		fontSize: 18,
	},
	selected: {
		borderColor: Colors.main,
		borderBottomWidth: 3,
	},
	contactContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 15,
		borderBottomWidth: 1,
		borderBottomColor: Colors.borderColor,
	},
	contactName: {
		color: Colors.main,
	},
	online: {
		backgroundColor: 'forestgreen',
		width: 6,
		height: 6,
		marginRight: 3,
		borderRadius: 30,
	},
	offline: {
		backgroundColor: Colors.main,
		width: 6,
		height: 6,
		marginRight: 3,
		borderRadius: 30,
	},
	incativeUserWarning: {
		color: Colors.shadowColor,
		fontSize: 8,
	},
	contactSelectArrow: {
		color: Colors.main,
		marginLeft: 'auto',
	},
	addressView: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	addressInput: {
		width: layout.window.width * 0.70,
		fontSize: 14,
		lineHeight: 20,
		paddingTop: 10,
		height: 85,
	},
	sendTransactionButton: {
		marginTop: 'auto',
		paddingHorizontal: 17,
		...Platform.select({
			android: {
				marginBottom: 95,
			},
			ios: {
				marginBottom: 55,
			},
		}),
	},
});
