import HttpService from './http.service';

export default class ClientService {

	private static readonly uri = '/client';

	private static client: Client;

	static async getClient() {
		if (!this.client) {
			this.client = await HttpService.get<Client>(`${this.uri}`);
		}
		return this.client;
	}

	static getClientAddress(phone?: string) {
		return HttpService.get<RecipientAddress>(`${this.uri}/v2/address/${phone}`);
	}

	static getInvitedCount() {
		return HttpService.get<number>(`${this.uri}/invited-count`);
	}

	static isPushEnabled() {
		return HttpService.get<boolean>(`${this.uri}/push-status`);
	}

	static refresh() {
		return HttpService.get<void>(`${this.uri}/refresh`);
	}

}

export interface Client {
	id: string;
	phone: string;
	country: string;
}

export interface RecipientAddress {
	address: string;
	nalliUser: boolean;
	lastTransactionTimestamp: number;
}
