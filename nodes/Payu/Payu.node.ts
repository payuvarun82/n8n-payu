import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	IDataObject,
} from 'n8n-workflow';
import { NodeOperationError, ApplicationError } from 'n8n-workflow';

import {
	verifyPaymentDescription, executeVerifyPayment,
	getTransactionInfoDescription, executeGetTransactionInfo,
	getTransactionDetailsDescription, executeGetTransactionDetails,
	initiateRefundDescription, executeInitiateRefund,
	checkRefundStatusDescription, executeCheckRefundStatus,
	getAllRefundsDescription, executeGetAllRefunds,
	createPaymentLinkDescription, executeCreatePaymentLink,
	getPaymentLinkDescription, executeGetPaymentLink,
	verifyWebhookDescription, executeVerifyWebhook,
	getRefundTokenDescription, executeGetRefundToken,
} from './operations';

import {
	Resource,
	Operation,
	TRANSACTION_OPERATIONS,
	REFUND_OPERATIONS,
	PAYMENT_LINK_OPERATIONS,
} from './enums';

import { NODE_CONFIG } from './constants';

export class Payu implements INodeType {
	description: INodeTypeDescription = {
		displayName: NODE_CONFIG.DISPLAY_NAME,
		name: NODE_CONFIG.NAME,
		icon: NODE_CONFIG.ICON as any,
		group: NODE_CONFIG.GROUP as any,
		version: NODE_CONFIG.VERSION,
		subtitle: NODE_CONFIG.SUBTITLE,
		description: NODE_CONFIG.DESCRIPTION,
		defaults: {
			name: NODE_CONFIG.DISPLAY_NAME,
		},
		inputs: ['main'],
		outputs: ['main'],
		credentials: [
			{
				name: NODE_CONFIG.CREDENTIAL_NAME,
				required: true,
			},
		],
		properties: [
			// Resource selector
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				default: Resource.TRANSACTION,
				noDataExpression: true,
				options: [
					{
						name: 'Transaction',
						value: Resource.TRANSACTION,
						description: 'Verify and retrieve PayU transaction details',
					},
					{
						name: 'Refund',
						value: Resource.REFUND,
						description: 'Initiate refunds and check refund status',
					},
					{
						name: 'Payment Link',
						value: Resource.PAYMENT_LINK,
						description: 'Create and retrieve PayU payment links',
					},
				],
			},

			// Transaction operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				default: Operation.VERIFY_PAYMENT,
				noDataExpression: true,
				displayOptions: {
					show: { resource: [Resource.TRANSACTION] },
				},
				options: TRANSACTION_OPERATIONS,
			},

			// Refund operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				default: Operation.INITIATE_REFUND,
				noDataExpression: true,
				displayOptions: {
					show: { resource: [Resource.REFUND] },
				},
				options: REFUND_OPERATIONS,
			},

			// Payment Link operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				default: Operation.CREATE_PAYMENT_LINK,
				noDataExpression: true,
				displayOptions: {
					show: { resource: [Resource.PAYMENT_LINK] },
				},
				options: PAYMENT_LINK_OPERATIONS,
			},

			// Operation-specific fields
			...verifyPaymentDescription,
			...getTransactionInfoDescription,
			...getTransactionDetailsDescription,
			...initiateRefundDescription,
			...checkRefundStatusDescription,
			...getAllRefundsDescription,
			...createPaymentLinkDescription,
			...getPaymentLinkDescription,
			...verifyWebhookDescription,
			...getRefundTokenDescription,
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const operation = this.getNodeParameter('operation', itemIndex) as string;
				let result: unknown;

				switch (operation) {
					case Operation.VERIFY_PAYMENT:
						result = await executeVerifyPayment.call(this, itemIndex);
						break;
					case Operation.GET_TRANSACTION_INFO:
						result = await executeGetTransactionInfo.call(this, itemIndex);
						break;
					case Operation.GET_TRANSACTION_DETAILS:
						result = await executeGetTransactionDetails.call(this, itemIndex);
						break;
					case Operation.INITIATE_REFUND:
						result = await executeInitiateRefund.call(this, itemIndex);
						break;
					case Operation.CHECK_REFUND_STATUS:
						result = await executeCheckRefundStatus.call(this, itemIndex);
						break;
					case Operation.GET_ALL_REFUNDS:
						result = await executeGetAllRefunds.call(this, itemIndex);
						break;
					case Operation.CREATE_PAYMENT_LINK:
						result = await executeCreatePaymentLink.call(this, itemIndex);
						break;
					case Operation.GET_PAYMENT_LINK:
						result = await executeGetPaymentLink.call(this, itemIndex);
						break;
					case Operation.VERIFY_WEBHOOK:
						result = await executeVerifyWebhook.call(this, itemIndex);
						break;
					case Operation.GET_REFUND_TOKEN:
						result = await executeGetRefundToken.call(this, itemIndex);
						break;
					default:
						throw new ApplicationError(`Unknown operation: ${operation}`);
				}

				returnData.push({
					json: result as IDataObject,
					pairedItem: { item: itemIndex },
				});
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: (error as Error).message,
							operation: this.getNodeParameter('operation', itemIndex),
							timestamp: new Date().toISOString(),
						},
						pairedItem: { item: itemIndex },
					});
				} else {
					throw new NodeOperationError(this.getNode(), error as Error, { itemIndex });
				}
			}
		}

		return [returnData];
	}
}
