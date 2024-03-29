import HttpService from './http.service';

export default class ClientService {

	private static readonly uri = '/client';

	private static client: Client;

	static async getClient(fromCache = true) {
		if (!this.client || !fromCache) {
			this.client = await HttpService.get<Client>(`${this.uri}`);
		}
		return this.client;
	}

	static getClientAddress(phone: string) {
		return HttpService.get<RecipientAddress>(`${this.uri}/v2/address/${phone}`);
	}

	static usersExist(hashes: string[]) {
		return HttpService.post<string[]>(`${this.uri}/users-exist`, hashes);
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

	static deleteAccount() {
		return HttpService.get<void>(`${this.uri}/delete`);
	}

	static userExistsByAddress(address: string) {
		return HttpService.get<boolean>(`${this.uri}/exists/${address}`);
	}

}

export interface Client {
	id: string;
	phone: string;
	country: string;
}

export interface RecipientAddress {
	address: string;
	id: string;
	lastLogin: string;
	nalliUser: boolean;
}
