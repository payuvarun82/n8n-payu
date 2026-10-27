import type { INodeProperties, IExecuteFunctions, IHttpRequestOptions } from 'n8n-workflow';
import { ApplicationError } from 'n8n-workflow';
import { Operation } from '../enums';
import { getPayuCredentials, getPaymentLinksBaseUrl, getPaymentLinksToken } from '../utils';
import { ERROR_MESSAGES } from '../constants';
import type { PaymentLinkResponse } from '../types';

export const getPaymentLinkDescription: INodeProperties[] = [
	{
		displayName: 'Invoice Number',
		name: 'invoiceNumber',
		type: 'string',
		displayOptions: {
			show: { operation: [Operation.GET_PAYMENT_LINK] },
		},
		default: '',
		required: true,
		placeholder: 'INV0063002462',
		description: 'The invoice number of the payment link (returned when the link was created)',
	},
];

export async function executeGetPaymentLink(
	this: IExecuteFunctions,
	itemIndex: number,
): Promise<PaymentLinkResponse> {
	const invoiceNumber = this.getNodeParameter('invoiceNumber', itemIndex) as string;
	if (!invoiceNumber) throw new ApplicationError('Invoice Number is required');

	const credentials = await getPayuCredentials(this);
	if (!credentials.merchantId) throw new ApplicationError(ERROR_MESSAGES.MISSING_MERCHANT_ID);

	const accessToken = await getPaymentLinksToken(this, credentials, 'read_payment_links');

	const options: IHttpRequestOptions = {
		method: 'GET',
		url: `${getPaymentLinksBaseUrl(credentials.environment)}/${invoiceNumber}`,
		headers: {
			'merchantId': credentials.merchantId,
			'Authorization': `Bearer ${accessToken}`,
		},
		json: true,
	};

	return this.helpers.request(options) as Promise<PaymentLinkResponse>;
}
