import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import LottieView from 'lottie-react-native';
import { tools } from 'nanocurrency-web';
import React, { RefObject } from 'react';
import {
	Alert,
	EmitterSubscription,
	Keyboard,
	StyleSheet,
	TouchableOpacity,
} from 'react-native';

import { BottomSheetScrollView, BottomSheetView } from '@gorhom/bottom-sheet';

import MyBottomSheet from '../../components/bottom-sheet.component';
import CurrencyInput from '../../components/currency-input.component';
import NalliIcon, { IconType } from '../../components/icon.component';
import NalliButton from '../../components/nalli-button.component';
import NalliInput from '../../components/nalli-input.component';
import NalliNanoAddress from '../../components/nano-address.component';
import QRCode from '../../components/qrcode/qrcode.component';
import SelectedContact from '../../components/selected-contact.component';
import NalliText, { ETextSize } from '../../components/text.component';
import Colors from '../../constants/colors';
import layout from '../../constants/layout';
import AuthStore from '../../service/auth-store';
import ClientService from '../../service/client.service';
import RequestService from '../../service/request.service';
import VariableStore, { NalliVariable } from '../../service/variable-store';
import ContactsModal from './contacts-modal.component';
import { SendSheetRecipient } from './send-sheet.component';

const logo = require('../../assets/images/icon.png');

export interface RequestSheetProps {
}

export interface RequestSheetState {
	address: string;
	contactsModalOpen: boolean;
	convertedAmount: string;
	currency: string;
	isNalliUser: boolean;
	isPhoneNumberUser: boolean;
	message: string;
	process: boolean;
	recipient: SendSheetRecipient;
	recipientAddress: string;
	recipientId: string;
	recipientLastLoginDate: string;
	requestAmount: string;
	requestMode: RequestMode;
	showCopiedText: boolean;
	success: boolean;
}

enum RequestMode {
	CONTACT,
	QR,
}

export default class RequestSheet extends React.PureComponent<RequestSheetProps, RequestSheetState> {

	requestSheetRef: RefObject<any>;
	sendAnimation;
	subscriptions: EmitterSubscription[] = [];

	constructor(props) {
		super(props);
		this.requestSheetRef = React.createRef();
		this.state = {
			address: '',
			contactsModalOpen: false,
			convertedAmount: '0',
			currency: 'xno',
			isNalliUser: false,
			isPhoneNumberUser: false,
			message: '',
			process: false,
			recipient: undefined,
			recipientAddress: undefined,
			recipientId: '',
			recipientLastLoginDate: undefined,
			requestAmount: undefined,
			requestMode: RequestMode.CONTACT,
			showCopiedText: false,
			success: false,
		};
	}

	componentDidMount = () => {
		this.init();
		this.subscriptions.push(VariableStore.watchVariable(NalliVariable.SELECTED_ACCOUNT, () => this.init()));
	}

	componentWillUnmount = () => {
		this.subscriptions.forEach(VariableStore.unwatchVariable);
	}

	async init() {
		const address = await VariableStore.getVariable<string>(NalliVariable.SELECTED_ACCOUNT);
		const isPhoneNumberUser = await AuthStore.isPhoneNumberFunctionsEnabled();
		let requestMode;
		if (isPhoneNumberUser) {
			requestMode = await VariableStore.getVariable<RequestMode>(NalliVariable.SELECTED_REQUEST_MODE, RequestMode.CONTACT);
		} else {
			requestMode = RequestMode.QR;
		}

		this.setState({ address, requestMode, isPhoneNumberUser });
	}

	open = () => {
		this.requestSheetRef.current.snapToIndex(0);
	}

	onCopyPress = (address: string) => {
		if (!this.state.showCopiedText) {
			Clipboard.setString(address);
			this.setState({ showCopiedText: true });
			setTimeout(() => this.setState({ showCopiedText: false }), 1000);
		}
	}

	toggleRequestMode = () => {
		const newRequestMode = this.state.requestMode == RequestMode.QR ? RequestMode.CONTACT : RequestMode.QR;
		VariableStore.setVariable(NalliVariable.SELECTED_REQUEST_MODE, newRequestMode);
		this.setState({ requestMode: newRequestMode });
		this.clearRecipient();
	}

	onSelectRecipientPress = async () => {
		Keyboard.dismiss();
		this.setState({ contactsModalOpen: true });
	}

