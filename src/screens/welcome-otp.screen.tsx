import React, { RefObject } from 'react';
import {
	Alert,
	StyleSheet,
	TextInput,
	View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
	HeaderBackButton,
	NavigationInjectedProps,
} from 'react-navigation';

import NalliText, { ETextSize } from '../components/text.component';
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
			headerStyle: { height: 75, backgroundColor: Colors.main, borderBottomColor: Colors.main, elevation: 0, shadowOpacity: 0 },
			headerTitle: 'Verify',
			headerLeft: <HeaderBackButton tintColor={'white'} onPress={() => navigation.goBack()} />,
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
		fontSize: 40,
		width: '100%',
		textAlign: 'center',
	},
});
