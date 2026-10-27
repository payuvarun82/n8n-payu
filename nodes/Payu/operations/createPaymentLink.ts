import type { INodeProperties, IExecuteFunctions, IHttpRequestOptions } from 'n8n-workflow';
import { ApplicationError } from 'n8n-workflow';
import { Operation } from '../enums';
import { getPayuCredentials, getPaymentLinksBaseUrl, getPaymentLinksToken } from '../utils';
import { ERROR_MESSAGES } from '../constants';
import type { PaymentLinkResponse, CreatePaymentLinkBody } from '../types';

export const createPaymentLinkDescription: INodeProperties[] = [
	{
		displayName: 'Amount',
		name: 'subAmount',
		type: 'number',
		displayOptions: {
			show: { operation: [Operation.CREATE_PAYMENT_LINK] },
		},
		default: 100,
		required: true,
		description: 'Amount for the payment link (in the currency unit, e.g. 100 = ₹100)',
	},
	{
		displayName: 'Description',
		name: 'description',
		type: 'string',
		displayOptions: {
			show: { operation: [Operation.CREATE_PAYMENT_LINK] },
		},
		default: '',
		required: true,
		placeholder: 'Payment for order #1234',
		description: 'Description shown to the customer on the payment page (required by PayU)',
	},
	{
		displayName: 'Additional Options',
		name: 'additionalOptions',
		type: 'collection',
		placeholder: 'Add Option',
		displayOptions: {
			show: { operation: [Operation.CREATE_PAYMENT_LINK] },
		},
		default: {},
		options: [
			{
				displayName: 'Allow Partial Payment',
				name: 'isPartialPaymentAllowed',
				type: 'boolean',
				default: false,
				description: 'Whether to allow the customer to pay a partial amount',
			},
			{
				displayName: 'Customer Email',
				name: 'customerEmail',
				type: 'string',
				default: '',
				placeholder: 'customer@example.com',
				description: 'Pre-fill customer email on the payment page',
			},
			{
				displayName: 'Customer Name',
				name: 'customerName',
				type: 'string',
				default: '',
				placeholder: 'John Doe',
				description: 'Pre-fill customer name on the payment page',
			},
			{
				displayName: 'Customer Phone',
				name: 'customerPhone',
				type: 'string',
				default: '',
				placeholder: '+919876543210',
				description: 'Pre-fill customer phone on the payment page',
			},
			{
				displayName: 'Enforce Payment Method',
				name: 'enforcePayMethod',
				type: 'options',
				default: '',
				options: [
					{ name: 'Any', value: '' },
					{ name: 'eNACH (Recurring)', value: 'enach' },
					{ name: 'UPI', value: 'upi' },
					{ name: 'Card', value: 'card' },
					{ name: 'Net Banking', value: 'nb' },
				],
				description: 'Force the customer to use a specific payment method',
			},
			{
				displayName: 'Expiry Date',
				name: 'expiryDate',
				type: 'dateTime',
				default: '',
				description: 'Date after which the payment link expires',
			},
			{
				displayName: 'Source',
				name: 'source',
				type: 'string',
				default: 'API',
				description: 'Source identifier for the payment link (default: API)',
			},
		],
	},
];

export async function executeCreatePaymentLink(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<PaymentLinkResponse> {
	const subAmount = this.getNodeParameter('subAmount', itemIndex) as number;
	const description = this.getNodeParameter('description', itemIndex) as string;
	const additionalOptions = this.getNodeParameter('additionalOptions', itemIndex, {}) as {
		isPartialPaymentAllowed?: boolean;
		customerName?: string;
		customerEmail?: string;
		customerPhone?: string;
		enforcePayMethod?: string;
		expiryDate?: string;
		source?: string;
	};

	if (!subAmount || subAmount <= 0) throw new ApplicationError(ERROR_MESSAGES.MISSING_AMOUNT);

	const credentials = await getPayuCredentials(this);
	if (!credentials.merchantId) throw new ApplicationError(ERROR_MESSAGES.MISSING_MERCHANT_ID);

	const accessToken = await getPaymentLinksToken(this, credentials, 'create_payment_links read_payment_links');

	const body: CreatePaymentLinkBody = {
		subAmount,
		source: additionalOptions.source || 'API',
	};

	if (!description) throw new ApplicationError('Description is required for Payment Links');
	body.description = description;
	if (additionalOptions.isPartialPaymentAllowed !== undefined) {
		body.isPartialPaymentAllowed = additionalOptions.isPartialPaymentAllowed;
	}
	if (additionalOptions.customerName) body.customerName = additionalOptions.customerName;
	if (additionalOptions.customerEmail) body.customerEmail = additionalOptions.customerEmail;
	if (additionalOptions.customerPhone) body.customerPhone = additionalOptions.customerPhone;
	if (additionalOptions.enforcePayMethod) body.enforcePayMethod = additionalOptions.enforcePayMethod;
	if (additionalOptions.expiryDate) {
		body.expiryDate = new Date(additionalOptions.expiryDate).toISOString().split('T')[0];
	}

	const options: IHttpRequestOptions = {
		method: 'POST',
		url: `${getPaymentLinksBaseUrl(credentials.environment)}/`,
		headers: {
			'Content-Type': 'application/json',
			'merchantId': credentials.merchantId,
			'Authorization': `Bearer ${accessToken}`,
		},
		body,
		json: true,
	};

	return this.helpers.request(options) as Promise<PaymentLinkResponse>;
}
