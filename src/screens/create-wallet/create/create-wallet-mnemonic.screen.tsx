import { PureComponent } from 'react';
import {
	Alert,
	ScrollView,
	StyleSheet,
	View,
} from 'react-native';

import { StackActions } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import NalliCopy from '../../../components/copy.component';
import Loading from '../../../components/loading.component';
import MnemonicWord from '../../../components/mnemonic-word.component';
import NalliButton from '../../../components/nalli-button.component';
import NalliText, { ETextSize } from '../../../components/text.component';
import Colors from '../../../constants/colors';
import VariableStore, { NalliVariable } from '../../../service/variable-store';
import WalletStore from '../../../service/wallet-store';
import WalletService, { Wallet } from '../../../service/wallet.service';

export default class CreateWalletMnemonic extends PureComponent<NativeStackScreenProps<any>, any> {

	constructor(props) {
		super(props);
		this.state = {
			process: false,
			started: false,
			wordDisplay: false,
			generated: props.route.params.generated as Wallet,
		};
	}

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
							this.props.navigation.dispatch(StackActions.replace('Login'));
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
						<NalliText size={ETextSize.H1} style={styles.h1}>
							Your wallet
						</NalliText>
						<NalliText size={ETextSize.P_LARGE} style={styles.text}>
							Your wallet has now been created and stored securely on this device.
						</NalliText>
						<NalliText size={ETextSize.P_LARGE} style={styles.text}>
							By clicking continue, you will be provided with the recovery phrase to your wallet.
							Make sure that nobody else than you can see it.
						</NalliText>
						<NalliText size={ETextSize.P_LARGE} style={styles.text}>
							Losing or sharing the key will cause loss of assets.
						</NalliText>
						<View style={styles.actions}>
							<NalliButton
									text='Continue'
									solid
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
						<View style={styles.headerContainer}>
							<NalliText size={ETextSize.H1} style={styles.h1}>
								Recovery phrase
							</NalliText>
							<NalliCopy
									value={generated.mnemonic}
									confirm
									style={styles.copyButton} />
						</View>
						<View style={styles.wordsContainer}>
							{words}
						</View>
						<NalliText size={ETextSize.P_LARGE} style={styles.text}>
							These words can be used to control your wallet if you no longer can access Nalli on this phone.
						</NalliText>
						<View style={styles.actions}>
							<NalliButton
									text='Finish'
									solid
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
	headerContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 20,
	},
	h1: {
		color: Colors.main,
	},
	copyButton: {
		marginLeft: 10,
	},
	text: {
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
		paddingBottom: 20,
	},
});
