import type { INodeProperties, IExecuteFunctions, IHttpRequestOptions } from 'n8n-workflow';
import { ApplicationError } from 'n8n-workflow';
import { Operation } from '../enums';
import { computePayuHash, getPayuCredentials, getPostserviceUrl } from '../utils';
import { ERROR_MESSAGES } from '../constants';
import type { InitiateRefundResponse } from '../types';

export const initiateRefundDescription: INodeProperties[] = [
	{
		displayName: 'PayU ID (mihpayid)',
		name: 'payuId',
		type: 'string',
		displayOptions: {
			show: { operation: [Operation.INITIATE_REFUND] },
		},
		default: '',
		required: true,
		placeholder: '403993715521937565',
		description: "PayU's internal transaction ID (mihpayid) from the original payment response",
	},
	{
		displayName: 'Refund Token',
		name: 'refundToken',
		type: 'string',
		displayOptions: {
			show: { operation: [Operation.INITIATE_REFUND] },
		},
		default: '',
		required: true,
		placeholder: 'refund_token_unique_123',
		description: 'A unique token for this refund request. Must be different for each refund attempt on the same transaction.',
	},
	{
		displayName: 'Amount',
		name: 'amount',
		type: 'string',
		displayOptions: {
			show: { operation: [Operation.INITIATE_REFUND] },
		},
		default: '',
		required: true,
		placeholder: '100.00',
		description: 'Amount to refund. For a full refund enter the original transaction amount. For partial refund enter a lesser amount.',
	},
];

export async function executeInitiateRefund(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<InitiateRefundResponse> {
	const payuId = this.getNodeParameter('payuId', itemIndex) as string;
	const refundToken = this.getNodeParameter('refundToken', itemIndex) as string;
	const amount = this.getNodeParameter('amount', itemIndex) as string;

	if (!payuId) throw new ApplicationError(ERROR_MESSAGES.MISSING_PAYU_ID);
	if (!refundToken) throw new ApplicationError(ERROR_MESSAGES.MISSING_REFUND_TOKEN);
	if (!amount || parseFloat(amount) <= 0) throw new ApplicationError(ERROR_MESSAGES.MISSING_AMOUNT);

	const credentials = await getPayuCredentials(this);
	const hash = computePayuHash([credentials.merchantKey, 'cancel_refund_transaction', payuId, credentials.merchantSalt]);

	const options: IHttpRequestOptions = {
		method: 'POST',
		url: getPostserviceUrl(credentials.environment),
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			key: credentials.merchantKey,
			command: 'cancel_refund_transaction',
			var1: payuId,
			var2: refundToken,
			var3: amount,
			hash,
		}).toString(),
	};

	return this.helpers.request(options) as Promise<InitiateRefundResponse>;
}
