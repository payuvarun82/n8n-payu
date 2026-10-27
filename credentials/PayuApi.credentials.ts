import type {
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class PayuApi implements ICredentialType {
	name = 'payuApi';

	displayName = 'PayU API';

	documentationUrl = 'https://docs.payu.in/docs/api-authentication-and-security';

	properties: INodeProperties[] = [
		{
			displayName: 'Environment',
			name: 'environment',
			type: 'options',
			options: [
				{ name: 'Test', value: 'test' },
				{ name: 'Live', value: 'live' },
			],
			default: 'test',
			description: 'Use Test for development and Live for production',
		},
		{
			displayName: 'Merchant Key',
			name: 'merchantKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Your PayU Merchant Key (found in PayU Dashboard → Profile → Merchant Keys)',
		},
		{
			displayName: 'Merchant Salt',
			name: 'merchantSalt',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Your PayU Merchant Salt — used to sign all API requests via SHA-512 hash',
		},
		{
			displayName: 'Merchant ID',
			name: 'merchantId',
			type: 'string',
			default: '',
			description: 'Your PayU Merchant ID — required for Payment Links APIs',
		},
		{
			displayName: 'Payment Links Client ID',
			name: 'paymentLinksClientId',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description: 'OAuth Client ID for Payment Links APIs — get it from PayU Dashboard → Developer → Payment Links OAuth',
		},
		{
			displayName: 'Payment Links Client Secret',
			name: 'paymentLinksClientSecret',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			description: 'OAuth Client Secret for Payment Links APIs — get it from PayU Dashboard → Developer → Payment Links OAuth',
		},
	];

	test: ICredentialTestRequest = {
		request: {
			method: 'POST',
			url: '={{$credentials.environment === "live" ? "https://info.payu.in" : "https://test.payu.in"}}/merchant/postservice.php?form=2',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: 'key={{$credentials.merchantKey}}&command=verify_payment&var1=test_credential_check&hash=invalid',
		},
	};
}
