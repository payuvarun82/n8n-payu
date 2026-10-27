import type { INodeProperties, IExecuteFunctions, IHttpRequestOptions } from 'n8n-workflow';
import { ApplicationError } from 'n8n-workflow';
import { Operation } from '../enums';
import { computePayuHash, getPayuCredentials, getPostserviceUrl } from '../utils';
import { ERROR_MESSAGES } from '../constants';
import type { TransactionInfoResponse } from '../types';

export const getTransactionInfoDescription: INodeProperties[] = [
	{
		displayName: 'From Date Time',
		name: 'fromDateTime',
		type: 'string',
		displayOptions: {
			show: { operation: [Operation.GET_TRANSACTION_INFO] },
		},
		default: '',
		required: true,
		placeholder: '2024-10-11 12:00:00',
		description: 'Start datetime in format: YYYY-MM-DD HH:MM:SS (with exact minutes and seconds)',
	},
	{
		displayName: 'To Date Time',
		name: 'toDateTime',
		type: 'string',
		displayOptions: {
			show: { operation: [Operation.GET_TRANSACTION_INFO] },
		},
		default: '',
		required: true,
		placeholder: '2024-10-11 14:00:00',
		description: 'End datetime in format: YYYY-MM-DD HH:MM:SS',
	},
];

export async function executeGetTransactionInfo(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<TransactionInfoResponse> {
	const fromDateTime = this.getNodeParameter('fromDateTime', itemIndex) as string;
	const toDateTime = this.getNodeParameter('toDateTime', itemIndex) as string;

	if (!fromDateTime) throw new ApplicationError(ERROR_MESSAGES.MISSING_FROM_DATE);
	if (!toDateTime) throw new ApplicationError(ERROR_MESSAGES.MISSING_TO_DATE);

	const credentials = await getPayuCredentials(this);
	// Hash for get_transaction_info uses var1 (from datetime) only
	const hash = computePayuHash([credentials.merchantKey, 'get_transaction_info', fromDateTime, credentials.merchantSalt]);

	const options: IHttpRequestOptions = {
		method: 'POST',
		url: getPostserviceUrl(credentials.environment),
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			key: credentials.merchantKey,
			command: 'get_transaction_info',
			var1: fromDateTime,
			var2: toDateTime,
			hash,
		}).toString(),
	};

	return this.helpers.request(options) as Promise<TransactionInfoResponse>;
}
