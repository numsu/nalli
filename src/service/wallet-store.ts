import * as SecureStore from 'expo-secure-store';

import { replacer, reviver } from '../constants/globals';

export default class WalletStore {

	static readonly walletKey = 'walletData';
	static wallet: Wallet;

	static async setWallet(newWallet: Wallet) {
		this.wallet = newWallet;
		Object.freeze(this.wallet);
		return await SecureStore.setItemAsync(this.walletKey, JSON.stringify(newWallet, replacer));
	}

	static async getWallet() {
		if (!this.wallet) {
			const storedWallet = await SecureStore.getItemAsync(this.walletKey);
			this.wallet = JSON.parse(storedWallet, reviver);
			// Handle imported wallets from earlier versions
			if (this.wallet && this.wallet.type === undefined) {
				if (!!this.wallet.mnemonic) {
					this.wallet.type = WalletType.HD_WALLET;
				} else if (this.wallet.seed.length === 128) {
					this.wallet.type = WalletType.HD_WALLET;
				} else {
					this.wallet.type = WalletType.LEGACY_WALLET;
				}
				WalletStore.setWallet(this.wallet);
			}

			Object.freeze(this.wallet);
		}
		return this.wallet;
	}

	static async clearWallet() {
		this.wallet = undefined;
		return await SecureStore.deleteItemAsync(this.walletKey);
	}

}

export interface Wallet {
	type: WalletType;
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

export enum WalletType {
	HD_WALLET,
	LEGACY_WALLET,
}
