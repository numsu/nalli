import React from 'react';
import {
	StyleSheet,
	TouchableOpacity,
	View,
} from 'react-native';

import { StackActions } from '@react-navigation/native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';

import NalliIcon, { IconType } from '../../components/icon.component';
import NalliButton from '../../components/nalli-button.component';
import NalliText, { ETextSize } from '../../components/text.component';
import Colors from '../../constants/colors';
import { noop } from '../../constants/globals';
import AuthStore from '../../service/auth-store';

export default class CreateWalletWelcome extends React.PureComponent<NativeStackScreenProps<any>, any> {

	constructor(props) {
		super(props);
	}

	onChangeText = (key, val) => {
		this.setState({ [key]: val });
	}

	onImportPress = () => {
		this.props.navigation.navigate('WalletImport');
	}

	onCreatePress = () => {
		this.props.navigation.navigate('WalletNew');
	}

	onLogoutPress = async () => {
		await AuthStore.clearAuthentication();
		AuthStore.clearExpires().then(noop);
		this.props.navigation.dispatch(StackActions.replace('Login'));
	}

	render = () => {
		return (
			<View style={styles.container}>
				<TouchableOpacity style={styles.logout} onPress={this.onLogoutPress}>
					<NalliIcon style={{ color: Colors.main }} icon='logout' size={30} type={IconType.SIMPLE_LINE} />
				</TouchableOpacity>
				<View style={styles.content}>
					<View style={styles.welcome}>
						<NalliText size={ETextSize.H1} style={styles.h1}>
							Welcome
						</NalliText>
						<NalliText size={ETextSize.P_LARGE} style={styles.text}>
							To start using the app, you will need a wallet. You can either import an existing one or create a new one.
						</NalliText>
					</View>
					<View style={styles.actions}>
						<NalliButton
								text='Import'
								style={styles.action}
								onPress={this.onImportPress} />
						<NalliButton
								text='Create'
								solid
								style={styles.action}
								onPress={this.onCreatePress} />
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
	logout: {
		marginTop: 50,
		marginLeft: 20,
	},
	content: {
		marginTop: 60,
		flexGrow: 1,
		justifyContent: 'center',
	},
	welcome: {
		alignItems: 'center',
	},
	h1: {
		marginBottom: 50,
		color: Colors.main,
	},
	text: {
		width: '80%',
		textAlign: 'center',
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
