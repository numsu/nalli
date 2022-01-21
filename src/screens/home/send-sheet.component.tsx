import { BarCodeEvent } from 'expo-barcode-scanner';
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
import { Clipboard } from 'react-native'
import { Avatar } from 'react-native-elements';

import { Ionicons, MaterialIcons } from '@expo/vector-icons';

import NalliBadge from '../../components/badge.component';
import MyBottomSheet from '../../components/bottom-sheet.component';
import CurrencyInput from '../../components/currency-input.component';
import DismissKeyboardView from '../../components/dismiss-keyboard-hoc.component';
import Link from '../../components/link.component';
import NalliButton from '../../components/nalli-button.component';
import NalliInput from '../../components/nalli-input.component';
import QRCodeScanner from '../../components/qrcode-scanner.component';
import ShowHide from '../../components/show-hide.component';
import NalliText, { ETextSize } from '../../components/text.component';
import Colors from '../../constants/colors';
import layout from '../../constants/layout';
import ClientService from '../../service/client.service';
import ContactsService, { FormattedNumber } from '../../service/contacts.service';
import VariableStore, { NalliVariable } from '../../service/variable-store';
import WalletStore from '../../service/wallet-store';
import WalletService, { EBlockSubType } from '../../service/wallet.service';
import ContactsModal from './contacts-modal.component';
import PhoneNumberInputModal from './number-input-modal.component';

export interface SendSheetProps {
	onSendSuccess: () => void;
	reference: RefObject<any>;
}

export interface SendSheetState {
	contacts: any[];
	contactsModalOpen: boolean;
	convertedAmount: string;
	currency: string;
	inputPhoneNumberModalOpen: boolean;
	isNalliUser: boolean;
	process: boolean;
	recipient: SendSheetRecipient;
	recipientAddress: string;
	sendAmount: string;
	tab: SendSheetTab;
	walletAddress: string;
}

interface SendSheetRecipient {
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

	sendAmountRef: RefObject<any>;
	barcodeAlertActive = false;

	constructor(props) {
		super(props);
		this.sendAmountRef = React.createRef();
		this.state = {
			contacts: [],
			contactsModalOpen: false,
			convertedAmount: '0',
			currency: 'xno',
			inputPhoneNumberModalOpen: false,
			isNalliUser: false,
			process: false,
			recipient: undefined,
			recipientAddress: undefined,
			sendAmount: undefined,
			tab: 1,
			walletAddress: '',
		};
	}

	componentDidMount = () => {
		this.init();
	}

	init = async () => {
		const tab = await VariableStore.getVariable(NalliVariable.SEND_TAB, SendSheetTab.CONTACT);
		const contacts = await ContactsService.getContacts(false);
		this.setState({ tab, contacts });
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
		if (this.state.contacts.length == 0) {
			const contacts = await ContactsService.getContacts();
			this.setState({ contacts: contacts, contactsModalOpen: contacts.length > 0 });
		} else {
			this.setState({ contactsModalOpen: true });
		}
	}

