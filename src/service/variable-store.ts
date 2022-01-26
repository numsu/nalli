import { Map } from 'core-js';
import { DeviceEventEmitter, EmitterSubscription } from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';

import { replacer, reviver } from '../constants/globals';

export default class VariableStore {

	static variables = new Map<NalliVariable, any>();
	static readonly variablesKey = 'NalliVariables';

	static async setVariable<T>(key: NalliVariable, value: T): Promise<void> {
		try {
			const cloned = JSON.parse(JSON.stringify(value, replacer), reviver);
			if (this.variables.size == 0) {
				await this.populate();
			}
			this.variables.set(key, cloned);
			await AsyncStorage.setItem(this.variablesKey, JSON.stringify(this.variables, replacer));
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
				return this.variables.get(key) || def;
			} catch (e) {
				console.log('Error getting variable from storage', e);
			}
		} catch (e) {
			console.error('Error getting variables from storage', e);
		}
		return undefined;
	}

	static watchVariable<T>(key: NalliVariable, callback: (value?: T) => void): EmitterSubscription {
		return DeviceEventEmitter.addListener(this.variablesKey + key, callback);
	}

	static unwatchVariable(subscription: EmitterSubscription) {
		subscription.remove();
	}

	static async clear(): Promise<void> {
		await AsyncStorage.multiRemove(Array.from(this.variables.keys()));
		this.variables.clear();
	}

	private static async populate() {
		try {
			const storageVariables = await AsyncStorage.getItem(this.variablesKey, reviver);
			if (storageVariables) {
				this.variables = new Map(JSON.parse(storageVariables, reviver));
			}
		} catch (e) {
			this.variables = new Map();
		}
	}

}

export enum NalliVariable {
	ACCOUNTS_BALANCES = 'accountsBalances',
	APP_STATE = 'appState',
	BIOMETRICS_TYPE = 'biometricsType',
	COUNTRY = 'country',
	CURRENCY = 'currency',
	DEVICE_ID = 'deviceId',
	DISPLAYED_CURRENCY = 'displayedCurrency',
	NO_AUTOLOGIN = 'noAutologin',
	PROCESSING_PENDING = 'processingPending',
	SELECTED_ACCOUNT = 'selectedAccount',
	SELECTED_ACCOUNT_INDEX = 'selectedAccountIndex',
	SEND_TAB = 'sendTab',
	SHOW_FIAT_DEFAULT = 'showFiatDefault',
}