	onConfirmRecipient = async (selectedContact) => {
		Keyboard.dismiss();
		if (selectedContact) {
			const recipient = await ClientService.getClientAddress(selectedContact.fullNumber);
			let address;
			let isNalliUser = false;
			let recipientLastLoginDate;
			let recipientId;

			// If client is not registered, create a pending send to a custodial account
			if (!recipient || !recipient.nalliUser) {
				this.clearRecipient();
				return;
			} else {
				address = recipient.address;
				recipientId = recipient.id;
				isNalliUser = recipient.nalliUser;
				recipientLastLoginDate = recipient.lastLogin;
			}

			this.setState({
				contactsModalOpen: false,
				recipientId,
				isNalliUser,
				recipient: selectedContact,
				recipientAddress: address,
				recipientLastLoginDate,
			});
		} else {
			this.clearRecipient();
		}
	}

	clearRecipient = () => {
		this.setState({
			contactsModalOpen: false,
			isNalliUser: false,
			message: '',
			recipient: undefined,
			recipientAddress: undefined,
			recipientId: undefined,
			recipientLastLoginDate: undefined,
		});
	}

	clearState = () => {
		Keyboard.dismiss();
		this.setState({
			contactsModalOpen: false,
			convertedAmount: '0',
			isNalliUser: false,
			message: '',
			process: false,
			recipient: undefined,
			recipientAddress: undefined,
			recipientId: undefined,
			recipientLastLoginDate: undefined,
			requestAmount: undefined,
			success: false,
		});
	}

	updateMessage = (message: string) => {
		this.setState({ message });
	}

	confirmRequest = () => {
		const sendAmount = this.state.currency == 'xno'
				? this.state.requestAmount
				: this.state.convertedAmount;

		if (sendAmount == '0') {
			Alert.alert('Error', 'Please enter an amount to send');
			return;
		}

		const message = `You are requesting Ӿ\xa0${sendAmount} from ${this.state.recipient.name}`;

		Alert.alert(
			'Confirm',
			message,
			[
				{
					text: 'Confirm',
					onPress: this.sendRequest,
					style: 'default',
				}, {
					text: 'Cancel',
					onPress: () => undefined,
					style: 'cancel',
				},
			],
		);
	}

	sendRequest = async () => {
		this.setState({ process: true });
		const converted = tools.convert(this.state.requestAmount, 'NANO', 'RAW');
		await RequestService.newRequest({
			amount: converted,
			message: this.state.message,
			recipientId: this.state.recipientId,
		});
		this.setState({ success: true, process: false });
		await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
	}

