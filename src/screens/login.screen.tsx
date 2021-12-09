import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
	Alert,
	StyleSheet,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native';

import DismissKeyboardView from '../components/dismiss-keyboard-hoc.component';
import Loading from '../components/loading.component';
import NalliNumberPad from '../components/nalli-number-pad.component';
import NalliLogo from '../components/svg/nalli-logo';
import NalliText, { ETextSize } from '../components/text.component';
import Colors from '../constants/colors';
import PhoneNumberSigner from '../crypto/phone-number-signer';
import AuthStore from '../service/auth-store';
import AuthService from '../service/auth.service';
import ContactsService from '../service/contacts.service';
import { NalliErrorCode } from '../service/http.service';
import VariableStore, { NalliVariable } from '../service/variable-store';
import WalletStore from '../service/wallet-store';

interface LoginState {
	phoneNumber: string
	phoneNumberCountry: string;
	pin: string;
	process: boolean;
}

export default class Login extends React.Component<any, LoginState> {

	readonly phoneNumberSigner = new PhoneNumberSigner();

	constructor(props) {
		super(props);
		this.state = {
			phoneNumber: '',
			phoneNumberCountry: 'us',
			pin: '',
			process: false,
		};
	}

	componentDidMount = () => {
		this.init();
	}

	init = async () => {
		const country = await VariableStore.getVariable<string>(NalliVariable.COUNTRY);
		const wallet = await WalletStore.getWallet();
		const client = await AuthStore.getClient();

		if (wallet) {
			VariableStore.getVariable(NalliVariable.SELECTED_ACCOUNT).then(async acc => {
				if (!acc) {
					await VariableStore.setVariable(NalliVariable.SELECTED_ACCOUNT, wallet.accounts[0].address);
					await VariableStore.setVariable(NalliVariable.SELECTED_ACCOUNT_INDEX, 0);
				}
			});
		}

		this.setState({
			phoneNumberCountry: country,
			phoneNumber: client ? client.phone : '',
		});
	}

	onChangeNumberPad = (val) => {
		this.setState({ pin: val }, () => {
			if (val.length == 6) {
				this.signIn();
			}
		});
	}

	signIn = async () => {
		const { phoneNumber, phoneNumberCountry, pin } = this.state;
		const valid = await AuthStore.isValidPin(pin);
		if (!valid) {
			Alert.alert('Error', 'Invalid pin');
			this.setState({ pin: '' });
			return;
		}

		let signature = '';
		const wallet = await WalletStore.getWallet();
		if (!wallet) {
			signature = await VariableStore.getVariable(NalliVariable.DEVICE_ID);
		} else {
			signature = await this.phoneNumberSigner.sign();
		}

		this.setState({ process: true });
		try {
			const token = await AuthService.login({
				phoneNumber,
				phoneNumberCountry,
				signature,
			});
			await AuthStore.setAuthentication(token.accessToken);
			ContactsService.clearCache();
			if (!wallet) {
				this.props.navigation.navigate('Permissions');
			} else {
				this.props.navigation.navigate('Main');
			}
		} catch (e) {
			this.setState({ pin: '', process: false });
			if (e.code == NalliErrorCode.ACCOUNT_DISABLED) {
				Alert.alert('Error', 'Your account is disabled. Most likely due to someone else registering with the same wallet. Please reinstall the application.');
			} else {
				Alert.alert('Error', 'Something went wrong, try again later');
			}
		}
	}

	clearWalletInfo = async () => {
		await WalletStore.clearWallet();
		await AuthStore.clearAuthentication();
		await AuthStore.clearClient();
		this.props.navigation.navigate('Welcome');
	}

	render = () => {
		const { pin, process } = this.state;
		return (
			<DismissKeyboardView style={styles.container}>
				<StatusBar translucent={true} style="light" />
				<Loading lighter={true} show={process} />
				<TouchableOpacity onPress={this.clearWalletInfo}>
					<NalliLogo width={150} height={60} color="white" />
				</TouchableOpacity>
				<NalliText size={ETextSize.P_LARGE} style={styles.text}>
					Enter pin
				</NalliText>
				<View style={styles.numberPadContainer}>
					<View style={styles.numberPadPinContainer}>
						<TextInput
								style={styles.numberPadPin}
								value={pin}
								secureTextEntry={true} />
					</View>
					<NalliNumberPad
							pin={pin}
							onChangeText={this.onChangeNumberPad}
							maxLength={6} />
				</View>
			</DismissKeyboardView>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		paddingTop: 50,
		backgroundColor: Colors.main,
		flex: 1,
		alignItems: 'center',
	},
	text: {
		color: 'white',
		paddingTop: 10,
	},
	numberPadContainer: {
		flex: 1,
		flexDirection: 'column',
		justifyContent: 'flex-end',
		paddingBottom: 35,
	},
	numberPadPinContainer: {
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 15,
	},
	numberPadPin: {
		color: 'white',
		fontSize: 40,
		width: '100%',
		textAlign: 'center',
	},
});
