import AuthStore from './auth-store';
import NavigationService from './navigation.service';
import VariableStore, { NalliVariable } from './variable-store';

export default class HttpService {

	static protocol = process.env.DEV ? 'http://' : 'https://';
	static host = process.env.API_HOST ?? 'api.nalli.app';

	static get = async <T> (uri: string): Promise<T> => {
		const base = this.protocol + this.host;
		const final = `${base}/api${uri}`;
		return await fetch(
			final,
			{
				method: 'GET',
				headers: await this.getHeaders(),
			}
		)
		.then(async res => await this.handleResponse(res))
		.catch(err => {
			console.log(`Error in GET ${final}`, err);
			throw err;
		});
	}

	static post = async <T> (uri: string, body: any): Promise<T> => {
		const base = this.protocol + this.host;
		const final = `${base}/api${uri}`;
		return await fetch(
			final,
			{
				method: 'POST',
				headers: await this.getHeaders(),
				body: JSON.stringify(body),
			}
		)
		.then(async res => await this.handleResponse(res))
		.catch(err => {
			console.log(`Error in POST ${final}`, err);
			throw err;
		});
	}

	private static async getHeaders() {
		const headers: any = {
			'Accept': 'application/json',
			'Content-Type': 'application/json',
			'Device-Id': await VariableStore.getVariable(NalliVariable.DEVICE_ID),
			'Nalli-Account': await VariableStore.getVariable(NalliVariable.SELECTED_ACCOUNT),
		};

		const token = await AuthStore.getAuthentication();
		if (token) {
			headers.NalliAuthorization = `Bearer ${token}`;
		}

		return headers;
	}

	private static async handleResponse(res: Response) {
		const refreshToken = res.headers.get('Refresh-Token');
		if (refreshToken) {
			await AuthStore.setAuthentication(res.headers.get('Refresh-Token'));
		}

		const expires = res.headers.get('Token-Expires');
		if (expires) {
			await AuthStore.setExpires(expires);
		}

		if (!res.ok) {
			if (res.status == 401) {
				NavigationService.navigate('Login');
				await AuthStore.clearAuthentication();
				AuthStore.clearExpires();
			} else if (res.status == 400) {
				throw new HttpError(+res.headers.get('x-nalli-error'));
			}
			throw `HTTP ${res.status} ${res.statusText}`;
		} else {
			const len = res.headers.get('Content-Length');
			if (len != '0') {
				const responseBody = await res.text();
				try {
					return JSON.parse(responseBody);
				} catch {
					return responseBody;
				}
			}
		}
	}

}

export class HttpError {
	code: NalliErrorCode;

	constructor(code: NalliErrorCode) {
		this.code = code;
	}
}

export enum NalliErrorCode {
	X0,
	USER_ALREADY_EXISTS,
	LOGIN_FAILED,
	NO_AUTHORIZED_DEVICE,
	INVALID_PHONE,
	NO_USER,
	NO_ACCOUNT,
	INVALID_PARAMETERS,
	OTP_EXPIRED,
	OTP_ALREADY_CREATED_DIFFERENT_NUMBER,
	ACCOUNT_DISABLED,
	NO_DEVICE_ID,
}
