import moment from 'moment';

export default class CurrencyService {

	static resourceUrl = 'https://api.coingecko.com/api/v3/coins/nano?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false';
	static cachedResponse = { res: [], time: undefined };

	static async convert(amount: string, from: string, to: string): Promise<string> {
		const price = await this.getCurrentPrice(from, to);
		const convertToFiat = to.toLowerCase() != 'xrb';

		if (!amount) {
			amount = '0';
		}

		const parsed = parseFloat(amount.replace(/,/g, '.'));
		if (convertToFiat) {
			return (parsed * price).toFixed(2);
		}
		return (parsed / price).toFixed(4);
	}

	static async getCurrentPrice(from: string, to: string): Promise<number> {
		await this.updateCache();
		const convertToFiat = to.toLowerCase() != 'xrb';
		const fiat = convertToFiat ? to : from;
		return this.cachedResponse.res.filter(c => c.currency == fiat)[0].price;
	}

	static getNumberDecimalPlaces(number): number {
		const hasFraction = n => Math.abs(Math.round(n) - n) > 1e-10;
		let decimalPlaces = 0;
		while (hasFraction(number * (10 ** decimalPlaces)) && isFinite(10 ** decimalPlaces)) {
			decimalPlaces++;
		}
		return decimalPlaces;
	}

	static getCurrencyByISO(iso: string): Currency {
		return currencyList.find(c => c.iso == iso.toUpperCase());
	}

	static formatNanoAmount(balance: number): string {
		let decimalPlaces = CurrencyService.getNumberDecimalPlaces(balance);

		if (decimalPlaces > 6) {
			decimalPlaces = 6;
		}

		return balance.toFixed(Math.max(decimalPlaces, 3));
	}

	private static async updateCache() {
		if (!this.cachedResponse.time || moment().subtract(1, 'minutes').isAfter(this.cachedResponse.time)) {
			const req = await fetch(this.resourceUrl);
			if (req.ok) {
				const res = await req.json();
				this.cachedResponse.time = moment();
				this.cachedResponse.res = currencyList
						.map(c => c.iso.toLowerCase())
						.map(c => {
					return { currency: c, price: res.market_data.current_price[c] };
				})
			}
		}
	}

}

export interface Currency {
	iso: string;
	name: string;
	icon: string;
}

export const currencyList: Currency[] = [
	{
		iso: 'ARS',
		name: 'Argentine Peso',
		icon: '$',
	}, {
		iso: 'AUD',
		name: 'Australian Dollar',
		icon: '$',
	}, {
		iso: 'BRL',
		name: 'Brazilian Real',
		icon: '$',
	}, {
		iso: 'CAD',
		name: 'Canadian Dollar',
		icon: '$',
	}, {
		iso: 'CHF',
		name: 'Swiss Franc',
		icon: 'CHf',
	}, {
		iso: 'CLP',
		name: 'Chilean Peso',
		icon: '$',
	}, {
		iso: 'CNY',
		name: 'Chinese Yuan',
		icon: '¥',
	}, {
		iso: 'CZK',
		name: 'Czech Koruna',
		icon: 'Kč',
	}, {
		iso: 'DKK',
		name: 'Danish Krone',
		icon: 'Kr.',
	}, {
		iso: 'EUR',
		name: 'Euro',
		icon: '€',
	}, {
		iso: 'GBP',
		name: 'Pound Sterling',
		icon: '£',
	}, {
		iso: 'HKD',
		name: 'Hong Kong Dollar',
		icon: '$',
	}, {
		iso: 'HUF',
		name: 'Hungarian Forint',
		icon: 'Ft',
	}, {
		iso: 'IDR',
		name: 'Indonesian Rupiah',
		icon: 'Rp',
	}, {
		iso: 'ILS',
		name: 'Israeli New Shekel',
		icon: '₪',
	}, {
		iso: 'INR',
		name: 'Indian Rupee',
		icon: '₹',
	}, {
		iso: 'JPY',
		name: 'Japanese Yen',
		icon: '¥',
	}, {
		iso: 'KRW',
		name: 'Korean Republic Won',
		icon: '₩',
	}, {
		iso: 'MXN',
		name: 'Mexican Peso',
		icon: '$',
	}, {
		iso: 'MYR',
		name: 'Malaysian Ringgit',
		icon: 'RM',
	}, {
		iso: 'NOK',
		name: 'Norwegian Krone',
		icon: 'kr',
	}, {
		iso: 'NZD',
		name: 'New Zealand Dollar',
		icon: '$',
	}, {
		iso: 'PHP',
		name: 'Philippine peso',
		icon: '₱',
	}, {
		iso: 'PKR',
		name: 'Pakistani Rupee',
		icon: '₨',
	}, {
		iso: 'PLN',
		name: 'Polish złoty',
		icon: 'zł',
	}, {
		iso: 'RUB',
		name: 'Russian Ruble',
		icon: '₽',
	}, {
		iso: 'SEK',
		name: 'Swedish krona',
		icon: 'kr',
	}, {
		iso: 'SGD',
		name: 'Singapore Dollar',
		icon: '$',
	}, {
		iso: 'THB',
		name: 'Thai Baht',
		icon: '฿',
	}, {
		iso: 'TRY',
		name: 'Turkish lira',
		icon: '₺',
	}, {
		iso: 'TWD',
		name: 'New Taiwan dollar',
		icon: '$',
	}, {
		iso: 'USD',
		name: 'The United States dollar',
		icon: '$',
	}, {
		iso: 'ZAR',
		name: 'South African Rand',
		icon: 'R',
	}, {
		iso: 'SAR',
		name: 'Saudi Riyal',
		icon: 'SR',
	}, {
		iso: 'AED',
		name: 'United Aram Emirates Dirham',
		icon: 'د.إ',
	}, {
		iso: 'KWD',
		name: 'Kuwaiti Dinar',
		icon: 'KD',
	},
];
