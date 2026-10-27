import type { INodeProperties, IExecuteFunctions, IHttpRequestOptions } from 'n8n-workflow';
import { ApplicationError } from 'n8n-workflow';
import { Operation } from '../enums';
import { computePayuHash, getPayuCredentials, getPostserviceUrl } from '../utils';
import { ERROR_MESSAGES } from '../constants';
import type { VerifyPaymentResponse } from '../types';

export const verifyPaymentDescription: INodeProperties[] = [
	{
		displayName: 'Transaction ID',
		name: 'txnid',
		type: 'string',
		displayOptions: {
			show: { operation: [Operation.VERIFY_PAYMENT] },
		},
		default: '',
		required: true,
		placeholder: 'IhfgcZnXR4o4nB',
		description: "The merchant's transaction ID used when initiating the payment",
	},
];

export async function executeVerifyPayment(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<VerifyPaymentResponse> {
	const txnid = this.getNodeParameter('txnid', itemIndex) as string;
	if (!txnid) throw new ApplicationError(ERROR_MESSAGES.MISSING_TXN_ID);

	const credentials = await getPayuCredentials(this);
	const hash = computePayuHash([credentials.merchantKey, 'verify_payment', txnid, credentials.merchantSalt]);

	const options: IHttpRequestOptions = {
		method: 'POST',
		url: getPostserviceUrl(credentials.environment),
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			key: credentials.merchantKey,
			command: 'verify_payment',
			var1: txnid,
			hash,
		}).toString(),
	};

	return this.helpers.request(options) as Promise<VerifyPaymentResponse>;
}
