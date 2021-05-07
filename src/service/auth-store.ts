//@ts-ignore
import { blake2b } from 'blakejs';
import * as SecureStore from 'expo-secure-store';
import { AsyncStorage } from 'react-native';

import Convert from '../crypto/convert';

export default class AuthStore {

	static authKey = 'NalliAuthorization';
	static pinKey = 'NalliPin';
	static clientKey = 'NalliClient';
	static expiresKey = 'NalliExpires';

	static client: Client;
	static authentication: string;
	static pin: string;
	static expires: string;

	static async getClient(): Promise<Client> {
		try {
			if (!this.client) {
				this.client = JSON.parse(await AsyncStorage.getItem(this.clientKey));
			}
			return this.client;
		} catch (err) {
			console.error(err);
			throw new Error('Error getting client from storage');
		}
	}

	static async setClient(client: Client): Promise<void> {
		try {
			this.client = client;
			return await AsyncStorage.setItem(this.clientKey, JSON.stringify(this.client));
		} catch (err) {
			console.error(err);
			throw new Error('Error setting client to storage');
		}
	}

	static async clearClient(): Promise<void> {
		try {
			this.client = undefined;
			return await AsyncStorage.removeItem(this.clientKey, () => (
				console.log('Client information cleared')
			));
		} catch (err) {
			console.error(err);
			throw new Error('Error clearing client from storage');
		}
	}

	static async isValidPin(pin: string): Promise<boolean> {
		try {
			const hash = await SecureStore.getItemAsync(this.pinKey);
			const pinHash = Convert.ab2hex(blake2b(Convert.str2bin(pin)));
			return hash == pinHash;
		} catch (err) {
			console.error(err);
			throw new Error('Error validating pin in storage');
		}
	}

	static async getPin(): Promise<string> {
		try {
			return await SecureStore.getItemAsync(this.pinKey);
		} catch (err) {
			console.error(err);
			throw new Error('Error getting pin from storage');
		}
	}

	static async setPin(pin: string): Promise<void> {
		try {
			return await SecureStore.setItemAsync(this.pinKey, Convert.ab2hex(blake2b(Convert.str2bin(pin))));
		} catch (err) {
			console.error(err);
			throw new Error('Error setting pin to storage');
		}
	}

	static async clearPin(): Promise<void> {
		try {
			this.pin = undefined;
			return await SecureStore.deleteItemAsync(this.pinKey);
		} catch (err) {
			console.error(err);
			throw new Error('Error clearing pin from storage');
		}
	}

	static async getAuthentication(): Promise<string> {
		try {
			if (!this.authentication) {
				this.authentication = await AsyncStorage.getItem(this.authKey);
			}
			return this.authentication;
		} catch (err) {
			console.error(err);
			throw new Error('Error getting authentication from storage');
		}
	}

	static async setAuthentication(value: string): Promise<void> {
		try {
			this.authentication = value;
			return await AsyncStorage.setItem(this.authKey, value);
		} catch (err) {
			console.error(err);
			throw new Error('Error saving authentication to storage');
		}
	}

	static async clearAuthentication(): Promise<void> {
		try {
			this.authentication = undefined;
			return await AsyncStorage.removeItem(this.authKey, () => (
				console.log('Authentication cleared')
			));
		} catch (err) {
			console.error(err);
			throw new Error('Error clearing authentication from storage');
		}
	}

	static async getExpires(): Promise<string> {
		try {
			if (!this.expires) {
				this.expires = await AsyncStorage.getItem(this.expiresKey);
			}
			return this.expires;
		} catch (err) {
			console.error(err);
			throw new Error('Error getting expires from storage');
		}
	}

	static async setExpires(value: string): Promise<void> {
		try {
			this.expires = value;
			return await AsyncStorage.setItem(this.expiresKey, value);
		} catch (err) {
			console.error(err);
			throw new Error('Error saving expires to storage');
		}
	}

	static async clearExpires(): Promise<void> {
		try {
			this.expires = undefined;
			return await AsyncStorage.removeItem(this.expiresKey, () => (
				console.log('Expires cleared')
			));
		} catch (err) {
			console.error(err);
			throw new Error('Error clearing expires from storage');
		}
	}

}

export interface Client {
	id: string;
	phone: string;
	country: string;
}
