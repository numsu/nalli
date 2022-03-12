import { tools } from 'nanocurrency-web';

import AuthStore from '../service/auth-store';
import WalletStore from '../service/wallet-store';

export default class PhoneNumberSigner {

	/**
	 * Sign the phone number with the first 64 characters of the wallet seed
	 *
	 * @returns a hexadecimal string which is the phone number signed with the seed
	 */
	static async sign(privateKey?: string): Promise<string> {
		const client = await AuthStore.getClient();

		if (!privateKey) {
			const wallet = await WalletStore.getWallet();
			privateKey = wallet.accounts[0].privateKey;
		}
		return tools.sign(privateKey, client.phone);
	}

}
