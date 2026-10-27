export enum Resource {
	TRANSACTION = 'transaction',
	REFUND = 'refund',
	PAYMENT_LINK = 'paymentLink',
}

export enum Operation {
	VERIFY_PAYMENT = 'verifyPayment',
	GET_TRANSACTION_INFO = 'getTransactionInfo',
	GET_TRANSACTION_DETAILS = 'getTransactionDetails',
	INITIATE_REFUND = 'initiateRefund',
	CHECK_REFUND_STATUS = 'checkRefundStatus',
	GET_ALL_REFUNDS = 'getAllRefunds',
	CREATE_PAYMENT_LINK = 'createPaymentLink',
	GET_PAYMENT_LINK = 'getPaymentLink',
	VERIFY_WEBHOOK = 'verifyWebhook',
	GET_REFUND_TOKEN = 'getRefundToken',
}

export const TRANSACTION_OPERATIONS = [
	{
		name: 'Verify Payment',
		value: Operation.VERIFY_PAYMENT,
		description: 'Verify the status of a transaction by its Transaction ID',
		action: 'Verify a payment',
	},
	{
		name: 'Get Transaction Info',
		value: Operation.GET_TRANSACTION_INFO,
		description: 'Fetch transactions by exact datetime range (with minutes and seconds)',
		action: 'Get transaction info',
	},
	{
		name: 'Get Transaction Details',
		value: Operation.GET_TRANSACTION_DETAILS,
		description: 'Fetch all transactions within a date range (date-level granularity)',
		action: 'Get transaction details',
	},
	{
		name: 'Verify Webhook',
		value: Operation.VERIFY_WEBHOOK,
		description: "Validate the hash in PayU's payment callback to confirm it wasn't tampered with",
		action: 'Verify a webhook callback',
	},
];

export const REFUND_OPERATIONS = [
	{
		name: 'Get Refund Token',
		value: Operation.GET_REFUND_TOKEN,
		description: 'Retrieve the refund token for a transaction — required before initiating a refund',
		action: 'Get refund token',
	},
	{
		name: 'Initiate Refund',
		value: Operation.INITIATE_REFUND,
		description: 'Initiate a full or partial refund for a captured transaction',
		action: 'Initiate a refund',
	},
	{
		name: 'Check Refund Status',
		value: Operation.CHECK_REFUND_STATUS,
		description: 'Check the status of a specific refund using its Request ID',
		action: 'Check refund status',
	},
	{
		name: 'Get All Refunds',
		value: Operation.GET_ALL_REFUNDS,
		description: 'Retrieve all refund attempts for a transaction',
		action: 'Get all refunds for a transaction',
	},
];

export const PAYMENT_LINK_OPERATIONS = [
	{
		name: 'Create Payment Link',
		value: Operation.CREATE_PAYMENT_LINK,
		description: 'Create a shareable payment link for a customer',
		action: 'Create a payment link',
	},
	{
		name: 'Get Payment Link',
		value: Operation.GET_PAYMENT_LINK,
		description: 'Retrieve details of a payment link by its invoice number',
		action: 'Get a payment link',
	},
];
