import { PermissionStatus } from 'expo-modules-core';
import { Notification, addNotificationReceivedListener, getExpoPushTokenAsync, getPermissionsAsync, requestPermissionsAsync } from 'expo-notifications';

import AuthService from './auth.service';
import ClientService from './client.service';

export default class NotificationService {

	static async registerForPushNotifications(): Promise<boolean> {
		let { status } = await getPermissionsAsync();
		if (status != PermissionStatus.GRANTED) {
			let askStatus = await requestPermissionsAsync();
			status = askStatus.status;
		}
		if (status == PermissionStatus.GRANTED) {
			const token = await getExpoPushTokenAsync();
			if (token) {
				await AuthService.registerPush({ token: token.data });
				return true;
			}
		}
		return false;
	}

	static async checkPushNotificationRegistrationStatusAndRenewIfNecessary(): Promise<void> {
		const pushEnabled = await ClientService.isPushEnabled();
		if (pushEnabled) {
			const { status } = await getPermissionsAsync();
			if (status == PermissionStatus.GRANTED) {
				const token = await getExpoPushTokenAsync();
				if (token) {
					await AuthService.registerPush({ token: token.data });
				}
			} else {
				// Push notifications are enabled for app, but client has removed permission, clear push token
				await AuthService.registerPush({ token: '' });
			}
		}
	}

	static async listenForPushNotifications(listener: (event: Notification) => void): Promise<any> {
		const { status } = await getPermissionsAsync();
		if (status == PermissionStatus.GRANTED) {
			return addNotificationReceivedListener(listener);
		}
	}

}
