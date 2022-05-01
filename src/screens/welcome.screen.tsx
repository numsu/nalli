import React from 'react';
import {
	Alert,
	Keyboard,
	StyleSheet,
	View,
} from 'react-native';

import { NativeStackScreenProps } from '@react-navigation/native-stack';

import DismissKeyboardView from '../components/dismiss-keyboard-hoc.component';
import Link from '../components/link.component';
import NalliButton from '../components/nalli-button.component';
import PhoneNumberInput from '../components/phone-number-input.component';
import NalliLogo from '../components/svg/nalli-logo';
import NalliText from '../components/text.component';
import Colors from '../constants/colors';
import AuthStore from '../service/auth-store';
import AuthService from '../service/auth.service';
import ClientService from '../service/client.service';
import ContactsService from '../service/contacts.service';

export default class WelcomeScreen extends React.PureComponent<NativeStackScreenProps<any>, any> {

	state = {
		phoneNumber: '',
		phoneNumberCountry: 'us',
		process: false,
	};

	constructor(props) {
		super(props);
	}

	static navigationOptions = () => ({
		headerShown: false,
	})

	onChangeText = (key, val) => {
		this.setState({ [key]: val });
	}

	signUp = async () => {
		if (!ContactsService.isValidNumber(this.state.phoneNumberCountry, this.state.phoneNumber)) {
			Alert.alert(
				'Error',
				'Please input a valid phone number',
			);
			return;
		}
		this.setState({ process: true });
		Keyboard.dismiss();

		try {
			await AuthService.registerOtp({
				phoneNumber: this.state.phoneNumber,
				phoneNumberCountry: this.state.phoneNumberCountry,
				otp: '',
			});
		} catch (e) {
			if (e.includes('403')) {
				Alert.alert(
					'Error',
					'Too many failed attempts. Please wait a few minutes to request a new code.',
				);
				return;
			}
		} finally {
			this.setState({ process: false });
		}

		this.props.navigation.navigate('WelcomeOtp', { state: { ...this.state, otp: '', tries: 0 } });
	}

	createWallet = async () => {
		if (this.state.process) {
			return;
		}
		this.setState({ process: true });
		try {
			const token = await AuthService.registerNoPhone();
			await AuthStore.setAuthentication(token.accessToken);
			const client = await ClientService.getClient();
			AuthStore.setClient(client);
			this.props.navigation.navigate('WelcomePin');
		} finally {
			this.setState({ process: false });
		}
	}

	render = () => {
		const { phoneNumber, process } = this.state;
		return (
			<DismissKeyboardView style={styles.container}>
				<NalliLogo width={150} height={60} color='white' />
				<NalliText style={styles.text}>
					Pay anyone, anywhere, instantly. Using just a phone number.
				</NalliText>
				<NalliText style={styles.smallerText}>
					Start by creating an account with us.
				</NalliText>
				<PhoneNumberInput
						value={phoneNumber}
						onChangeNumber={val => this.onChangeText('phoneNumber', val)}
						onChangeCountry={val => this.onChangeText('phoneNumberCountry', val)}/>
				<NalliButton
						text='Continue'
						icon={'ios-arrow-forward'}
						onPress={this.signUp}
						style={styles.loginButton}
						textStyle={styles.loginButtonText}
						disabled={process} />
				<NalliText
						style={styles.privacyPolicy}>
					By continuing to use this app, you agree that you have read, understood and accepted our
					&nbsp;<Link
							url='https://nalli.app/privacy-policy'
							style={styles.link}>
						Privacy Policy
					</Link>
					&nbsp;and
					&nbsp;<Link
							url='https://nalli.app/terms-and-conditions'
							style={styles.link}>
						Terms and Conditions
					</Link>
				</NalliText>
				<View style={styles.noPhoneNumberLoginContainer}>
					<NalliText style={styles.privacyPolicy}>Or if you would rather use the plain wallet without the awesome functionalities that phone numbers provide</NalliText>
					<NalliButton
						small
						text='Create wallet'
						onPress={this.createWallet}
						style={styles.loginButton}
						textStyle={styles.loginButtonText}
						disabled={process} />
				</View>
			</DismissKeyboardView>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: Colors.main,
		flex: 1,
		paddingHorizontal: 20,
		paddingTop: 50,
	},
	text: {
		fontSize: 18,
		fontWeight: '400',
		color: Colors.borderColor,
		marginTop: 25,
	},
	smallerText: {
		fontSize: 14,
		fontWeight: '400',
		color: Colors.borderColor,
		marginTop: 30,
		marginBottom: 10,
	},
	formContainer: {
		flex: 1,
		flexDirection: 'column',
		marginTop: 10,
	},
	loginButton: {
		marginTop: 20,
		borderColor: Colors.borderColor,
	},
	loginButtonText: {
		color: Colors.borderColor,
	},
	registerText: {
		marginTop: 40,
		marginBottom: 10,
		color: 'white',
		fontSize: 14,
		alignSelf: 'center',
	},
	registerButton: {
		width: 300,
		alignSelf: 'center',
	},
	privacyPolicy: {
		marginHorizontal: 40,
		marginTop: 20,
		textAlign: 'center',
		color: Colors.greyTextOnBlue,
	},
	link: {
		color: 'white',
	},
	noPhoneNumberLoginContainer: {
		marginTop: 'auto',
		marginBottom: 25,
		width: '80%',
		alignSelf: 'center',
	},
});
