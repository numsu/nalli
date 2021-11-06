import React from 'react';
import {
	Alert,
	Linking,
	StyleSheet,
	View,
} from 'react-native';

import NalliModal from '../../../components/modal.component';
import NalliButton from '../../../components/nalli-button.component';
import NalliText from '../../../components/text.component';
import AuthService from '../../../service/auth.service';
import NotificationService from '../../../service/notification.service';

interface NotificationModalProps {
	isOpen: boolean;
	close: (status?: boolean) => void;
}

interface NotificationModalState {
	isOpen: boolean;
}

export default class NotificationModal extends React.Component<NotificationModalProps, NotificationModalState> {

	constructor(props) {
		super(props);
		this.state = {
			isOpen: false,
		};
	}

	static getDerivedStateFromProps(nextProps, prevState) {
		if (prevState.isOpen != nextProps.isOpen) {
			return { isOpen: nextProps.isOpen };
		}
		return null;
	}

	selectNotificationState = async (notificationsEnabled: boolean) => {
		if (notificationsEnabled) {
			const success = await NotificationService.registerForPushNotifications();
			if (!success) {
				Alert.alert(
					'No permission',
					'You haven\'t given us a permission to send you notifications. Please allow Nalli to send notifications in your settings.',
					[
						{
							text: 'Don\'t allow',
							style: 'cancel',
							onPress: () => undefined,
						}, {
							text: 'Open settings',
							style: 'default',
							onPress: () => Linking.openURL('app-settings:'),
						},
					],
				);
				return;
			}
		} else {
			await AuthService.registerPush({ token: '' });
		}

		this.props.close(notificationsEnabled);
	}

	render = () => {
		const { close } = this.props;
		const { isOpen } = this.state;

		return (
			<NalliModal
					isOpen={isOpen}
					onClose={close}
					header='Notifications'>
				<View style={styles.container}>
					<View>
						<NalliText style={styles.text}>Nalli will send you notifications about incoming payments and when someone that you've sent Nano via SMS has registered and claimed them.</NalliText>
						<NalliText style={styles.text}>Do you want to receive these notifications in the future?</NalliText>
					</View>
					<NalliButton
							text="Yes"
							solid={true}
							style={{ marginBottom: 10 }}
							onPress={() => this.selectNotificationState(true)} />
					<NalliButton
							text="No"
							onPress={() => this.selectNotificationState(false)} />
				</View>
			</NalliModal>
		);
	}

}

const styles = StyleSheet.create({
	container: {
		paddingBottom: 20,
	},
	text: {
		marginBottom: 20,
	},
});
