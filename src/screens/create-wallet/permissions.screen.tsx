import React from 'react';
import {
	StyleSheet,
	View,
} from 'react-native';

import NalliButton from '../../components/nalli-button.component';
import NalliText, { ETextSize } from '../../components/text.component';
import Colors from '../../constants/colors';
import ContactsService from '../../service/contacts.service';
import NotificationService from '../../service/notification.service';

interface PermissionsState {
	permission: number;
}

export default class Permissions extends React.Component<any, PermissionsState> {

	constructor(props) {
		super(props);
		this.state = {
			permission: 1,
		};
	}

	static navigationOptions = () => ({
		headerShown: false,
	})

	onContinuePress = async () => {
		if (this.state.permission == 1) {
			await NotificationService.registerForPushNotifications();
			this.setState({ permission: 2 });
		} else {
			await ContactsService.askPermission()
			this.props.navigation.navigate('CreateWalletWelcome');
		}
	}

	render = () => {
		const { permission } = this.state;

		return (
			<View style={styles.container}>
				<View style={styles.content}>
					<View style={styles.welcome}>
						<NalliText size={ETextSize.H1} style={styles.h1}>
							Permissions
						</NalliText>
						{permission == 1 &&
							<NalliText size={ETextSize.P_LARGE} style={styles.text}>
								We need your permission to send you notifications about incoming payments.
							</NalliText>
						}
						{permission == 2 &&
							<NalliText size={ETextSize.P_LARGE} style={styles.text}>
								We need your permission to use your contacts in order to allow you to use them as recipients. Nalli will never save information about your contacts unless you are about to use one as a recipient.
							</NalliText>
						}
					</View>
					<View style={styles.actions}>
						<NalliButton
								text="Continue"
								onPress={this.onContinuePress} />
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
		marginTop: 130,
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
