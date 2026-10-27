export const API_ENDPOINTS = {
	// v1 postservice endpoint for Transaction + Refund APIs
	POSTSERVICE_TEST: 'https://test.payu.in/merchant/postservice.php?form=2',
	POSTSERVICE_LIVE: 'https://info.payu.in/merchant/postservice.php?form=2',

	// Payment Links REST API
	PAYMENT_LINKS_TEST: 'https://uatoneapi.payu.in/payment-links',
	PAYMENT_LINKS_LIVE: 'https://oneapi.payu.in/payment-links',

	// OAuth2 token endpoint for Payment Links
	OAUTH_TOKEN_TEST: 'https://uat-accounts.payu.in/oauth/token',
	OAUTH_TOKEN_LIVE: 'https://accounts.payu.in/oauth/token',
} as const;

export const NODE_CONFIG = {
	DISPLAY_NAME: 'PayU',
	NAME: 'payu',
	ICON: 'file:payu-logo.svg',
	GROUP: ['transform'],
	VERSION: 1,
	SUBTITLE: '={{$parameter["operation"]}}',
	DESCRIPTION: 'Interact with PayU payment gateway API',
	CREDENTIAL_NAME: 'payuApi',
} as const;

export const ERROR_MESSAGES = {
	MISSING_TXN_ID: 'Transaction ID (txnid) is required',
	MISSING_PAYU_ID: 'PayU ID (mihpayid) is required',
	MISSING_REQUEST_ID: 'Request ID is required',
	MISSING_AMOUNT: 'Amount is required and must be greater than 0',
	MISSING_REFUND_TOKEN: 'Refund Token is required and must be unique per refund request',
	MISSING_FROM_DATE: 'From Date is required',
	MISSING_TO_DATE: 'To Date is required',
	MISSING_ACCESS_TOKEN: 'Payment Links Access Token is required. Add it to your PayU credentials.',
	MISSING_MERCHANT_ID: 'Merchant ID is required for Payment Links. Add it to your PayU credentials.',
	INVALID_DATE_FORMAT: 'Date must be in YYYY-MM-DD format',
} as const;
