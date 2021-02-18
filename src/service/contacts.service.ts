import * as Contacts from 'expo-contacts';
import * as Permissions from 'expo-permissions';
import { Alert, Linking } from 'react-native';

import ClientService from './client.service';

const PNF = require('google-libphonenumber').PhoneNumberFormat;
const PNT = require('google-libphonenumber').PhoneNumberType;
const phoneUtil = require('google-libphonenumber').PhoneNumberUtil.getInstance();

export default class ContactsService {

	static saved: ContactItem[];

	static isValidNumber(countryCode: string, number: string): boolean {
		try {
			const phone = phoneUtil.parse(number, countryCode.toUpperCase());
			return phoneUtil.isValidNumber(phone) &&
					[PNT.FIXED_LINE_OR_MOBILE, PNT.MOBILE].includes(phoneUtil.getNumberType(phone));
		} catch (e) {
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
	}

	static async getContacts(alertNoPermission = true) {
		if (this.saved && this.saved.length > 0) {
			return this.saved;
		}
		if (await this.askPermission()) {
			const { data } = await Contacts.getContactsAsync({
				fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Name],
			});

			const defaultCountry = await this.getClientCountry();
			const contacts = data
					.filter(item => item.phoneNumbers && item.phoneNumbers.length != 0)
					.map(item => {
						const items = new Map();
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
								.forEach(number => {
									try {
										let initials = (item.firstName?.substr(0, 1) || '') + (item.lastName?.substr(0, 1) || '');
										if (!initials) {
											initials = item.name.substr(0, 1);
										}
										items.set(number.full, {
											id: item.id + number.full,
											name: item.name || 'Unnamed contact',
											initials: initials.toUpperCase(),
											formattedNumber: number.formatted,
											fullNumber: number.full,
										});
									} catch {
										// skip errors
									}
								});
						return [...items.values()];
					}).flat();
			this.saved = contacts;
			return contacts;
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
							onPress: () => Linking.openURL('app-settings:'),
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

	static async getClientCountry() {
		return (await ClientService.getClient()).country;
	}

	static clearCache() {
		this.saved = undefined;
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
}
