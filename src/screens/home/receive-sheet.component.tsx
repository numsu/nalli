import React, { RefObject } from 'react';
import {
	Clipboard,
	EmitterSubscription,
	StyleSheet,
	Text,
	View,
} from 'react-native';

import MyBottomSheet from '../../components/bottom-sheet.component';
import NalliButton from '../../components/nalli-button.component';
import QRCode from '../../components/qrcode/qrcode.component';
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
					initialSnap={0}
					reference={reference}
					snapPoints={layout.isSmallDevice ? [0, '88%'] : [0, '68%']}
					header="Receive">
				<View style={styles.transactionSheetContent}>
					<Text>Scan the QR-code below to send funds to this wallet</Text>
					<View style={styles.qrcode}>
						<QRCode
								value={`nano:${address}`}
								logo={logo}
								logoBorderRadius={0}
								quietZone={4}
								size={200} />
					</View>
					<Text>Account:</Text>
					<Text>{address}</Text>
					<NalliButton
							text={showCopiedText ? 'Copied' : 'Copy address'}
							style={styles.copyButton}
							onPress={() => this.onCopyPress(address)} />
				</View>
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
	qrcode: {
		alignSelf: 'center',
		borderWidth: 6,
		borderColor: Colors.main,
		marginVertical: 15,
	},
	copyButton: {
		marginTop: 10,
	},
});
