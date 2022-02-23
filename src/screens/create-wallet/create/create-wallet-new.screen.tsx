import { wallet } from 'nanocurrency-web';
import React from 'react';
import {
	StyleSheet,
	View,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { NavigationInjectedProps } from 'react-navigation';

import NalliButton from '../../../components/nalli-button.component';
import NalliText, { ETextSize } from '../../../components/text.component';
import Colors from '../../../constants/colors';
import { Wallet, WalletType } from '../../../service/wallet-store';

export default class CreateWalletNew extends React.PureComponent<NavigationInjectedProps, any> {

	constructor(props) {
		super(props);
		this.state = {
			process: false,
		};
	}

	static navigationOptions = () => {
		return {
			headerStyle: { height: 75, elevation: 0, shadowOpacity: 0 },
			headerTitle: 'New wallet',
		};
	}

	onChangeText = (key, val) => {
		this.setState({ [key]: val });
	}

	onCreateWalletPress = () => {
		this.setState({ process: true });
		const generated: Wallet = { ...wallet.generate(), type: WalletType.HD_WALLET };
		this.props.navigation.navigate('WalletMnemonic', { generated });
		this.setState({ process: false });
	}

	render = () => {
		const { process } = this.state;
		return (
			<View style={styles.container}>
				<ScrollView contentContainerStyle={styles.content}>
					<NalliText size={ETextSize.H1} style={styles.h1}>
						New wallet
					</NalliText>
					<NalliText size={ETextSize.H2} style={styles.h1}>
						Please read carefully.
					</NalliText>
					<NalliText size={ETextSize.P_LARGE} style={styles.text}>
						You are solely responsible in securely storing the recovery phrase. If you lose it and
						cannot access your phone, you will lose your assets forever.
					</NalliText>
					<NalliText size={ETextSize.P_LARGE} style={styles.text}>
						A recovery phrase will be generated for you by this device. This is a list of 24 words.
						You should write it down and place it in a secure place. This is the key to your assets.
					</NalliText>
					<NalliText size={ETextSize.P_LARGE} style={styles.text}>
						Your assets are not stored in your phone. They are in the Nano network.
						Using the key, you (and anyone else) will be able to control your assets in the network
						even if you no longer have access to this application.
					</NalliText>
					<View style={styles.actions}>
						<NalliButton
								text='Create my wallet'
								solid
								style={styles.action}
								disabled={process}
								onPress={this.onCreateWalletPress} />
					</View>
				</ScrollView>
			</View>
		);
	}

}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: 'white',
	},
	content: {
		flexGrow: 1,
		paddingTop: 20,
		alignItems: 'center',
	},
	h1: {
		marginBottom: 20,
		color: Colors.main,
	},
	text: {
		width: '80%',
		textAlign: 'center',
		marginBottom: 12,
	},
	actions: {
		flex: 1,
		width: '100%',
		justifyContent: 'flex-end',
		paddingHorizontal: 20,
		marginBottom: 30,
		marginTop: 30,
	},
	action: {
	},
});