	render = () => {
		const {
			address,
			contactsModalOpen,
			convertedAmount,
			isNalliUser,
			isPhoneNumberUser,
			message,
			process,
			recipient,
			recipientLastLoginDate,
			requestAmount,
			requestMode,
			showCopiedText,
			success,
		} = this.state;

		const header = success ? '' : 'Request';

		let view;
		if (success) {
			view = (
				<BottomSheetView style={styles.sheetContent}>
					<BottomSheetView style={styles.animationContainer}>
						<LottieView
								ref={animation => {
									this.sendAnimation = animation;
								}}
								onLayout={() => this.sendAnimation.play()}
								loop={false}
								resizeMode='cover'
								source={require('../../assets/lottie/sent.json')} />
					</BottomSheetView>
					<BottomSheetView style={styles.successTextContainer}>
						<NalliText style={styles.successText}>You requested <NalliText style={[styles.successText, styles.successTextColor]}>Ӿ&nbsp;{requestAmount}</NalliText></NalliText>
						<NalliText style={styles.successText}>from <NalliText style={[styles.successText, styles.successTextColor]}>{recipient.name}</NalliText></NalliText>
					</BottomSheetView>
					<BottomSheetView style={styles.confirmButton}>
						<NalliButton
								text={'Close'}
								solid
								onPress={() => (this.clearState(), this.requestSheetRef.current.close())} />
					</BottomSheetView>
				</BottomSheetView>
			);
		} else {
			if (requestMode == RequestMode.QR) {
				view = (
					<BottomSheetScrollView keyboardDismissMode={'interactive'} style={styles.sheetContent}>
						<BottomSheetView style={styles.qrcodeContainer}>
							<NalliText style={styles.text}>
								Scan the QR-code below to send Nano to this wallet
							</NalliText>
							<BottomSheetView style={styles.qrcode}>
								<QRCode
										value={`nano:${address}`}
										logo={logo}
										logoBorderRadius={0}
										quietZone={4}
										size={200} />
							</BottomSheetView>
							<NalliNanoAddress
									contentContainerStyle={styles.addressContainer}
									style={styles.text}>
								{address}
							</NalliNanoAddress>
							<NalliButton
									small
									icon='ios-copy'
									text={showCopiedText ? 'Copied' : 'Copy address'}
									style={styles.copyButton}
									onPress={() => this.onCopyPress(address)} />
						</BottomSheetView>
					</BottomSheetScrollView>
				);
			} else {
				view = (
					<BottomSheetView style={styles.sheetContent}>
						<BottomSheetScrollView keyboardDismissMode={'interactive'}>
							<BottomSheetView style={styles.amountContainer}>
								<CurrencyInput
										value={requestAmount}
										convertedValue={convertedAmount}
										hideMaxButton
										onChangeText={(requestAmount: string, convertedAmount: string, currency: string) =>
												this.setState({ requestAmount: requestAmount, convertedAmount, currency })} />
							</BottomSheetView>
							<NalliInput
									style={styles.messageInput}
									value={message}
									maxLength={64}
									onChangeText={this.updateMessage}
									label='Message' />
							<NalliText size={ETextSize.H2}>From</NalliText>
							{!recipient &&
								<NalliButton
										style={styles.selectRecipientButton}
										text='Select contact'
										icon='md-person'
										onPress={this.onSelectRecipientPress} />
							}
							{recipient &&
								<SelectedContact
										contact={recipient}
										isNalliUser={isNalliUser}
										lastLoginDate={recipientLastLoginDate}
										onSwapPress={this.onSelectRecipientPress} />
							}
						</BottomSheetScrollView>
						{/* {recipient && */}
							<BottomSheetView style={styles.confirmButton}>
								<NalliButton
										text='Request'
										solid
										onPress={this.confirmRequest}
										disabled={!recipient || !requestAmount || process} />
							</BottomSheetView>
						{/* } */}
						<ContactsModal
								isOpen={contactsModalOpen}
								onlyNalliUsers
								onSelectContact={this.onConfirmRecipient} />
					</BottomSheetView>
				)
			}
		}

		let headerIconComponent;
		if (!success && isPhoneNumberUser) {
			headerIconComponent = (
				<TouchableOpacity
						style={styles.toggleRequestModeButton}
						onPress={this.toggleRequestMode}>
					{requestMode == RequestMode.CONTACT &&
						<NalliIcon icon='qrcode' size={22} type={IconType.FONT_AWESOME} />
					}
					{requestMode == RequestMode.QR &&
						<NalliIcon icon='person' size={16} type={IconType.ION} />
					}
				</TouchableOpacity>
			);
		} else {
			headerIconComponent = null;
		}

		return (
			<MyBottomSheet
					initialSnap={-1}
					reference={this.requestSheetRef}
					enablePanDownToClose={!process}
					enableLinearGradient
					snapPoints={['88%']}
					header={header}
					onClose={this.clearState}
					headerIconComponent={headerIconComponent}>
				{view}
			</MyBottomSheet>
		);
	}

}

const styles = StyleSheet.create({
	animationContainer: {
		alignSelf: 'center',
		width: layout.window.width * 0.8,
		height: layout.window.width * 0.8,
		flexDirection: 'row',
		paddingHorizontal: -15,
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
	sheetContent: {
		width: '100%',
		height: '100%',
		paddingHorizontal: 15,
	},
	qrcodeContainer: {
		paddingTop: 20,
	},
	toggleRequestModeButton: {
		padding: 7,
		backgroundColor: Colors.borderColor,
		borderRadius: 30,
		width: 35,
		height: 35,
		alignItems: 'center',
		justifyContent: 'center',
	},
	text: {
		textAlign: 'center',
	},
	amountContainer: {
		justifyContent: 'center',
		marginBottom: 20,
		marginTop: 10,
	},
	selectRecipientButton: {
		marginTop: 10,
	},
	messageInput: {
		fontSize: 16,
		lineHeight: 25,
		paddingTop: 10,
		height: 55,
	},
	confirmButton: {
		position: 'absolute',
		bottom: 45,
		left: 15,
		width: '100%',
	},
	qrcode: {
		alignSelf: 'center',
		borderWidth: 6,
		borderColor: Colors.main,
		marginVertical: 15,
	},
	copyButton: {
		marginTop: 10,
		width: '50%',
		alignSelf: 'center',
	},
	addressContainer: {
		borderWidth: 1,
		borderRadius: 15,
		borderColor: Colors.borderColor,
		padding: 10,
		marginHorizontal: layout.window.width * 0.15,
	},
});
