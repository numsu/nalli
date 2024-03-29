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

import { StackActions } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import Colors from '../constants/colors';
import AuthStore from '../service/auth-store';
import ClientService from '../service/client.service';
import ContactsService from '../service/contacts.service';
import VariableStore, { NalliVariable } from '../service/variable-store';
import WalletStore from '../service/wallet-store';

export default class AuthLoadingScreen extends React.PureComponent<NativeStackScreenProps<any>, any> {

	constructor(props) {
		super(props);
		this.state = {
			status: 1,
		};
	}

	componentDidMount() {
		this.bootstrapAsync();
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

			const deviceId = await VariableStore.getVariable<string>(NalliVariable.DEVICE_ID);
			if (!deviceId || deviceId == 'undefined') {
				await VariableStore.setVariable(NalliVariable.DEVICE_ID, uuid.v4());
			}

			const client = await AuthStore.getClient();
			if (!client) {
				// If no client information set, navigate to welcome screen
				this.props.navigation.dispatch(StackActions.replace('Auth'));
				return;
			}

			try {
				await ClientService.getClient(false);
				await ContactsService.getContacts(false);
				const wallet = await WalletStore.getWallet();
				if (wallet) {
					this.props.navigation.dispatch(StackActions.replace('Home'));
				} else {
					this.props.navigation.dispatch(StackActions.replace('CreateWallet'));
				}
			} catch {
				// If login token expired, navigate to pin screen
				await AuthStore.clearAuthentication();
				this.props.navigation.dispatch(StackActions.replace('Login'));
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
				<StatusBar translucent style='light' />
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
		fontSize: 12,
		color: 'white',
	},
});
