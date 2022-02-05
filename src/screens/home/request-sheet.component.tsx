import * as Clipboard from 'expo-clipboard';
import React, { RefObject } from 'react';
import {
	EmitterSubscription,
	Keyboard,
	StyleSheet,
	TouchableOpacity,
	View,
} from 'react-native';

import { FontAwesome, Ionicons } from '@expo/vector-icons';
import { BottomSheetScrollView } from '@gorhom/bottom-sheet';

import MyBottomSheet from '../../components/bottom-sheet.component';
import CurrencyInput from '../../components/currency-input.component';
import NalliButton from '../../components/nalli-button.component';
import NalliNanoAddress from '../../components/nano-address.component';
import QRCode from '../../components/qrcode/qrcode.component';
import NalliText, { ETextSize } from '../../components/text.component';
import Colors from '../../constants/colors';
import layout from '../../constants/layout';
import VariableStore, { NalliVariable } from '../../service/variable-store';
import ContactsModal from './contacts-modal.component';

const logo = require('../../assets/images/icon.png');

export interface RequestSheetProps {
	reference: RefObject<any>;
}

export interface RequestSheetState {
	address: string;
	contactsModalOpen: boolean;
	convertedAmount: string;
	currency: string;
	requestAmount: string;
	requestMode: RequestMode;
	showCopiedText: boolean;
}

enum RequestMode {
	CONTACT,
	QR,
}

export default class RequestSheet extends React.Component<RequestSheetProps, RequestSheetState> {

	subscriptions: EmitterSubscription[] = [];

	constructor(props) {
		super(props);
		this.state = {
			address: '',
			contactsModalOpen: false,
			convertedAmount: '0',
			currency: 'xno',
			requestAmount: undefined,
			requestMode: RequestMode.CONTACT,
			showCopiedText: false,
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
		const requestMode = await VariableStore.getVariable<RequestMode>(NalliVariable.SELECTED_REQUEST_MODE, RequestMode.CONTACT);
		this.setState({ address, requestMode: requestMode });
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
	}

	onSelectRecipientPress = async () => {
		Keyboard.dismiss();
		this.setState({ contactsModalOpen: true });
	}

	onConfirmRecipient = async (contact) => {
		this.setState({ contactsModalOpen: false });
	}

	render = () => {
		const { reference } = this.props;
		const {
			address,
			contactsModalOpen,
			convertedAmount,
			currency,
			requestAmount,
			requestMode,
			showCopiedText,
		} = this.state;

		let view;
		if (requestMode == RequestMode.QR) {
			view = (
				<View style={styles.qrcodeContainer}>
					<NalliText style={styles.text}>
						Scan the QR-code below to send funds to this wallet
					</NalliText>
					<View style={styles.qrcode}>
						<QRCode
								value={`nano:${address}`}
								logo={logo}
								logoBorderRadius={0}
								quietZone={4}
								size={200} />
					</View>
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
				</View>
			);
		} else {
			view = (
				<View style={styles.requestContainer}>
					<View style={styles.amountContainer}>
						<CurrencyInput
								value={requestAmount}
								convertedValue={convertedAmount}
								hideMaxButton
								onChangeText={(requestAmount: string, convertedAmount: string, currency: string) =>
										this.setState({ requestAmount: requestAmount, convertedAmount, currency })} />
					</View>
					<NalliText size={ETextSize.H2}>From</NalliText>
					<NalliButton
							text='Select contact'
							icon='md-person'
							onPress={this.onSelectRecipientPress} />
					<ContactsModal
							isOpen={contactsModalOpen}
							onSelectContact={this.onConfirmRecipient} />
				</View>
			)
		}

		return (
			<MyBottomSheet
					initialSnap={-1}
					reference={reference}
					enablePanDownToClose
					enableLinearGradient
					snapPoints={layout.isSmallDevice ? ['88%'] : ['68%']}
					header='Request'
					headerIconComponent={(
						<TouchableOpacity
								style={styles.toggleRequestModeButton}
								onPress={this.toggleRequestMode}>
							{requestMode == RequestMode.CONTACT &&
								<FontAwesome
										size={22}
										name='qrcode' />
							}
							{requestMode == RequestMode.QR &&
								<Ionicons
										size={16}
										name='person' />
							}
						</TouchableOpacity>
					)}>
				<BottomSheetScrollView keyboardDismissMode={'interactive'} style={styles.transactionSheetContent}>
					{view}
				</BottomSheetScrollView>
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
	requestContainer: {
		width: '100%',
		height: '100%',
	},
	amountContainer: {
		justifyContent: 'center',
		marginBottom: 20,
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
