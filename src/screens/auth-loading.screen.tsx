import { StatusBar } from 'expo-status-bar';
import * as Updates from 'expo-updates'
import React from 'react';
import {
	ImageBackground,
	StyleSheet,
	Text,
	View,
} from 'react-native';

import Colors from '../constants/colors';
import { sleep } from '../constants/globals';
import AuthStore from '../service/auth-store';
import ClientService from '../service/client.service';
import WalletStore from '../service/wallet-store';

export default class AuthLoadingScreen extends React.Component<any, any> {

	constructor(props) {
		super(props);
		this.bootstrapAsync();
		this.state = {
			status: 1,
		};
	}

	async bootstrapAsync() {
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
		await sleep(800);
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
				const rnd = Math.floor(Math.random() * 10);
				switch (rnd) {
					case 0:
						statusText = 'Spreading adoption';
						break;
					case 1:
						statusText = 'Looking for fees';
						break;
					case 2:
						statusText = 'Optimizing algorithms';
						break;
					case 3:
						statusText = 'Warming up the PoW machine';
						break;
					case 4:
						statusText = 'Scaling the network';
						break;
					case 5:
						statusText = 'Calculating transaction time';
						break;
					case 6:
						statusText = 'Polishing coins';
						break;
					case 7:
						statusText = 'Pruning the ledger';
						break;
					case 8:
						statusText = 'Validating the blockchain';
						break;
					case 9:
						statusText = 'Loading';
						break;
				}
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
