import React from 'react';
import {
	ScrollView,
	StyleSheet,
	View,
} from 'react-native';

import { NativeStackScreenProps } from '@react-navigation/native-stack';

import NalliButton from '../../../components/nalli-button.component';
import NalliText, { ETextSize } from '../../../components/text.component';
import Colors from '../../../constants/colors';

export default class CreateWalletImport extends React.PureComponent<NativeStackScreenProps<any>, any> {

	constructor(props) {
		super(props);
	}

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
					<NalliText size={ETextSize.H1} style={styles.h1}>
						Import wallet
					</NalliText>
					<NalliText size={ETextSize.P_LARGE} style={styles.text}>
						To import your wallet, you will need to either input your recovery (mnemonic) phrase or wallet seed.
					</NalliText>
					<NalliText size={ETextSize.P_LARGE} style={styles.text}>
						We will encrypt your seed to your device. Your device handles all transaction signing operations,
						this means that your seed will never be compromised by sending it out of your device.
					</NalliText>
				</ScrollView>
				<View style={styles.actions}>
					<View style={styles.action}>
					<NalliButton
							text='Write recovery phrase'
							icon='newspaper-outline'
							solid
							onPress={this.onRecoveryPress} />
					</View>
					<View style={styles.action}>
					<NalliButton
							text='Write seed manually'
							icon='md-key'
							solid
							onPress={this.onManualPress} />
					</View>
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
		marginTop: 15,
	},
	action: {
		paddingTop: 15,
	},
});
