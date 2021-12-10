import { block, tools } from 'nanocurrency-web';

import CurrencyService from './currency.service';
import VariableStore, { NalliVariable } from './variable-store';
import WalletStore from './wallet-store';
import WalletService, { Account, EBlockSubType, ReceivedPendingBlock } from './wallet.service';

export interface NalliAccount extends Account {
	balance: string;
	active: boolean;
	pendingBlocks?: ReceivedPendingBlock[];
}

export default class WalletHandler {

	static lock: boolean = false;

	static async getAccountsBalancesAndHandlePending(): Promise<NalliAccount[]> {
		await VariableStore.setVariable(NalliVariable.PROCESSING_PENDING, true);
		const storedWallet = await WalletStore.getWallet();
		const addresses = storedWallet.accounts.map(acc => acc.address);
		const res = await WalletService.getWalletsBalances(addresses);

		const accounts: NalliAccount[] = [];
		for (const item of res) {
			const accountIndex = storedWallet.accounts.find(acc => acc.address == item.account).accountIndex;
			const { privateKey, ...rest } = storedWallet.accounts[accountIndex];
			accounts.push({
				...rest,
				balance: CurrencyService.formatNanoAmount(Number(item.balance)),
				active: item.active,
				pendingBlocks: item.pendingBlocks,
			});
		}

		await VariableStore.setVariable<NalliAccount[]>(NalliVariable.ACCOUNTS_BALANCES, accounts);
		if (this.lock) {
			return accounts;
		}

		for (const account of accounts) {
			if (account.pendingBlocks) {
				this.lock = true;
				for (const pending of account.pendingBlocks) {
					const walletInfo = await WalletService.getWalletInfoAddress(account.address);
					const signedBlock = block.receive({
						amountRaw: pending.amount,
						toAddress: walletInfo.address,
						frontier: walletInfo.frontier,
						representativeAddress: walletInfo.representativeAddress,
						transactionHash: pending.hash,
						walletBalanceRaw: walletInfo.balance,
						work: walletInfo.work,
					}, storedWallet.accounts[account.accountIndex].privateKey);
					await WalletService.publishTransaction({
						subtype: EBlockSubType.RECEIVE,
						block: signedBlock
					});

					let balance = +account.balance;
					balance += Number(tools.convert(pending.amount, 'RAW', 'NANO'));
					account.balance = CurrencyService.formatNanoAmount(Number(balance));
					await VariableStore.setVariable<NalliAccount[]>(NalliVariable.ACCOUNTS_BALANCES, accounts);
				}
			}
		}

		await VariableStore.setVariable(NalliVariable.PROCESSING_PENDING, false);
		this.lock = false;
		return accounts;
	}

}