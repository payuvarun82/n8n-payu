import type { INodeProperties, IExecuteFunctions, IHttpRequestOptions } from 'n8n-workflow';
import { ApplicationError } from 'n8n-workflow';
import { Operation } from '../enums';
import { computePayuHash, getPayuCredentials, getPostserviceUrl } from '../utils';

export const getRefundTokenDescription: INodeProperties[] = [
	{
		displayName: 'PayU Transaction ID (mihpayid)',
		name: 'mihpayid',
		type: 'string',
		displayOptions: { show: { operation: [Operation.GET_REFUND_TOKEN] } },
		default: '',
		required: true,
		placeholder: '403993715529716',
		description: "PayU's internal transaction ID (mihpayid) from the payment response — NOT your merchant txnid",
	},
];

export async function executeGetRefundToken(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<Record<string, unknown>> {
	const mihpayid = this.getNodeParameter('mihpayid', itemIndex) as string;
	if (!mihpayid) throw new ApplicationError('PayU Transaction ID (mihpayid) is required');

	const credentials = await getPayuCredentials(this);
	const hash = computePayuHash([
		credentials.merchantKey,
		'get_refund_token_txnid',
		mihpayid,
		credentials.merchantSalt,
	]);

	const options: IHttpRequestOptions = {
		method: 'POST',
		url: getPostserviceUrl(credentials.environment),
		headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
		body: new URLSearchParams({
			key: credentials.merchantKey,
			command: 'get_refund_token_txnid',
			var1: mihpayid,
			hash,
		}).toString(),
	};

	const raw = await this.helpers.request(options);
	const result = (typeof raw === 'string' ? JSON.parse(raw) : raw) as Record<string, unknown>;

	// Surface the refund_token at the top level for easy use in subsequent Initiate Refund nodes
	const detail = result.transaction_details as Record<string, unknown> | undefined;
	const firstKey = detail ? Object.keys(detail)[0] : undefined;
	const txnDetail = (firstKey && detail ? detail[firstKey] : {}) as Record<string, unknown>;

	return {
		...result,
		refundToken: txnDetail.refund_token || txnDetail.RefundToken || null,
		mihpayid,
	};
}
