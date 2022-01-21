import { StatusBar } from 'expo-status-bar';
import * as Updates from 'expo-updates'
import React from 'react';
import {
	Alert,
	ImageBackground,
	StyleSheet,
	Text,
	View,
} from 'react-native';
import uuid from 'react-native-uuid';

import Colors from '../constants/colors';
import PhoneNumberSigner from '../crypto/phone-number-signer';
import AuthStore from '../service/auth-store';
import ClientService from '../service/client.service';
import VariableStore, { NalliVariable } from '../service/variable-store';
import WalletStore from '../service/wallet-store';

export default class AuthLoadingScreen extends React.Component<any, any> {

	readonly phoneNumberSigner = new PhoneNumberSigner();

	constructor(props) {
		super(props);
		this.bootstrapAsync();
		this.state = {
			status: 1,
		};
	}

	async bootstrapAsync() {
		try {
			try {
				const update = await Updates.checkForUpdateAsync();
				if (update.isAvailable) {
					this.setState({ status: 2 });
					this.forceUpdate();
					await Updates.fetchUpdateAsync();
					await Updates.reloadAsync();
					return;
				}
			} catch {
				// Error in updating, continue with old version
			}
			this.setState({ status: 3 });
			this.forceUpdate();

			const deviceId = await VariableStore.getVariable(NalliVariable.DEVICE_ID);
			if (!deviceId) {
				await VariableStore.setVariable(NalliVariable.DEVICE_ID, uuid.v4());
			}

			const client = await AuthStore.getClient();
			if (!client) {
				// If no client information set, navigate to welcome screen
				this.props.navigation.navigate('Welcome');
				return;
			}

			try {
				await ClientService.getClient();
				const wallet = await WalletStore.getWallet();
				if (wallet) {
					this.props.navigation.navigate('Home');
				} else {
					this.props.navigation.navigate('Permissions');
				}
			} catch {
				// If login token expired, navigate to pin screen
				await AuthStore.clearAuthentication();
				this.props.navigation.navigate('Login');
			}
		} catch (e) {
			Alert.alert(
				'Error during loading',
				e.message,
				[
					{
						text: 'Ok',
						style: 'default',
						onPress: () => undefined,
					},
				]);
		}
	}

	render = () => {
		const { status } = this.state;
		let statusText;
		switch (status) {
			case 1:
				statusText = 'Checking for updates';
				break;
			case 2:
				statusText = 'Updating Nalli';
				break;
			case 3:
			default:
				statusText = 'Loading';
				break;
		}

		return (
			<View style={styles.container}>
				<StatusBar translucent={true} style="light" />
				<ImageBackground resizeMode='contain' style={styles.image} source={require('../../src/assets/images/splash.png')}>
					<View style={styles.loading}>
						<Text style={styles.loadingText}>{statusText}...</Text>
					</View>
				</ImageBackground>
			</View>
		);
	}

}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: Colors.main,
	},
	image: {
		flex: 1,
		justifyContent: 'center',
	},
	loading: {
		alignSelf: 'center',
		marginTop: 200,
	},
	loadingText: {
		fontSize: 14,
		color: 'white',
	},
});
