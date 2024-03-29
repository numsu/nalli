import { StatusBar } from 'expo-status-bar';
import React from 'react';
import {
	Alert,
	Platform,
	StyleSheet,
	TextInput,
	View,
} from 'react-native';
import uuid from 'react-native-uuid';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { StackActions } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import DismissKeyboardView from '../components/dismiss-keyboard-hoc.component';
import Loading, { LoadingStyle } from '../components/loading.component';
import NalliNumberPad from '../components/nalli-number-pad.component';
import NalliLogo from '../components/svg/nalli-logo';
import NalliText, { ETextSize } from '../components/text.component';
import Colors from '../constants/colors';
import PhoneNumberSigner from '../crypto/phone-number-signer';
import AuthStore from '../service/auth-store';
import AuthService from '../service/auth.service';
import BiometricsService, { EBiometricsType } from '../service/biometrics.service';
import ContactsService from '../service/contacts.service';
import { NalliErrorCode } from '../service/http.service';
import VariableStore, { NalliVariable } from '../service/variable-store';
import WalletStore from '../service/wallet-store';

interface LoginState {
	biometricsType: EBiometricsType;
	displayNumberPad: boolean;
	phoneNumber: string;
	phoneNumberCountry: string;
	pin: string;
	process: boolean;
}

export default class Login extends React.Component<NativeStackScreenProps<any>, LoginState> {

	constructor(props) {
		super(props);
		this.state = {
			biometricsType: EBiometricsType.NO_BIOMETRICS,
			displayNumberPad: false,
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
		const biometricsType = await VariableStore.getVariable<EBiometricsType>(NalliVariable.BIOMETRICS_TYPE);
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
			biometricsType,
			phoneNumberCountry: country,
			phoneNumber: client ? client.phone : '',
		}, this.signInWithBiometrics);
	}

	onChangeNumberPad = (val) => {
		this.setState({ pin: val }, () => {
			if (val.length == 6) {
				this.signIn();
			}
		});
	}

	signInWithBiometrics = async () => {
		const isBiometricsEnabled = await BiometricsService.isBiometricsEnabled();
		const isAutologinDisabled = await VariableStore.getVariable<boolean>(NalliVariable.NO_AUTOLOGIN, false);
		if (isBiometricsEnabled && !isAutologinDisabled) {
			this.setState({ displayNumberPad: false }, async () => {
				const success = await BiometricsService.authenticate(`Login with ${EBiometricsType.getBiometricsTypeText(this.state.biometricsType)}`);
				if (success) {
					await this.doLogin();
				} else {
					this.setState({ displayNumberPad: true });
				}
			});
		} else {
			this.setState({ displayNumberPad: true });
		}
		await VariableStore.setVariable(NalliVariable.NO_AUTOLOGIN, false);
	}

	signIn = async () => {
		const pin = this.state.pin;
		const valid = await AuthStore.isValidPin(pin);
		if (!valid) {
			Alert.alert('Error', 'Invalid PIN');
			this.setState({ pin: '' });
			return;
		}

		await this.doLogin();
	}

	doLogin = async () => {
		const { phoneNumber, phoneNumberCountry } = this.state;
		let signature = '';
		const wallet = await WalletStore.getWallet();
		if (!wallet) {
			signature = await VariableStore.getVariable(NalliVariable.DEVICE_ID);
		} else {
			signature = await PhoneNumberSigner.sign();
		}

		this.setState({ process: true });
		try {
			const token = await AuthService.login({
				phoneNumber,
				phoneNumberCountry,
				signature,
			});
			await AuthStore.setAuthentication(token.accessToken);
			await ContactsService.refreshCache();
			if (!wallet) {
				this.props.navigation.dispatch(StackActions.replace('Permissions'));
			} else {
				this.props.navigation.dispatch(StackActions.replace('Home'));
			}
		} catch (e) {
			console.error(e);
			this.setState({ pin: '', process: false, displayNumberPad: true });
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
		await AuthStore.clearExpires();
		await AuthStore.clearPin();
		await VariableStore.clear();
		await AsyncStorage.clear();
		await VariableStore.setVariable(NalliVariable.DEVICE_ID, uuid.v4());
		this.props.navigation.dispatch(StackActions.replace('Auth'));
	}

	render = () => {
		const { displayNumberPad, pin, process } = this.state;
		return (
			<DismissKeyboardView style={styles.container}>
				<StatusBar translucent style='light' />
				<Loading style={LoadingStyle.LIGHT} color='white' show={process} />
				{/* <TouchableOpacity onPress={this.clearWalletInfo}> */}
					<NalliLogo width={150} height={60} color='white' />
				{/* </TouchableOpacity> */}
				<NalliText size={ETextSize.P_LARGE} style={styles.text}>
					Enter pin
				</NalliText>
				{displayNumberPad &&
					<View style={styles.numberPadContainer}>
						<View style={styles.numberPadPinContainer}>
							<TextInput
									style={styles.numberPadPin}
									value={'⬤'.repeat(pin.length)}
									allowFontScaling={false}
									editable={false} />
						</View>
						<NalliNumberPad
								pin={pin}
								enableBiometrics
								onBiometricLoginPress={this.signInWithBiometrics}
								onChangeText={this.onChangeNumberPad}
								maxLength={6} />
					</View>
				}
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
	biometricsContainer: {
		flex: 1,
		justifyContent: 'flex-end',
		paddingBottom: 35,
	},
	biometricsLoginIcon: {
		fontSize: 78,
		color: 'white',
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
