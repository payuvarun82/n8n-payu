import type { INodeProperties, IExecuteFunctions } from 'n8n-workflow';
import { ApplicationError } from 'n8n-workflow';
import { Operation } from '../enums';
import { computePayuHash, getPayuCredentials } from '../utils';

export const verifyWebhookDescription: INodeProperties[] = [
	{
		displayName: 'Transaction ID',
		name: 'webhookTxnid',
		type: 'string',
		displayOptions: { show: { operation: [Operation.VERIFY_WEBHOOK] } },
		default: '',
		required: true,
		placeholder: 'IhfgcZnXR4o4nB',
		description: "The txnid field from PayU's webhook/callback POST body",
	},
	{
		displayName: 'Amount',
		name: 'webhookAmount',
		type: 'string',
		displayOptions: { show: { operation: [Operation.VERIFY_WEBHOOK] } },
		default: '',
		required: true,
		placeholder: '100.00',
		description: "The amount field from PayU's callback POST body (must match exactly)",
	},
	{
		displayName: 'Product Info',
		name: 'webhookProductinfo',
		type: 'string',
		displayOptions: { show: { operation: [Operation.VERIFY_WEBHOOK] } },
		default: '',
		required: true,
		placeholder: 'Order #1234',
		description: "The productinfo field from PayU's callback POST body",
	},
	{
		displayName: 'First Name',
		name: 'webhookFirstname',
		type: 'string',
		displayOptions: { show: { operation: [Operation.VERIFY_WEBHOOK] } },
		default: '',
		required: true,
		placeholder: 'John',
		description: "The firstname field from PayU's callback POST body",
	},
	{
		displayName: 'Email',
		name: 'webhookEmail',
		type: 'string',
		displayOptions: { show: { operation: [Operation.VERIFY_WEBHOOK] } },
		default: '',
		required: true,
		placeholder: 'john@example.com',
		description: "The email field from PayU's callback POST body",
	},
	{
		displayName: 'Status',
		name: 'webhookStatus',
		type: 'string',
		displayOptions: { show: { operation: [Operation.VERIFY_WEBHOOK] } },
		default: '',
		required: true,
		placeholder: 'success',
		description: "The status field from PayU's callback POST body (e.g. success, failure, pending)",
	},
	{
		displayName: 'Received Hash',
		name: 'webhookHash',
		type: 'string',
		displayOptions: { show: { operation: [Operation.VERIFY_WEBHOOK] } },
		default: '',
		required: true,
		description: "The hash field from PayU's callback POST body — this is what you're validating",
	},
	{
		displayName: 'UDF Fields (Optional)',
		name: 'webhookUdf',
		type: 'collection',
		placeholder: 'Add UDF Field',
		displayOptions: { show: { operation: [Operation.VERIFY_WEBHOOK] } },
		default: {},
		options: [
			{ displayName: 'UDF1', name: 'udf1', type: 'string', default: '' },
			{ displayName: 'UDF2', name: 'udf2', type: 'string', default: '' },
			{ displayName: 'UDF3', name: 'udf3', type: 'string', default: '' },
			{ displayName: 'UDF4', name: 'udf4', type: 'string', default: '' },
			{ displayName: 'UDF5', name: 'udf5', type: 'string', default: '' },
		],
		description: 'UDF fields from the callback — include only if you sent them in the original payment request',
	},
];

export async function executeVerifyWebhook(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<Record<string, unknown>> {
	const txnid = this.getNodeParameter('webhookTxnid', itemIndex) as string;
	const amount = this.getNodeParameter('webhookAmount', itemIndex) as string;
	const productinfo = this.getNodeParameter('webhookProductinfo', itemIndex) as string;
	const firstname = this.getNodeParameter('webhookFirstname', itemIndex) as string;
	const email = this.getNodeParameter('webhookEmail', itemIndex) as string;
	const status = this.getNodeParameter('webhookStatus', itemIndex) as string;
	const receivedHash = this.getNodeParameter('webhookHash', itemIndex) as string;
	const udf = this.getNodeParameter('webhookUdf', itemIndex, {}) as {
		udf1?: string; udf2?: string; udf3?: string; udf4?: string; udf5?: string;
	};

	if (!receivedHash) throw new ApplicationError('Received Hash is required');

	const credentials = await getPayuCredentials(this);

	// PayU response hash formula (reverse of request hash):
	// sha512(salt|status||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
	const expectedHash = computePayuHash([
		credentials.merchantSalt,
		status,
		'', // empty string between status and udf5
		udf.udf5 || '',
		udf.udf4 || '',
		udf.udf3 || '',
		udf.udf2 || '',
		udf.udf1 || '',
		email,
		firstname,
		productinfo,
		amount,
		txnid,
		credentials.merchantKey,
	]);

	const isValid = expectedHash.toLowerCase() === receivedHash.toLowerCase();

	return {
		valid: isValid,
		txnid,
		status,
		amount,
		...(isValid ? {} : {
			expectedHash,
			receivedHash,
			hint: 'Hash mismatch — the callback may have been tampered with or UDF fields are incorrect',
		}),
	};
}
