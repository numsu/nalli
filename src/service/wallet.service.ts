import PhoneNumberSigner from '../crypto/phone-number-signer';
import HttpService from './http.service';

export default class WalletService {

	private static readonly uri = '/wallet';
	private static readonly phoneNumberSigner = new PhoneNumberSigner();

	static async saveNewWallet(account: Account) {
		const { privateKey, ...rest } = account;
		const signature = await this.phoneNumberSigner.sign(privateKey);
		return HttpService.post<void>(`${this.uri}/new`, { signature, account: rest });
	}

	static async saveNewAccount(account: Account) {
		const { privateKey, ...rest } = account;
		const signature = await this.phoneNumberSigner.sign(privateKey);
		return HttpService.post<void>(`${this.uri}/account/new`, { signature, account: rest });
	}

	static async removeAccount(account: Account) {
		const { privateKey, ...rest } = account;
		return HttpService.post<void>(`${this.uri}/account/remove`, rest);
	}

	static getWalletBalance() {
		return HttpService.get<WalletBalanceResponse>(`${this.uri}/balance`);
	}

	static getWalletsBalances(addresses: string[]) {
		return HttpService.post<WalletBalanceResponse[]>(`${this.uri}/balances`, addresses);
	}

	static getWalletInfo() {
		return HttpService.get<WalletInfoResponse>(`${this.uri}/info`);
	}

	static getWalletInfoAddress(address?: string) {
		return HttpService.get<WalletInfoResponse>(`${this.uri}/info/${address}`);
	}

	static getWalletTransactions(amount: number, offset: number) {
		return HttpService.get<WalletTransaction[]>(`${this.uri}/v2/transactions/${amount}/${offset}`);
	}

	static isWalletOpened(address: string) {
		return HttpService.get<boolean>(`${this.uri}/opened/${address}`);
	}

	static publishTransaction(block: BlockProcess) {
		return HttpService.post<string>(`${this.uri}/publish/v2`, block);
	}

	static createPendingSend(phone: string) {
		return HttpService.post<PendingSend>(`${this.uri}/pending`, { phone });
	}

	static returnPendingSend(id: string) {
		return HttpService.get<void>(`${this.uri}/pending/${id}/return`);
	}

}

export interface Wallet {
	mnemonic: string;
	seed: string;
	accounts: Account[];
}

export interface Account {
	accountIndex: number;
	privateKey?: string;
	publicKey: string;
	address: string;
}

export interface WalletInfoResponse {
	frontier: string;
	balance: string;
	address: string;
	representativeAddress: string;
	work: string;
}

export interface WalletBalanceResponse {
	status: 'OK' | 'NO_WALLET' | 'ACCOUNT_NOT_ACTIVE';
	account: string;
	balance: string;
	pending: string;
	active: boolean;
	pendingBlocks?: ReceivedPendingBlock[];
}

export interface ReceivedPendingBlock {
	hash: string;
	amount: string;
	source: string;
}

export interface WalletTransaction {
	phoneHash: string;
	account: string;
	type: string;
	amount: string;
	timestamp: number;
	height: number;
	hash: string;
	pendingId: string;
	pendingStatus: EPendingStatus;
	custodialAccount: string;
	custodialHash: string;
}

export interface BlockProcess {
	subtype: EBlockSubType;
	block: SignedBlock;
}

export interface SignedBlock {
    type: 'state';
    account: string;
    previous: string;
    representative: string;
    balance: string;
    link: string;
    signature: string;
    work?: string;
}

export interface PendingSend {
	id: string;
	phone: string;
	address: string;
	status: EPendingStatus;
}

export enum EPendingStatus {
	X0 = 'X0',
	CREATED = 'CREATED',
	FILLED = 'FILLED',
	RETURNED = 'RETURNED',
	SETTLED = 'SETTLED',
}

export enum EBlockSubType {
	SEND = 'send',
	RECEIVE = 'receive',
	// OPEN = 'open', backend will handle open subtype
	CHANGE = 'change',
}
