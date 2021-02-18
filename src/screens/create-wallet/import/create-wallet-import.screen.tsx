import React from 'react';
import {
	StyleSheet,
	Text,
	View,
} from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { HeaderBackButton } from 'react-navigation';

import NalliButton from '../../../components/nalli-button.component';
import Colors from '../../../constants/colors';

export default class CreateWalletImportMnemonic extends React.Component<any, any> {

	constructor(props) {
		super(props);
	}

	static navigationOptions = ({ navigation }) => ({
		headerLeft: <HeaderBackButton tintColor={Colors.main} onPress={() => navigation.goBack(undefined)} />,
	})

	onRecoveryPress = () => {
		this.props.navigation.navigate('WalletImportMnemonic');
	}

	onManualPress = () => {
		this.props.navigation.navigate('WalletImportSeed');
	}

	render = () => {
		return (
			<View style={styles.container}>
				<ScrollView contentContainerStyle={styles.content}>
					<Text style={styles.h1}>
						Import wallet
					</Text>
					<Text style={styles.text}>
						To import your wallet, you will need to either input your recovery (mnemonic) phrase or wallet seed.
					</Text>
					<Text style={styles.text}>
						We will encrypt your seed to your device. Your device handles all transaction signing operations,
						this means that your seed will never be compromised by sending it out of your device.
					</Text>
				</ScrollView>
				<View style={styles.actions}>
					<NalliButton
							text="Write recovery phrase"
							icon="ios-paper"
							solid={true}
							style={styles.action}
							onPress={this.onRecoveryPress} />
					<NalliButton
							text="Write seed manually"
							icon="md-key"
							solid={true}
							style={styles.action}
							onPress={this.onManualPress} />
				</View>
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
		fontSize: 30,
		fontWeight: '600',
		marginBottom: 20,
		color: Colors.main,
	},
	text: {
		fontSize: 20,
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
		marginTop: 15,
	},
});
