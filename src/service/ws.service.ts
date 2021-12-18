import { Client, StompSubscription } from '@stomp/stompjs';

import AuthStore from './auth-store';

export default class WsService {

	static protocol = process.env.DEV ? 'ws://' : 'wss://';
	static host = process.env.API_HOST ?? 'api.nalli.app';

	static client: Client;
	static stompSubscription: StompSubscription;

	static subscribe = async (callback: (event: WebSocketNotification) => void): Promise<void> => {
		const base = this.protocol + this.host;
		const headers = await this.getHeaders();

		this.client = new Client();
		this.client.configure({
			brokerURL: `${base}/ws`,
			onConnect: () => {
				this.stompSubscription = this.client.subscribe(
					'/user/topic/notifications',
					message => callback(JSON.parse(message.body)),
					headers);
				this.client.publish({
					destination: '/app/notifications',
					headers: headers,
				});
			},
			// debug: str => console.log(new Date(), str),
			// logRawCommunication: true,
			forceBinaryWSFrames: true,
			appendMissingNULLonIncoming: true,
		});

		this.client.activate();
	}

	static unsubscribe = () => {
		if (this.stompSubscription) {
			this.stompSubscription.unsubscribe();
			this.stompSubscription = undefined;
		}
	}

	private static async getHeaders() {
		const headers: any = {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
		};

		const token = await AuthStore.getAuthentication();
		if (token) {
			headers.NalliAuthorization = `Bearer ${token}`;
		} else {
			throw new Error('Cannot create WS connection without auth token');
		}

		return headers;
	}

}

export interface WebSocketNotification {
	type: EWebSocketNotificationType;
	payload: any;
}

export enum EWebSocketNotificationType {
	X0 = 'X0',
	CONFIRMATION_SEND = 'CONFIRMATION_SEND',
	CONFIRMATION_RECEIVE = 'CONFIRMATION_RECEIVE',
	PENDING_RECEIVED = 'PENDING_RECEIVED',
}
