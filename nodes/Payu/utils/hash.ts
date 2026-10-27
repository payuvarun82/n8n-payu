import { createHash } from 'crypto';
import type { IExecuteFunctions, IHttpRequestOptions } from 'n8n-workflow';
import type { PayuCredentials } from '../types';
import { API_ENDPOINTS } from '../constants';

/**
 * Computes PayU's SHA-512 hash for v1 postservice APIs.
 * Standard formula: sha512(key|command|var1|salt)
 */
export function computePayuHash(parts: string[]): string {
	const str = parts.join('|');
	return createHash('sha512').update(str).digest('hex');
}

export async function getPayuCredentials(context: IExecuteFunctions): Promise<PayuCredentials> {
	return context.getCredentials('payuApi') as Promise<PayuCredentials>;
}

export function getPostserviceUrl(environment: 'test' | 'live'): string {
	return environment === 'live'
		? API_ENDPOINTS.POSTSERVICE_LIVE
		: API_ENDPOINTS.POSTSERVICE_TEST;
}

export function getPaymentLinksBaseUrl(environment: 'test' | 'live'): string {
	return environment === 'live'
		? API_ENDPOINTS.PAYMENT_LINKS_LIVE
		: API_ENDPOINTS.PAYMENT_LINKS_TEST;
}

/**
 * Fetches a short-lived OAuth2 Bearer token for Payment Links APIs.
 * Uses merchant key as client_id and merchant salt as client_secret.
 * Scopes: create_payment_links read_payment_links
 */
export async function getPaymentLinksToken(
	context: IExecuteFunctions,
	credentials: PayuCredentials,
	scope: string,
): Promise<string> {
	if (!credentials.paymentLinksClientId || !credentials.paymentLinksClientSecret) {
		throw new Error(
			'Payment Links Client ID and Client Secret are required. ' +
			'Get them from PayU Dashboard → Developer → Payment Links OAuth credentials.',
		);
	}

	const tokenUrl = credentials.environment === 'live'
		? API_ENDPOINTS.OAUTH_TOKEN_LIVE
		: API_ENDPOINTS.OAUTH_TOKEN_TEST;

	const options: IHttpRequestOptions = {
		method: 'POST',
		url: tokenUrl,
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			client_id: credentials.paymentLinksClientId,
			client_secret: credentials.paymentLinksClientSecret,
			grant_type: 'client_credentials',
			scope,
		}).toString(),
	};

	let raw: unknown;
	try {
		raw = await context.helpers.request(options);
	} catch (err: any) {
		const body = err.response?.body || err.message || String(err);
		throw new Error(`PayU OAuth token request failed: ${typeof body === 'object' ? JSON.stringify(body) : body}`);
	}

	// Parse if string
	const response = (typeof raw === 'string' ? JSON.parse(raw) : raw) as Record<string, unknown>;

	const token = (response.access_token || response.token || response.accessToken) as string | undefined;
	if (!token) {
		throw new Error(`PayU returned no token. Full response: ${JSON.stringify(response)}`);
	}
	return token;
}
