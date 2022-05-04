import { blake2bFinal, blake2bInit, blake2bUpdate } from 'blakejs';
import * as Contacts from 'expo-contacts';
import * as Permissions from 'expo-permissions';
import { Alert } from 'react-native';

import { openSettings, sleep } from '../constants/globals';
import Convert from '../crypto/convert';
import AuthStore from './auth-store';
import ClientService from './client.service';

const PNF = require('google-libphonenumber').PhoneNumberFormat;
const PNT = require('google-libphonenumber').PhoneNumberType;
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();

export default class ContactsService {

	private static isProcessing = false;
	private static saved = new Map<string, ContactItem>();
	private static numberToHash = new Map<string, string>();
	private static numberHashToContactId = new Map<string, string>();

	static isValidNumber(countryCode: string, number: string): boolean {
		try {
			const phone = phoneUtil.parse(number, countryCode.toUpperCase());
			return phoneUtil.isValidNumber(phone) &&
					[PNT.FIXED_LINE_OR_MOBILE, PNT.MOBILE].includes(phoneUtil.getNumberType(phone));
		} catch {
			return false;
		}
	}

	static getCountriesList(): CountryItem[] {
		const regions = phoneUtil.getSupportedRegions();
		const countries = regions.map(country => ({
			cca2: country,
			code: phoneUtil.getCountryCodeForRegion(country),
		}));

		return countries;
	}

	static async askPermission(): Promise<boolean> {
		const { status } = await Permissions.askAsync(Permissions.CONTACTS);
		return status == Permissions.PermissionStatus.GRANTED;
		// After Expo 44:
		// const { status } = await Contacts.getPermissionsAsync();
		// return status == Contacts.PermissionStatus.GRANTED;
	}

	static async getContacts(alertNoPermission = true): Promise<ContactItem[]> {
		if (!await AuthStore.isPhoneNumberFunctionsEnabled()) {
			return [];
		}

		while (this.isProcessing) {
			await sleep(10);
		}

		if (await this.askPermission()) {
			if (this.saved.size > 0) {
				return [ ...this.saved.values() ];
			}
			this.isProcessing = true;
			try {
				const { data } = await Contacts.getContactsAsync({
					fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
				});

				const defaultCountry = await this.getClientCountry();
				let contacts = data
						.filter(item => item.phoneNumbers && item.phoneNumbers.length != 0)
						.sort((a, b) => {
							const sortValueA = (a.lastName || '') + (a.firstName || '');
							const sortValueB = (b.lastName || '') + (b.firstName || '');
							if (sortValueA < sortValueB) return -1;
							if (sortValueA > sortValueB) return 1;
							return 0;
						})
						.map(item => {
							const items = new Map<string, ContactItem>();
							item.phoneNumbers
									.map(number => {
										try {
											return this.handleNumber(number.number, defaultCountry);
										} catch {
											return null;
										}
									})
									.filter(number => (
										number && number.mobile && number.full && number.formatted
									))
									.forEach(async number => {
										try {
											let initials = (item.firstName?.substr(0, 1) || '') + (item.lastName?.substr(0, 1) || '');
											if (!initials) {
												initials = item.name.substr(0, 1);
											}
											const contactItem = {
												id: item.id + number.full,
												name: item.name || 'Unnamed contact',
												initials: initials.toUpperCase(),
												formattedNumber: number.formatted,
												fullNumber: number.full,
												isNalliUser: false,
												numberHash: this.hash(number.full),
											};
											items.set(contactItem.id, contactItem);
										} catch {
											// skip errors
										}
									});
							return [ ...items.values() ];
						})
						.flat();
				contacts = await this.save(contacts);
				this.isProcessing = false;
				return contacts;
			} catch {
				this.isProcessing = false;
				throw new Error('Error when handling contacts');
			}
		} else {
			if (alertNoPermission) {
				Alert.alert(
					'No permission',
					'You haven\'t given us a permission to use your contacts. Please allow Nalli to use your contacts in your settings.\n\n Nalli will not save any data about your contacts unless you are about to use one as a recipient.',
					[
						{
							text: 'Don\'t allow',
							style: 'cancel',
							onPress: () => undefined,
						}, {
							text: 'Open settings',
							style: 'default',
							onPress: () => openSettings(),
						},
					],
				);
			}

			return [];
		}
	}

	static handleNumber(number, defaultLanguage): FormattedNumber {
		const parsed = phoneUtil.parseAndKeepRawInput(number.replace(/\s/g,''), defaultLanguage);
		return {
			full: phoneUtil.format(parsed, PNF.E164),
			formatted: phoneUtil.format(parsed, PNF.INTERNATIONAL),
			mobile: [PNT.FIXED_LINE_OR_MOBILE, PNT.MOBILE].includes(phoneUtil.getNumberType(parsed)),
		};
	}

	static async getClientCountry(): Promise<string> {
		return (await ClientService.getClient()).country;
	}

	static async refreshCache() {
		if (await AuthStore.isPhoneNumberFunctionsEnabled()) {
			this.saved.clear();
			await ContactsService.getContacts(false);
		}
	}

	static getContactByHash(hash: string): ContactItem {
		return this.saved.get(this.numberHashToContactId.get(hash));
	}

	private static async save(contacts: ContactItem[]): Promise<ContactItem[]> {
		const existsHashes = await ClientService.usersExist(contacts.map(contact => contact.numberHash));
		for (const contact of contacts) {
			if (existsHashes.includes(contact.numberHash)) {
				contact.isNalliUser = true;
			}
			this.store(contact);
		}

		return contacts;
	}

	private static hash(number: string): string {
		const previousHash = this.numberToHash.get(number);
		if (previousHash) {
			return previousHash;
		}

		const ctx = blake2bInit(32, undefined);
		blake2bUpdate(ctx, Convert.str2bin(number));
		const hashBin = blake2bFinal(ctx);
		const hash = Convert.ab2hex(hashBin);
		this.numberToHash.set(number, hash);

		return hash;
	}

	private static store(contact: ContactItem) {
		this.saved.set(contact.id, contact);
		this.numberHashToContactId.set(contact.numberHash, contact.id);
	}

}

export interface FormattedNumber {
	full: string;
	formatted: string;
	mobile: boolean;
}

export interface CountryItem {
	cca2: string;
	code: number;
}

export interface ContactItem {
	id: string;
	name: string;
	initials: string;
	formattedNumber: string;
	fullNumber: string;
	numberHash: string;
	isNalliUser: boolean;
}
