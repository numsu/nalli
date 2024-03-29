import React from 'react';
import {
	Alert,
	Platform,
	StyleSheet,
	TextInput,
	View,
} from 'react-native';

import { StackActions } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import DismissKeyboardView from '../components/dismiss-keyboard-hoc.component';
import NalliNumberPad from '../components/nalli-number-pad.component';
import NalliText, { ETextSize } from '../components/text.component';
import Colors from '../constants/colors';
import AuthStore from '../service/auth-store';

interface WelcomePinScreenState {
	pin: string;
	verifyPin: string;
	verify: boolean;
}

export default class WelcomePinScreen extends React.PureComponent<NativeStackScreenProps<any>, WelcomePinScreenState> {

	constructor(props) {
		super(props);
		this.state = {
			pin: '',
			verifyPin: '',
			verify: false,
		};
	}

	onChangeNumberPad = (val: string) => {
		if (this.state.verify) {
			this.setState({ verifyPin: val }, () => {
				if (val.length == 6) {
					if (this.state.pin == this.state.verifyPin) {
						AuthStore.setPin(this.state.pin);
						this.props.navigation.dispatch(StackActions.replace('CreateWallet'));
					} else {
						this.setState({
							pin: '',
							verifyPin: '',
							verify: false,
						});
						Alert.alert('Error', 'PIN numbers did not match. Please try again.');
					}
				}
			});
		} else {
			this.setState({ pin: val }, () => {
				if (val.length == 6) {
					this.setState({ verify: true });
				}
			});
		}
	}

	render = () => {
		const pin = this.state.verify ? this.state.verifyPin : this.state.pin;
		const text = this.state.verify
				? 'Confirm the pin code by typing it again'
				: 'Please type a six number pin code for login';

		return (
			<DismissKeyboardView style={styles.container}>
				<NalliText size={ETextSize.P_LARGE} style={styles.text}>
					{ text }
				</NalliText>
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
							onChangeText={this.onChangeNumberPad}
							maxLength={6} />
				</View>
			</DismissKeyboardView>
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
		color: 'white',
		paddingTop: 50,
		textAlign: 'center',
		marginHorizontal: 50,
	},
	numberPadContainer: {
		flex: 1,
		flexDirection: 'column',
		justifyContent: 'flex-end',
		paddingBottom: 50,
	},
	numberPadPinContainer: {
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 20,
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
