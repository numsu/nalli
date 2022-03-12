import React, { RefObject } from 'react';
import {
	Alert,
	StyleSheet,
	TextInput,
	View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StackActions } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import NalliText, { ETextSize } from '../components/text.component';
import Colors from '../constants/colors';
import AuthStore from '../service/auth-store';
import AuthService from '../service/auth.service';
import ClientService from '../service/client.service';

interface WelcomeOtpScreenProps extends NativeStackScreenProps<any> {
	phoneNumber: string;
	phoneNumberCountry: string;
}

interface WelcomeOtpScreenState {
	otp: string;
	phoneNumber: string;
	phoneNumberCountry: string;
	tries: number;
}

export default class WelcomeOtpScreen extends React.PureComponent<WelcomeOtpScreenProps, WelcomeOtpScreenState> {

	codeInputRef: RefObject<TextInput>;

	constructor(props: WelcomeOtpScreenProps) {
		super(props);
		this.codeInputRef = React.createRef();
		this.state = props.route.params.state;
	}

	componentDidMount = () => {
		setTimeout(() => this.codeInputRef.current.focus(), 200);
	}

	static navigationOptions = () => {
		return {
			headerStyle: { height: 75, backgroundColor: Colors.main, borderBottomColor: Colors.main, elevation: 0, shadowOpacity: 0 },
			headerTitle: 'Verify',
		};
	}

	onChangeNumberPad = (val: string) => {
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
						this.props.navigation.dispatch(StackActions.replace('Auth'));
					} else {
						this.setState({ otp: '', tries: this.state.tries + 1 });
					}
					return;
				}

				const client = await ClientService.getClient();
				AuthStore.setClient(client);
				this.props.navigation.dispatch(StackActions.replace('WelcomePin'));
			}
		});
	}

	render = () => {
		const { otp } = this.state;
		return (
			<SafeAreaView edges={['top']} style={styles.container}>
				<NalliText size={ETextSize.P_LARGE} style={styles.text}>
					Please input the code we sent to your phone number
				</NalliText>
				<View style={styles.numberPadContainer}>
					<View style={styles.numberPadPinContainer}>
						<TextInput
								ref={this.codeInputRef}
								onChangeText={this.onChangeNumberPad}
								keyboardType={'numeric'}
								allowFontScaling={false}
								style={styles.numberPadPin}
								value={otp} />
					</View>
				</View>
			</SafeAreaView>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		zIndex: -1,
		paddingTop: 40,
		backgroundColor: Colors.main,
		flex: 1,
		alignItems: 'center',
	},
	text: {
		color: 'white',
		paddingTop: 10,
		textAlign: 'center',
		marginHorizontal: 50,
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
		fontSize: 38,
		width: '100%',
		textAlign: 'center',
	},
});
