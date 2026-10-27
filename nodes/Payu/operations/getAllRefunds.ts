import type { INodeProperties, IExecuteFunctions, IHttpRequestOptions } from 'n8n-workflow';
import { ApplicationError } from 'n8n-workflow';
import { Operation } from '../enums';
import { computePayuHash, getPayuCredentials, getPostserviceUrl } from '../utils';
import { ERROR_MESSAGES } from '../constants';
import type { GetAllRefundsResponse } from '../types';

export const getAllRefundsDescription: INodeProperties[] = [
	{
		displayName: 'Transaction ID',
		name: 'txnid',
		type: 'string',
		displayOptions: {
			show: { operation: [Operation.GET_ALL_REFUNDS] },
		},
		default: '',
		required: true,
		placeholder: 'db97dd56eff7296e5061',
		description: "The merchant's original transaction ID (txnid) to fetch all refunds for",
	},
];

export async function executeGetAllRefunds(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<GetAllRefundsResponse> {
	const txnid = this.getNodeParameter('txnid', itemIndex) as string;
	if (!txnid) throw new ApplicationError(ERROR_MESSAGES.MISSING_TXN_ID);

	const credentials = await getPayuCredentials(this);
	const hash = computePayuHash([credentials.merchantKey, 'getAllRefundsFromTxnIds', txnid, credentials.merchantSalt]);

	const options: IHttpRequestOptions = {
		method: 'POST',
		url: getPostserviceUrl(credentials.environment),
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			key: credentials.merchantKey,
			command: 'getAllRefundsFromTxnIds',
			var1: txnid,
			hash,
		}).toString(),
	};

	return this.helpers.request(options) as Promise<GetAllRefundsResponse>;
}
