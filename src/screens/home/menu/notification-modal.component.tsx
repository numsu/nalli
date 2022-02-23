import React from 'react';
import {
	Alert,
	StyleSheet,
	View,
} from 'react-native';

import NalliModal from '../../../components/modal.component';
import NalliButton from '../../../components/nalli-button.component';
import NalliText, { ETextSize } from '../../../components/text.component';
import { openSettings } from '../../../constants/globals';
import AuthService from '../../../service/auth.service';
import NotificationService from '../../../service/notification.service';

interface NotificationModalProps {
	isOpen: boolean;
	enabled: boolean;
	close: (status?: boolean) => void;
}

interface NotificationModalState {
	isOpen: boolean;
}

export default class NotificationModal extends React.PureComponent<NotificationModalProps, NotificationModalState> {

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
		const promise = new Promise<boolean>(async resolve => {
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
								onPress: () => resolve(false),
							}, {
								text: 'Open settings',
								style: 'default',
								onPress: () => (openSettings(), resolve(false)),
							},
						],
					);
				} else {
					resolve(true);
				}
			} else {
				AuthService.registerPush({ token: '' });
				resolve(false);
			}
		});

		this.props.close(await promise);
	}

	render = () => {
		const { close, enabled } = this.props;
		const { isOpen } = this.state;

		return (
			<NalliModal
					isOpen={isOpen}
					onClose={close}
					header='Notifications'>
				<View style={styles.container}>
					<View>
						<NalliText size={ETextSize.H2} style={styles.text}>Notifications are currently { enabled ? 'enabled.' : 'disabled.' }</NalliText>
						<NalliText style={styles.text}>Nalli will send you notifications about incoming payments and when someone you have sent Nano using SMS has registered and claimed it.</NalliText>
						<NalliText style={styles.text}>Do you want to receive these notifications in the future?</NalliText>
					</View>
					<View style={styles.buttonContainer}>
						<NalliButton
								text='No'
								small
								style={styles.buttonStyle}
								onPress={() => this.selectNotificationState(false)} />
						<NalliButton
								text='Yes'
								small
								solid
								style={styles.buttonStyle}
								onPress={() => this.selectNotificationState(true)} />
					</View>
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
	buttonContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	buttonStyle: {
		width: '48%',
	},
});
