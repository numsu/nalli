import React from 'react';
import {
	Alert,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { HeaderBackButton } from 'react-navigation';

import Loading from '../../../components/loading.component';
import MnemonicWord from '../../../components/mnemonic-word.component';
import NalliButton from '../../../components/nalli-button.component';
import Colors from '../../../constants/colors';
import PhoneNumberSigner from '../../../crypto/phone-number-signer';
import VariableStore, { NalliVariable } from '../../../service/variable-store';
import WalletStore from '../../../service/wallet-store';
import WalletService, { Wallet } from '../../../service/wallet.service';

export default class CreateWalletMnemonic extends React.Component<any, any> {

	readonly phoneNumberSigner = new PhoneNumberSigner();

	constructor(props) {
		super(props);
		this.state = {
			process: false,
			started: false,
			wordDisplay: false,
			generated: props.navigation.getParam('generated') as Wallet,
		};
	}

	static navigationOptions = ({ navigation }) => ({
		headerLeft: <HeaderBackButton tintColor={Colors.main} onPress={() => navigation.goBack(undefined)} />,
	})

	onChangeText = (key, val) => {
		this.setState({ [key]: val });
	}

	onContinuePress = () => {
		this.setState({ wordDisplay: true });
	}

	onFinishPress = async () => {
		Alert.alert(
			'Confirm',
			'I have written down the 24-word recovery phrase and I acknowledge that losing or sharing this phrase will cause loss of my assets.',
			[
				{
					text: 'Cancel',
					style: 'default',
					onPress: () => undefined,
				}, {
					text: 'Acknowledge',
					style: 'destructive',
					onPress: async () => {
						this.setState({ process: true });
						try {
							await WalletService.saveNewWallet(this.state.generated.accounts[0]);
							await WalletStore.setWallet(this.state.generated);
							VariableStore.setVariable(NalliVariable.SELECTED_ACCOUNT, this.state.generated.accounts[0].address);
							VariableStore.setVariable(NalliVariable.SELECTED_ACCOUNT_INDEX, 0);
							this.props.navigation.navigate('Login');
						} catch {
							this.setState({ process: false });
						}
					}
				},
			],
		);
	}

	render = () => {
		const { wordDisplay, generated, process } = this.state;
		if (!wordDisplay) {
			return (
				<View style={styles.container}>
					<View style={styles.content}>
						<Text style={styles.h1}>
							Your wallet
						</Text>
						<Text style={styles.text}>
							Your wallet has now been created. It will be encrypted on your device.
						</Text>
						<Text style={styles.text}>
							Next, you will be provided with the keys to your wallet. Make sure that nobody else than you can see the key.
						</Text>
						<Text style={styles.text}>
							Losing or sharing the key will cause loss of assets.
						</Text>
						<View style={styles.actions}>
							<NalliButton
									text="Continue"
									solid={true}
									style={styles.action}
									onPress={this.onContinuePress} />
						</View>
					</View>
				</View>
			);
		} else {
			let i = 0;
			const words = generated.mnemonic.split(' ').map(word => (
				<MnemonicWord key={i} index={++i}>{word}</MnemonicWord>
			));

			return (
				<View style={styles.container}>
					<Loading show={process} />
					<ScrollView contentContainerStyle={styles.content}>
						<Text style={styles.h1}>
							Recovery phrase
						</Text>
						<Text style={styles.text}>
							These 24 words are your key. These can be used to control your wallet if you don't have access to this phone or this application.
						</Text>
						<View style={styles.wordsContainer}>
							{words}
						</View>
						<View style={styles.actions}>
							<NalliButton
									text="Finish"
									solid={true}
									style={styles.action}
									disabled={process}
									onPress={this.onFinishPress} />
						</View>
					</ScrollView>
				</View>
			);
		}
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
		fontSize: 30,
		fontWeight: '600',
		marginBottom: 20,
		color: Colors.main,
	},
	text: {
		fontSize: 20,
		width: '80%',
		textAlign: 'center',
		marginBottom: 12,
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
	wordsContainer: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-evenly',
	},
});
