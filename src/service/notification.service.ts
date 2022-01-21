import { Notification, addNotificationReceivedListener, getExpoPushTokenAsync } from 'expo-notifications';
import * as Permissions from 'expo-permissions';

import AuthService from './auth.service';
import ClientService from './client.service';

export default class NotificationService {

	static async registerForPushNotifications(): Promise<boolean> {
		let { status } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
		if (status != Permissions.PermissionStatus.GRANTED) {
			let askStatus = await Permissions.askAsync(Permissions.NOTIFICATIONS);
			status = askStatus.status;
		}
		if (status == Permissions.PermissionStatus.GRANTED) {
			const token = await getExpoPushTokenAsync();
			if (token) {
				await AuthService.registerPush({ token: token.data });
				return true;
			}
		}
		return false;
		// For newer versions:
		// let { status } = await getPermissionsAsync();
		// if (status != PermissionStatus.GRANTED) {
		// 	let askStatus = await requestPermissionsAsync();
		// 	status = askStatus.status;
		// }
		// if (status == PermissionStatus.GRANTED) {
		// 	const token = await getExpoPushTokenAsync();
		// 	if (token) {
		// 		await AuthService.registerPush({ token: token.data });
		// 		return true;
		// 	}
		// }
		// return false;
	}

	static async checkPushNotificationRegistrationStatusAndRenewIfNecessary(): Promise<void> {
		const pushEnabled = await ClientService.isPushEnabled();
		if (pushEnabled) {
			const { status } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
			// const { status } = await getPermissionsAsync();
			// if (status == PermissionStatus.GRANTED) {
			if (status == Permissions.PermissionStatus.GRANTED) {
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
		const { status } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
		// const { status } = await getPermissionsAsync();
		// if (status == PermissionStatus.GRANTED) {
		if (status == Permissions.PermissionStatus.GRANTED) {
			return addNotificationReceivedListener(listener);
		}
	}

}
