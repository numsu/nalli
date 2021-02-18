import React from 'react';
import {
	StyleSheet,
	Text,
	View,
} from 'react-native';

import NalliButton from '../../components/nalli-button.component';
import Colors from '../../constants/colors';
import AuthService from '../../service/auth.service';
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
		header: null,
	})

	onContinuePress = async () => {
		if (this.state.permission == 1) {
			const token = await NotificationService.registerForPushNotifications();
			if (token) {
				await AuthService.registerPush({ token });
			}
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
						<Text style={styles.h1}>
							Permissions
						</Text>
						{permission == 1 &&
							<Text style={styles.text}>
								We need your permission to send you notifications about incoming payments.
							</Text>
						}
						{permission == 2 &&
							<Text style={styles.text}>
								We need your permission to use your contacts in order to allow you to use them as recipients. Nalli will never save information about your contacts unless you are about to use one as a recipient.
							</Text>
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
		fontSize: 40,
		fontWeight: '600',
		marginBottom: 50,
		color: Colors.main,
	},
	text: {
		fontSize: 20,
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
