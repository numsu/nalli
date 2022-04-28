import React from 'react';
import {
	EmitterSubscription,
	Platform,
	ScrollView,
	StyleSheet,
	TextInput,
	View,
} from 'react-native';

import MnemonicWord from '../../../components/mnemonic-word.component';
import NalliModal, { EModalSize } from '../../../components/modal.component';
import NalliNumberPad from '../../../components/nalli-number-pad.component';
import ShowHide from '../../../components/show-hide.component';
import NalliText, { ETextSize } from '../../../components/text.component';
import Colors from '../../../constants/colors';
import { ANIMATION_DELAY } from '../../../constants/globals';
import layout from '../../../constants/layout';
import AuthStore from '../../../service/auth-store';
import BiometricsService, { EBiometricsType } from '../../../service/biometrics.service';
import VariableStore, { NalliVariable } from '../../../service/variable-store';
import WalletStore, { Wallet, WalletType } from '../../../service/wallet-store';

interface WalletInfoModalProps {
	isOpen: boolean;
	close: () => void;
}

interface WalletInfoModalState {
	isBiometricProcess: boolean;
	isOpen: boolean;
	isUnlocked: boolean;
	pin: string;
	walletInfo: Wallet;
}

export default class WalletInfoModal extends React.PureComponent<WalletInfoModalProps, WalletInfoModalState> {

	subscriptions: EmitterSubscription[] = [];

	constructor(props) {
		super(props);
		this.state = {
			isBiometricProcess: false,
			isOpen: false,
			isUnlocked: false,
			pin: '',
			walletInfo: undefined,
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

	signInWithBiometrics = async () => {
		const isBiometricsEnabled = await BiometricsService.isBiometricsEnabled();
		if (isBiometricsEnabled) {
			const biometricsType = await VariableStore.getVariable<EBiometricsType>(NalliVariable.BIOMETRICS_TYPE);
			this.setState({ isBiometricProcess: true }, async () => {
				const success = await BiometricsService.authenticate(`Login with ${EBiometricsType.getBiometricsTypeText(biometricsType)}`);
				if (success) {
					this.setState({ isUnlocked: true, pin: '', isBiometricProcess: false });
				} else {
					this.setState({ isBiometricProcess: false });
				}
			});
		}
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
		setTimeout(() => this.setState({ isUnlocked: false }), ANIMATION_DELAY);
		this.props.close();
	}

	render = () => {
		const {
			isBiometricProcess,
			isOpen,
			isUnlocked,
			pin,
			walletInfo,
		} = this.state;

		let words, privateKeys;
		if (isUnlocked) {
			let i = 0;
			if (walletInfo.mnemonic) {
				words = walletInfo.mnemonic.split(' ').map(word => (
					<MnemonicWord key={i} index={++i}>{word}</MnemonicWord>
				));
			}
			privateKeys = walletInfo.accounts.map(account => (
				<View style={{ alignItems: 'center' }} key={account.accountIndex}>
					<NalliText size={ETextSize.H2} style={styles.header}>{`Account #${account.accountIndex} private key`}</NalliText>
					<ShowHide allowCopy copyValue={account.privateKey} confirmCopy>
						<NalliText>{account.privateKey}</NalliText>
					</ShowHide>
				</View>
			));
		}
		return (
			<NalliModal
					size={EModalSize.LARGE}
					isOpen={isOpen}
					onClose={this.closeAndLock}
					header='Wallet'>
				{isUnlocked &&
					<ScrollView contentContainerStyle={styles.container}>
						<NalliText>This information is everything needed to access your wallet and spend your funds. Keep a copy of this information in a safe place in case your phone breaks or you lose it and never share it with anyone.</NalliText>
						{!!words &&
							<View style={styles.recoveryPhraseContainer}>
								<NalliText size={ETextSize.H2} style={styles.header}>Recovery phrase</NalliText>
								<NalliText style={styles.addition}>Wallet type: {walletInfo.type == WalletType.HD_WALLET ? 'HD Wallet' : 'Legacy wallet'}</NalliText>
								<ShowHide allowCopy copyValue={walletInfo.mnemonic} confirmCopy>
									<View style={styles.wordsContainer}>
										{words}
									</View>
								</ShowHide>
							</View>
						}
						<NalliText size={ETextSize.H2} style={styles.header}>Wallet seed</NalliText>
						<ShowHide allowCopy copyValue={walletInfo.seed} confirmCopy>
							<NalliText>{walletInfo.seed}</NalliText>
						</ShowHide>
						{privateKeys}
					</ScrollView>
				}
				{!isUnlocked && !isBiometricProcess &&
					<View style={styles.pinContainer}>
						<NalliText size={ETextSize.H2} style={styles.header}>Enter pin to view</NalliText>
						<TextInput
								style={styles.numberPadPin}
								value={'⬤'.repeat(pin.length)}
								allowFontScaling={false}
								editable={false} />
						<NalliNumberPad
								style={styles.numberPad}
								pin={pin}
								onChangeText={this.validatePin}
								enableBiometrics
								onBiometricLoginPress={this.signInWithBiometrics} />
					</View>
				}
			</NalliModal>
		);
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
		paddingBottom: 30,
	},
	pinContainer: {
		marginHorizontal: -28,
		marginTop: layout.isSmallDevice ? 0 : 30,
		alignItems: 'center',
		paddingBottom: 30,
	},
	recoveryPhraseContainer: {
		alignItems: 'center',
	},
	header: {
		marginBottom: 15,
		marginTop: 20,
	},
	addition: {
		fontSize: 12,
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
		...Platform.select({
			android: {
				fontSize: 14,
			},
			ios: {
				fontSize: 10,
			},
		}),
		letterSpacing: 2,
		width: '100%',
		textAlign: 'center',
		marginBottom: 10,
	},
});
