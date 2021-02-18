import React from 'react';
import {
	EmitterSubscription,
	ScrollView,
	StyleSheet,
	TextInput,
	View,
} from 'react-native';
import { Text } from 'react-native-elements';

import MnemonicWord from '../../../components/mnemonic-word.component';
import NalliModal from '../../../components/modal.component';
import NalliNumberPad from '../../../components/nalli-number-pad.component';
import ShowHide from '../../../components/show-hide.component';
import Colors from '../../../constants/colors';
import layout from '../../../constants/layout';
import AuthStore from '../../../service/auth-store';
import VariableStore, { NalliVariable } from '../../../service/variable-store';
import WalletStore, { Wallet, WalletType } from '../../../service/wallet-store';

interface WalletInfoModallProps {
	isOpen: boolean;
	close: () => void;
}

interface WalletInfoModalState {
	isOpen: boolean;
	isUnlocked: boolean;
	walletInfo: Wallet;
	pin: string;
}

export default class WalletInfoModal extends React.Component<WalletInfoModallProps, WalletInfoModalState> {

	subscriptions: EmitterSubscription[] = [];

	constructor(props) {
		super(props);
		this.state = {
			isOpen: false,
			isUnlocked: false,
			walletInfo: undefined,
			pin: '',
		};
	}

	static getDerivedStateFromProps(nextProps, prevState) {
		if (prevState.isOpen != nextProps.isOpen) {
			return { isOpen: nextProps.isOpen };
		}
		return null;
	}

	componentDidMount = () => {
		this.init();
		this.subscriptions.push(VariableStore.watchVariable(NalliVariable.ACCOUNTS_BALANCES, () => this.init()));
	}

	componentWillUnmount = () => {
		this.subscriptions.forEach(VariableStore.unwatchVariable);
	}

	init = async () => {
		const wallet = await WalletStore.getWallet();
		this.setState({ walletInfo: wallet });
	}

	validatePin = async (pin: string) => {
		if (pin.length == 6) {
			const isValid = await AuthStore.isValidPin(pin);
			if (isValid) {
				this.setState({ isUnlocked: true, pin: '' });
			} else {
				this.setState({ pin: '' });
			}
		} else {
			this.setState({ pin });
		}
	}

	closeAndLock = () => {
		this.setState({ isUnlocked: false });
		this.props.close();
	}

	render = () => {
		const { isOpen, isUnlocked, pin, walletInfo } = this.state;

		if (isOpen && walletInfo) {
			let i = 0;
			const words = walletInfo.mnemonic.split(' ').map(word => (
				<MnemonicWord key={i} index={++i}>{word}</MnemonicWord>
			));
			const privateKeys = walletInfo.accounts.map(account => (
				<View style={{ alignItems: "center" }} key={account.accountIndex}>
					<Text style={styles.header}>{`Account #${account.accountIndex} private key`}</Text>
					<ShowHide allowCopy={true} copyValue={account.privateKey} confirmCopy={true}>
						<Text>{account.privateKey}</Text>
					</ShowHide>
				</View>
			));
			return (
				<NalliModal
						isOpen={isOpen}
						onClose={this.closeAndLock}
						header='Wallet'>
					{isUnlocked &&
						<ScrollView contentContainerStyle={styles.container}>
							<Text style={styles.disclaimer}>This information is everything needed to access your wallet and spend your funds. Keep a copy of this information in a safe place in case your phone breaks or you lose it and never share it with anyone.</Text>
							<Text style={styles.header}>Recovery phrase</Text>
							<Text style={styles.addition}>Wallet type: {walletInfo.type == WalletType.HD_WALLET ? 'HD Wallet' : 'Legacy wallet'}</Text>
							<ShowHide allowCopy={true} copyValue={walletInfo.mnemonic} confirmCopy={true}>
								<View style={styles.wordsContainer}>
									{words}
								</View>
							</ShowHide>
							<Text style={styles.header}>Wallet seed</Text>
							<ShowHide allowCopy={true} copyValue={walletInfo.seed} confirmCopy={true}>
								<Text>{walletInfo.seed}</Text>
							</ShowHide>
							{privateKeys}
						</ScrollView>
					}
					{!isUnlocked &&
						<View style={styles.pinContainer}>
							<Text style={styles.header}>Enter pin to view</Text>
							<TextInput
									style={styles.numberPadPin}
									value={pin}
									secureTextEntry={true} />
							<NalliNumberPad
									style={styles.numberPad}
									pin={pin}
									onChangeText={this.validatePin} />
						</View>
					}
				</NalliModal>
			);
		} else {
			return (<></>);
		}
	}

}

const styles = StyleSheet.create({
	numberPad: {
		borderColor: Colors.main,
		color: Colors.main,
	},
	container: {
		marginHorizontal: 5,
		alignItems: 'center',
	},
	pinContainer: {
		marginHorizontal: -20,
		marginTop: layout.isSmallDevice ? 0 : 30,
		alignItems: 'center',
	},
	disclaimer: {
		fontFamily: 'OpenSans',
	},
	header: {
		fontFamily: 'OpenSansBold',
		fontSize: 18,
		marginBottom: 15,
		marginTop: 20,
	},
	addition: {
		fontFamily: 'OpenSansBold',
		fontSize: 14,
		marginTop: -10,
		marginBottom: 10,
	},
	wordsContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-evenly',
		marginHorizontal: -4,
	},
	numberPadPin: {
		color: Colors.main,
		fontSize: 40,
		width: '100%',
		textAlign: 'center',
	},
});