	onConfirmRecipient = async (contact) => {
		Keyboard.dismiss();
		if (contact) {
			const recipientAddress = await ClientService.getClientAddress(contact.fullNumber);
			let address;
			let isNalliUser = false;

			// If client is not registered, create a pending send to a custodial account
			if (!recipientAddress) {
				const pendingSend = await WalletService.createPendingSend(contact.fullNumber);
				address = pendingSend.address;
			} else {
				address = recipientAddress.address;
				isNalliUser = recipientAddress.nalliUser;
			}

			this.setState({
				contactsModalOpen: false,
				recipient: contact,
				recipientAddress: address,
				isNalliUser,
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
			walletAddress: undefined,
		});
	}

	confirm = () => {
		const sendAmount = this.state.currency == 'xno'
				? this.state.sendAmount
				: this.state.convertedAmount;

		if (sendAmount == '0') {
			Alert.alert('Error', 'Please enter an amount to send');
			return;
		}

		Alert.alert(
			'Confirm',
			this.state.tab == SendSheetTab.CONTACT // To a contact
					? `You are sending ${sendAmount} Nano to ${this.state.recipient.name}`
					: this.state.tab == SendSheetTab.PHONE // To phone number
						? `You are sending ${sendAmount} Nano to ${this.state.recipient.formattedNumber}`
						: this.state.tab == SendSheetTab.DONATION // Nalli donation
							? `You are donating ${sendAmount} Nano to Nalli`
							: `You are sending ${sendAmount} Nano to ${this.state.walletAddress}`,
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
		this.setState({ process: true });

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

		const signedBlock = block.send({
			amountRaw: tools.convert(sendAmount, 'NANO', 'RAW'),
			fromAddress: walletInfo.address,
			toAddress: recipientAddress,
			frontier: walletInfo.frontier,
			representativeAddress: walletInfo.representativeAddress,
			walletBalanceRaw: walletInfo.balance,
			work: walletInfo.work,
		}, wallet.accounts[selectedAccountIndex].privateKey);

		try {
			await WalletService.publishTransaction({
				subtype: EBlockSubType.SEND,
				block: signedBlock,
			});
		} catch {
			this.setState({ process: false });
			return;
		}

		this.setState({
			sendAmount: undefined,
			convertedAmount: '0',
			recipient: undefined,
			recipientAddress: undefined,
			walletAddress: undefined,
			process: false,
		});
		this.props.onSendSuccess();
	}

	render = () => {
		const { reference } = this.props;
		const {
			contacts,
			contactsModalOpen,
			convertedAmount,
			inputPhoneNumberModalOpen,
			isNalliUser,
			process,
			recipient,
			recipientAddress,
			sendAmount,
			tab,
			walletAddress,
		} = this.state;

		return (
			<MyBottomSheet
					initialSnap={-1}
					reference={reference}
					enablePanDownToClose={true}
					snapPoints={layout.isSmallDevice ? ['88%'] : ['68%']}
					header="Send">
				<DismissKeyboardView style={styles.transactionSheetContent}>
					<View style={styles.transactionMoneyInputContainer}>
						<CurrencyInput
								value={sendAmount}
								convertedValue={convertedAmount}
								reference={this.sendAmountRef}
								onChangeText={(sendAmount: string, convertedAmount: string, currency: string) =>
										this.setState({ sendAmount, convertedAmount, currency })} />
					</View>
					{tab != 4 && // Don't show different options for donations
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
								text="Select contact"
								icon="md-person"
								onPress={this.onSelectRecipientPress} />
					}
					{tab == SendSheetTab.CONTACT && recipient &&
						<View style={styles.contactContainer}>
							<Avatar
									rounded={true}
									title={recipient.initials}
									size="medium"
									titleStyle={{ fontSize: 18 }}
									containerStyle={{ marginRight: 15 }}
									overlayContainerStyle={{ backgroundColor: Colors.main }} />
							<View>
								<View style={{ flexDirection: 'row' }}>
									<NalliText size={ETextSize.H2} style={styles.contactName}>
										{recipient.name}
									</NalliText>
									{isNalliUser &&
										<NalliBadge>
											<View style={styles.online}></View>
											<NalliText>Nalli user</NalliText>
										</NalliBadge>
									}
									{!isNalliUser &&
										<NalliBadge>
											<View style={styles.offline}></View>
											<NalliText>New user</NalliText>
										</NalliBadge>
									}
								</View>
								<NalliText>
									{recipient.formattedNumber}
								</NalliText>
							</View>
							<TouchableOpacity
									onPress={this.onSelectRecipientPress}
									style={styles.contactSelectArrow}>
								<Ionicons
										name="ios-swap-horizontal"
										style={styles.contactSelectArrow}
										size={32} />
							</TouchableOpacity>
						</View>
					}
					{tab == SendSheetTab.PHONE && !recipient &&
						<NalliButton
								text="Input phone number"
								icon="md-person"
								onPress={this.onSelectInputNumberPress} />
					}
					{tab == SendSheetTab.PHONE && recipient &&
						<View style={styles.contactContainer}>
							<Avatar
									rounded={true}
									title={recipient.initials}
									size="medium"
									titleStyle={{ fontSize: 18 }}
									containerStyle={{ marginRight: 15 }}
									overlayContainerStyle={{ backgroundColor: Colors.main }} />
							<View>
								<View style={{ flexDirection: 'row' }}>
									<NalliText size={ETextSize.H2} style={styles.contactName}>
										{recipient.name}
									</NalliText>
									{isNalliUser &&
										<NalliBadge>
											<View style={styles.online}></View>
											<NalliText>Nalli user</NalliText>
										</NalliBadge>
									}
									{!isNalliUser &&
										<NalliBadge>
											<View style={styles.offline}></View>
											<NalliText>New user</NalliText>
										</NalliBadge>
									}
								</View>
								<NalliText>
									{recipient.formattedNumber}
								</NalliText>
							</View>
							<TouchableOpacity
									onPress={this.onSelectInputNumberPress}
									style={styles.contactSelectArrow}>
								<Ionicons
										name="ios-swap-horizontal"
										style={styles.contactSelectArrow}
										size={32} />
							</TouchableOpacity>
						</View>
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
											onPress={() => this.onChangeAddress(Clipboard.getString())}>
										<Ionicons
												name="ios-copy"
												size={30} />
									</TouchableOpacity>
								}
							</View>
							<NalliInput
									style={styles.addressInput}
									value={walletAddress}
									readonly={true}
									label='Address'
									multiline={true}
									onChangeText={this.onChangeAddress} />
							<QRCodeScanner
									onQRCodeScanned={this.onQRCodeScanned} />
						</View>
					}
					{tab == SendSheetTab.DONATION &&
						<View style={styles.contactContainer}>
							<Avatar
									icon={{ name: 'star-border', type: 'material' }}
									rounded={true}
									size="medium"
									titleStyle={{ fontSize: 18 }}
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
								</View>
							</ShowHide>
						</View>
					}

					{(recipient || !!walletAddress) &&
						<View style={styles.sendTransactionButton}>
							<NalliButton
								text={(!!walletAddress || isNalliUser) ? 'Send' : 'Invite new user'}
								solid={true}
								onPress={this.confirm}
								disabled={(!recipient && !walletAddress) || !sendAmount || process} />
						</View>
					}
				</DismissKeyboardView>
				<ContactsModal
						isOpen={contactsModalOpen}
						contacts={contacts}
						onSelectContact={this.onConfirmRecipient} />
				<PhoneNumberInputModal
						isOpen={inputPhoneNumberModalOpen}
						onConfirmNumber={this.onConfirmNumber} />
			</MyBottomSheet>
		);
	}

}

const styles = StyleSheet.create({
	transactionSheetContent: {
		backgroundColor: 'white',
		height: layout.isSmallDevice ? layout.window.height * 0.79 : layout.window.height * 0.62,
		paddingHorizontal: 15,
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
		fontSize: 20,
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
		fontSize: 16,
		lineHeight: 20,
		paddingTop: 10,
		height: 85,
	},
	sendTransactionButton: {
		marginTop: 'auto',
		...Platform.select({
			android: {
				marginBottom: 55,
			},
			ios: {
				marginBottom: 45,
			},
		}),
	},
});
