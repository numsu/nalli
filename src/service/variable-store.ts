import { Map } from 'core-js';
import { AsyncStorage, DeviceEventEmitter, EmitterSubscription } from 'react-native';

export default class VariableStore {

	static variables = new Map<NalliVariable, any>();
	static variablesKey = 'NalliVariables';

	static async setVariable<T>(key: NalliVariable, value: T): Promise<void> {
		try {
			const cloned = JSON.parse(JSON.stringify(value));
			if (this.variables.size == 0) {
				await this.populate();
			}
			this.variables.set(key, cloned);
			await AsyncStorage.setItem(this.variablesKey, JSON.stringify(this.variables));
			DeviceEventEmitter.emit(this.variablesKey + key, cloned);
		} catch (err) {
			console.error('Error saving variables to storage', err);
		}
	}

	static async getVariable<T>(key: NalliVariable, def?: T): Promise<T> {
		try {
			if (this.variables.size == 0) {
				await this.populate();
			}
			try {
				return JSON.parse(this.variables.get(key)) || def;
			} catch {
				return this.variables.get(key) || def;
			}
		} catch (err) {
			console.error('Error getting variables from storage', err);
			return undefined;
		}
	}

	static watchVariable<T>(key: NalliVariable, callback: (value?: T) => void): EmitterSubscription {
		return DeviceEventEmitter.addListener(this.variablesKey + key, callback);
	}

	static unwatchVariable(subscription: EmitterSubscription) {
		return DeviceEventEmitter.removeSubscription(subscription);
	}

	static async clearVariables() {
		try {
			this.variables = new Map();
			return await AsyncStorage.removeItem(this.variablesKey);
		} catch (err) {
			console.error('Error clearing variables from storage', err);
		}
	}

	private static async populate() {
		const storageVariables = await AsyncStorage.getItem(this.variablesKey);
		if (storageVariables) {
			this.variables = new Map(JSON.parse(storageVariables));
		}
	}

}

export enum NalliVariable {
	COUNTRY = 'country',
	CURRENCY = 'currency',
	DISPLAYED_CURRENCY = 'displayedCurrency',
	SELECTED_ACCOUNT = 'selectedAccount',
	SELECTED_ACCOUNT_INDEX = 'selectedAccountIndex',
	SEND_TAB = 'sendTab',
	SHOW_FIAT_DEFAULT = 'showFiatDefault',
	ACCOUNTS_BALANCES = 'accountsBalances',
	PROCESSING_PENDING = 'processingPending',
}
