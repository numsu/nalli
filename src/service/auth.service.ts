import HttpService from './http.service';

export default class AuthService {

	private static readonly uri = '/auth';

	static login(req: LoginRequest) {
		return HttpService.post<LoginResponse>(`${this.uri}/login`, req);
	}

	static register(req: RegisterRequest) {
		return HttpService.post<LoginResponse>(`${this.uri}/register`, req);
	}

	static registerOtp(req: RegisterRequest) {
		return HttpService.post<void>(`${this.uri}/register/otp`, req);
	}

	static registerPush(req: RegisterPushRequest) {
		return HttpService.post<void>(`${this.uri}/register/push`, req);
	}

	static checkDuplicate(req: LoginRequest) {
		return HttpService.post<boolean>(`${this.uri}/check/duplicate`, req);
	}

}

export interface LoginRequest {
	phoneNumber: string;
	phoneNumberCountry: string;
	signature: string;
}

export interface LoginResponse {
	accessToken: string;
	tokenType: 'Bearer';
}

export interface RegisterRequest {
	phoneNumber: string;
	phoneNumberCountry: string;
	otp: string;
}

export interface RegisterPushRequest {
	token: string;
}
