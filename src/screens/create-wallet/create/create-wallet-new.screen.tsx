import { wallet } from 'nanocurrency-web';
import React from 'react';
import {
	StyleSheet,
	View,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { HeaderBackButton } from 'react-navigation';

import NalliButton from '../../../components/nalli-button.component';
import NalliText, { ETextSize } from '../../../components/text.component';
import Colors from '../../../constants/colors';
import { Wallet, WalletType } from '../../../service/wallet-store';

export default class CreateWalletNew extends React.Component<any, any> {

	constructor(props) {
		super(props);
		this.state = {
			process: false,
		};
	}

	static navigationOptions = ({ navigation }) => ({
		headerStyle: { height: 60 },
		headerLeft: <HeaderBackButton tintColor={Colors.main} onPress={() => navigation.goBack(undefined)} />,
		headerLeftContainerStyle: { marginTop: 15 },
	})

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
					<NalliText size={ETextSize.P_LARGE} style={styles.text}>
						A cryptocurrency wallet is basically just a long cryptographic key.
						The assets are not stored inside your phone, but on the blockchain. Using the key, you will be able to access
						your assets even though you don't have access to your phone or this application.
						Whoever holds the key will also be able to control the assets inside the wallet.
					</NalliText>
					<NalliText size={ETextSize.P_LARGE} style={styles.text}>
						We will generate a secure key for you. This key is a list of 24 words.
						You should write it down and place it in a secure place.
					</NalliText>
					<View style={styles.actions}>
						<NalliButton
								text="Create my wallet"
								solid={true}
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
