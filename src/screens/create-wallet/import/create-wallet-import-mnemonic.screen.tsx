import { tools, wallet } from 'nanocurrency-web';
import React from 'react';
import {
	Alert,
	StyleSheet,
	View,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview';

import Loading from '../../../components/loading.component';
import MnemonicWord from '../../../components/mnemonic-word.component';
import NalliButton from '../../../components/nalli-button.component';
import NalliText, { ETextSize } from '../../../components/text.component';
import Colors from '../../../constants/colors';
import PhoneNumberSigner from '../../../crypto/phone-number-signer';
import VariableStore, { NalliVariable } from '../../../service/variable-store';
import WalletStore, { Wallet, WalletType } from '../../../service/wallet-store';
import WalletService from '../../../service/wallet.service';

export default class CreateWalletImport extends React.Component<any, any> {

	readonly phoneNumberSigner = new PhoneNumberSigner();

	constructor(props) {
		super(props);
		const words = ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''];
		this.state = {
			words,
			refs: words.map(() => React.createRef()),
			process: false,
		};
	}

	static navigationOptions = () => {
		return {
			headerStyle: { height: 75, elevation: 0, shadowOpacity: 0 },
			headerTitle: 'Recovery phrase',
		};
	}

	onChangeText = (wordIndex, val) => {
		if (val.endsWith(' ')) {
			if (wordIndex < 24) {
				this.state.refs[wordIndex + 1].current.focus();
			}
		} else {
			const words = this.state.words;
			words[wordIndex] = val;
			this.setState({ words });
		}
	}

	onFinishPress = async () => {
		if (this.state.words.every(word => !!word)) {
			if (!tools.validateMnemonic(this.state.words.join(' '))) {
				Alert.alert('Error', '1: Invalid recovery phrase');
				return;
			}

			this.setState({ process: true });
			this.importMnemonic();
		} else {
			Alert.alert('Error', 'Please input all words');
		}
	}

	private importMnemonic = async () => {
		let importedHD, importedLegacy;
		try {
			const words = this.state.words.join(' ');
			importedHD = wallet.fromMnemonic(words);
			importedLegacy = wallet.fromLegacyMnemonic(words);
		} catch (e) {
			console.error(e);
			Alert.alert('Error', '2: Invalid recovery phrase');
			return;
		}

		const [ isOpenedHD, isOpenedLegacy ] = await Promise.all([
				WalletService.isWalletOpened(importedHD.accounts[0].address),
				WalletService.isWalletOpened(importedLegacy.accounts[0].address)]);

		if (isOpenedHD && isOpenedLegacy) {
			Alert.alert(
					'Notice',
					'Account is opened with two different derivation methods. Please choose the one you want to use',
					[
						{
							text: 'HD wallet',
							onPress: () => this.onImportMnemonicDone({ ...importedHD, type: WalletType.HD_WALLET }),
							style: 'default',
						}, {
							text: 'Legacy wallet',
							onPress: () => this.onImportMnemonicDone({ ...importedLegacy, type: WalletType.LEGACY_WALLET }),
							style: 'default',
						},
					]);
		} else if (isOpenedLegacy) {
			this.onImportMnemonicDone({ ...importedLegacy, type: WalletType.LEGACY_WALLET })
		} else if (isOpenedHD) {
			this.onImportMnemonicDone({ ...importedHD, type: WalletType.HD_WALLET })
		} else {
			Alert.alert(
				'Notice',
				'It seems that this account doesn\'t contain any transactions. If you think it should, please check the words.\n\nDo you wish to use this wallet anyway?',
				[
					{
						text: 'Use this wallet',
						onPress: () => this.onImportMnemonicDone({ ...importedHD, type: WalletType.HD_WALLET }),
						style: 'default',
					}, {
						text: 'Cancel',
						onPress: () => undefined,
						style: 'cancel',
					}
				]);
		}
	}

	private onImportMnemonicDone = async (imported: Wallet) => {
		try {
			await WalletService.saveNewWallet(imported.accounts[0]);
			VariableStore.setVariable(NalliVariable.SELECTED_ACCOUNT, imported.accounts[0].address);
			VariableStore.setVariable(NalliVariable.SELECTED_ACCOUNT_INDEX, 0);
			await WalletStore.setWallet(imported);
			this.props.navigation.navigate('Login');
		} catch (e) {
			console.error(e);
			this.setState({ process: false });
			Alert.alert('Error', 'Something went wrong when saving the wallet');
		}
	}

	render = () => {
		const { words, refs, process } = this.state;
		let wordIndex = 0;

		return (
			<View style={styles.container}>
				<Loading show={process} />
				<KeyboardAwareScrollView>
					<ScrollView contentContainerStyle={styles.content}>
						<NalliText size={ETextSize.H1} style={styles.h1}>
							Recovery phrase
						</NalliText>
						<NalliText size={ETextSize.P_LARGE} style={styles.text}>
							Write down 24 words of your recovery phrase.
						</NalliText>
						<View style={styles.wordsContainer}>
							{words.map(word => (
								<MnemonicWord
										reference={refs[wordIndex]}
										key={wordIndex}
										index={++wordIndex}
										editable={true}
										onChangeText={(index, val) => this.onChangeText(index, val)}
										value={word} />
							))}
						</View>
						<View style={styles.actions}>
							<NalliButton
									text="Import"
									solid={true}
									style={styles.action}
									disabled={process}
									onPress={this.onFinishPress} />
						</View>
					</ScrollView>
				</KeyboardAwareScrollView>
			</View>
		);
	}

}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'white',
	},
	content: {
		flexGrow: 1,
		paddingTop: 20,
		alignItems: 'center',
	},
	h1: {
		marginBottom: 20,
		color: Colors.main,
	},
	text: {
		width: '80%',
		textAlign: 'center',
		marginBottom: 12,
	},
	wordsContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-evenly',
	},
	actions: {
		flex: 1,
		width: '100%',
		justifyContent: 'flex-end',
		paddingHorizontal: 20,
		marginBottom: 30,
		marginTop: 30,
	},
	action: {
	},
});
