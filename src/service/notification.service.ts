import { Notifications } from 'expo';
import * as Permissions from 'expo-permissions';
import { Notification } from 'expo/build/Notifications/Notifications.types';

export default class NotificationService {

	static async registerForPushNotifications(): Promise<string> {
		let { status } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
		if (status != Permissions.PermissionStatus.GRANTED) {
			let askStatus = await Permissions.askAsync(Permissions.NOTIFICATIONS);
			status = askStatus.status;
		}
		if (status == Permissions.PermissionStatus.GRANTED) {
			return await Notifications.getExpoPushTokenAsync();
		}
		return '';
	}

	static async listenForPushNotifications(listener: (notification: Notification) => unknown): Promise<any> {
		const { status } = await Permissions.getAsync(Permissions.NOTIFICATIONS);
		if (status == Permissions.PermissionStatus.GRANTED) {
			return Notifications.addListener(listener);
		}
	}

}
