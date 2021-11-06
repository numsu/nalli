import { wallet } from 'nanocurrency-web';
import React from 'react';
import {
	Alert,
	StyleSheet,
	View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scrollview';

import DismissKeyboardView from '../../../components/dismiss-keyboard-hoc.component';
import Loading from '../../../components/loading.component';
import NalliButton from '../../../components/nalli-button.component';
import NalliInput from '../../../components/nalli-input.component';
import NalliText, { ETextSize } from '../../../components/text.component';
import Colors from '../../../constants/colors';
import layout from '../../../constants/layout';
import PhoneNumberSigner from '../../../crypto/phone-number-signer';
import VariableStore, { NalliVariable } from '../../../service/variable-store';
import WalletStore, { Wallet, WalletType } from '../../../service/wallet-store';
import WalletService from '../../../service/wallet.service';

export default class CreateWalletImportSeed extends React.Component<any, any> {

	readonly phoneNumberSigner = new PhoneNumberSigner();

	constructor(props) {
		super(props);
		this.state = {
			seed: '',
			process: false,
		};
	}

	static navigationOptions = () => {
		return {
			headerStyle: { height: 75, elevation: 0, shadowOpacity: 0 },
			headerTitle: 'Seed',
		};
	}

	onChangeText = (text) => {
		// Clear all non hex characters
		const sanitized = text
				.replace(/[^A-Fa-f0-9]/, '')
				.toUpperCase();
		this.setState({ seed: sanitized });
	}

	onFinishPress = async () => {
		let imported: Wallet;
		try {
			if (this.state.seed.length == 128) {
				imported = { ...wallet.fromSeed(this.state.seed), type: WalletType.HD_WALLET };
			} else if (this.state.seed.length == 64) {
				imported = { ...wallet.fromLegacySeed(this.state.seed), type: WalletType.LEGACY_WALLET };
			}
		} catch (e) {
			console.error(e);
		}

		if (!imported) {
			Alert.alert('Error', 'Invalid seed');
			return;
		}

		this.setState({ process: true });
		await WalletService.saveNewWallet(imported.accounts[0]);
		VariableStore.setVariable(NalliVariable.SELECTED_ACCOUNT, imported.accounts[0].address);
		VariableStore.setVariable(NalliVariable.SELECTED_ACCOUNT_INDEX, 0);
		await WalletStore.setWallet(imported);
		this.props.navigation.navigate('Login');
		this.setState({ process: false });
	}

	render = () => {
		const { seed, process } = this.state;

		return (
			<View style={styles.container}>
				<Loading show={process} />
				<KeyboardAwareScrollView>
					<DismissKeyboardView style={styles.content}>
						<NalliText size={ETextSize.H1} style={styles.h1}>
							Import with seed
						</NalliText>
						<NalliText size={ETextSize.P_LARGE} style={styles.text}>
							Write down your seed in the field below.
						</NalliText>
						<NalliInput
								label='Seed'
								value={seed}
								style={styles.input}
								autoCapitalize='characters'
								returnKeyType='done'
								multiline={true}
								numberOfLines={3}
								onChangeText={this.onChangeText} />
						<View style={styles.actions}>
							<NalliButton
									text="Import"
									solid={true}
									disabled={process}
									style={styles.action}
									onPress={this.onFinishPress} />
						</View>
					</DismissKeyboardView>
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
	input: {
		width: layout.window.width * 0.9,
		fontSize: 14,
		paddingTop: 10,
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
		marginTop: 15,
	},
});
