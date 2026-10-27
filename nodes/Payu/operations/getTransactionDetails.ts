import type { INodeProperties, IExecuteFunctions, IHttpRequestOptions } from 'n8n-workflow';
import { ApplicationError } from 'n8n-workflow';
import { Operation } from '../enums';
import { computePayuHash, getPayuCredentials, getPostserviceUrl } from '../utils';
import { ERROR_MESSAGES } from '../constants';
import type { TransactionInfoResponse } from '../types';

export const getTransactionDetailsDescription: INodeProperties[] = [
	{
		displayName: 'From Date',
		name: 'fromDate',
		type: 'dateTime',
		displayOptions: {
			show: { operation: [Operation.GET_TRANSACTION_DETAILS] },
		},
		default: '',
		required: true,
		description: 'Start date to fetch transactions from (date-level granularity)',
	},
	{
		displayName: 'To Date',
		name: 'toDate',
		type: 'dateTime',
		displayOptions: {
			show: { operation: [Operation.GET_TRANSACTION_DETAILS] },
		},
		default: '',
		required: true,
		description: 'End date to fetch transactions until',
	},
];

export async function executeGetTransactionDetails(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<TransactionInfoResponse> {
	const fromDateRaw = this.getNodeParameter('fromDate', itemIndex) as string;
	const toDateRaw = this.getNodeParameter('toDate', itemIndex) as string;

	if (!fromDateRaw) throw new ApplicationError(ERROR_MESSAGES.MISSING_FROM_DATE);
	if (!toDateRaw) throw new ApplicationError(ERROR_MESSAGES.MISSING_TO_DATE);

	// PayU expects YYYY-MM-DD format
	const fromDate = new Date(fromDateRaw).toISOString().split('T')[0];
	const toDate = new Date(toDateRaw).toISOString().split('T')[0];

	const credentials = await getPayuCredentials(this);
	const hash = computePayuHash([credentials.merchantKey, 'get_Transaction_Details', fromDate, credentials.merchantSalt]);

	const options: IHttpRequestOptions = {
		method: 'POST',
		url: getPostserviceUrl(credentials.environment),
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			key: credentials.merchantKey,
			command: 'get_Transaction_Details',
			var1: fromDate,
			var2: toDate,
			hash,
		}).toString(),
	};

	return this.helpers.request(options) as Promise<TransactionInfoResponse>;
}
