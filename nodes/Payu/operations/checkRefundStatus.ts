import type { INodeProperties, IExecuteFunctions, IHttpRequestOptions } from 'n8n-workflow';
import { ApplicationError } from 'n8n-workflow';
import { Operation } from '../enums';
import { computePayuHash, getPayuCredentials, getPostserviceUrl } from '../utils';
import { ERROR_MESSAGES } from '../constants';
import type { CheckRefundStatusResponse } from '../types';

export const checkRefundStatusDescription: INodeProperties[] = [
	{
		displayName: 'Request ID',
		name: 'requestId',
		type: 'string',
		displayOptions: {
			show: { operation: [Operation.CHECK_REFUND_STATUS] },
		},
		default: '',
		required: true,
		placeholder: '131278422',
		description: "The Request ID returned by the Initiate Refund operation (field: request_id or txn_update_id)",
	},
];

export async function executeCheckRefundStatus(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<CheckRefundStatusResponse> {
	const requestId = this.getNodeParameter('requestId', itemIndex) as string;
	if (!requestId) throw new ApplicationError(ERROR_MESSAGES.MISSING_REQUEST_ID);

	const credentials = await getPayuCredentials(this);
	const hash = computePayuHash([credentials.merchantKey, 'check_action_status_txnid', requestId, credentials.merchantSalt]);

	const options: IHttpRequestOptions = {
		method: 'POST',
		url: getPostserviceUrl(credentials.environment),
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			key: credentials.merchantKey,
			command: 'check_action_status_txnid',
			var1: requestId,
			hash,
		}).toString(),
	};

	return this.helpers.request(options) as Promise<CheckRefundStatusResponse>;
}
