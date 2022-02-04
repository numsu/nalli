import * as Clipboard from 'expo-clipboard';
import React, { RefObject } from 'react';
import {
	EmitterSubscription,
	StyleSheet,
	View,
} from 'react-native';

import { BottomSheetScrollView } from '@gorhom/bottom-sheet';

import MyBottomSheet from '../../components/bottom-sheet.component';
import NalliButton from '../../components/nalli-button.component';
import NalliNanoAddress from '../../components/nano-address.component';
import QRCode from '../../components/qrcode/qrcode.component';
import NalliText from '../../components/text.component';
import Colors from '../../constants/colors';
import layout from '../../constants/layout';
import VariableStore, { NalliVariable } from '../../service/variable-store';

const logo = require('../../assets/images/icon.png');

export interface ReceiveSheetProps {
	reference: RefObject<any>;
}

export interface ReceiveSheetState {
	address: string;
	showCopiedText: boolean;
}

export default class ReceiveSheet extends React.Component<ReceiveSheetProps, ReceiveSheetState> {

	subscriptions: EmitterSubscription[] = [];

	constructor(props) {
		super(props);
		this.state = {
			address: '',
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
		this.setState({ address });
	}

	onCopyPress = (address: string) => {
		Clipboard.setString(address);
		this.setState({ showCopiedText: true });
		setTimeout(() => this.setState({ showCopiedText: false }), 1000);
	}

	render = () => {
		const { reference } = this.props;
		const { address, showCopiedText } = this.state;

		return (
			<MyBottomSheet
					initialSnap={-1}
					reference={reference}
					enablePanDownToClose={true}
					enableLinearGradient={true}
					snapPoints={layout.isSmallDevice ? ['88%'] : ['68%']}
					header="Receive">
				<BottomSheetScrollView keyboardDismissMode={'interactive'} style={styles.transactionSheetContent}>
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
							small={true}
							icon='ios-copy'
							text={showCopiedText ? 'Copied' : 'Copy address'}
							style={styles.copyButton}
							onPress={() => this.onCopyPress(address)} />
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
		paddingTop: 20,
	},
	text: {
		textAlign: 'center',
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
