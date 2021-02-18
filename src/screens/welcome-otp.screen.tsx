import React, { RefObject } from 'react';
import {
	Alert,
	StyleSheet,
	Text,
	TextInput,
	View,
} from 'react-native';
import {
	HeaderBackButton,
	NavigationInjectedProps,
} from 'react-navigation';

import Colors from '../constants/colors';
import AuthStore from '../service/auth-store';
import AuthService from '../service/auth.service';
import ClientService from '../service/client.service';

interface WelcomeOtpScreenProps extends NavigationInjectedProps {
	phoneNumber: string;
	phoneNumberCountry: string;
}

interface WelcomeOtpScreenState {
	otp: string;
	phoneNumber: string;
	phoneNumberCountry: string;
	tries: number;
}

export default class WelcomeOtpScreen extends React.Component<WelcomeOtpScreenProps, WelcomeOtpScreenState> {

	codeInputRef: RefObject<TextInput>;

	constructor(props: WelcomeOtpScreenProps) {
		super(props);
		this.codeInputRef = React.createRef();
		this.state = props.navigation.getParam('state');
	}

	componentDidMount = () => {
		setTimeout(() => this.codeInputRef.current.focus());
	}

	static navigationOptions = ({ navigation }) => {
		return {
			headerTitle: 'Verify',
			headerLeft: <HeaderBackButton tintColor={'white'} onPress={() => navigation.goBack()} />,
		};
	}

	onChangeNumberPad = (val) => {
		if (val.length > 6) {
			return;
		}
		this.setState({ otp: val }, async () => {
			if (val.length == 6) {
				try {
					const token = await AuthService.register(this.state);
					await AuthStore.setAuthentication(token.accessToken);
				} catch {
					if (this.state.tries == 2) {
						Alert.alert(
							'Error',
							'Too many failed attempts. Please wait a few minutes to request a new code.',
						);
						this.props.navigation.navigate('Welcome');
					} else {
						this.setState({ otp: '', tries: this.state.tries + 1 });
					}
					return;
				}

				const client = await ClientService.getClient();
				AuthStore.setClient(client);

				this.props.navigation.navigate('WelcomePin');
			}
		});
	}

	render = () => {
		const { otp } = this.state;
		return (
			<View style={styles.container}>
				<Text style={styles.text}>
					Please input the code we sent to your phone number
				</Text>
				<View style={styles.numberPadContainer}>
					<View style={styles.numberPadPinContainer}>
						<TextInput
								ref={this.codeInputRef}
								onChangeText={this.onChangeNumberPad}
								keyboardType={'numeric'}
								style={styles.numberPadPin}
								value={otp} />
					</View>
				</View>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		paddingTop: 40,
		backgroundColor: Colors.main,
		flex: 1,
		alignItems: 'center',
	},
	text: {
		fontSize: 20,
		fontWeight: '400',
		color: Colors.borderColor,
		paddingHorizontal: 60,
		alignSelf: 'center',
		textAlign: 'center',
	},
	numberPadContainer: {
		flex: 1,
		flexDirection: 'column',
		paddingTop: 50,
	},
	numberPadPinContainer: {
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 20,
	},
	numberPadPin: {
		color: 'white',
		fontSize: 40,
		width: '100%',
		textAlign: 'center',
	},
});
