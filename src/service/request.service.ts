import HttpService from './http.service';

export default class RequestService {

	private static readonly uri = '/request';

	static newRequest(req: NewRequest) {
		return HttpService.post<void>(`${this.uri}`, req);
	}

	static getRequestsReceived() {
		return HttpService.get<RequestsResponse>(`${this.uri}/received`);
	}

	static cancelRequest(id: string) {
		return HttpService.get<void>(`${this.uri}/cancel/${id}`);
	}

	static ignoreRequest(id: string) {
		return HttpService.get<void>(`${this.uri}/ignore/${id}`);
	}

}

export interface NewRequest {
	recipientId: string;
	amount: string;
	message: string;
}

export interface RequestsResponse {
	hasMore: boolean;
	requests: Request[];
}

export interface Request {
	requestId: string;
	sender: boolean;
	phoneHash: string;
	amount: string;
	message: string;
	status: ERequestStatus;
	address?: string;
	created: string;
}

export enum ERequestStatus {
	X0,
	SENT,
	CANCELED,
	IGNORED,
	PAID,
}
