// =================
// CREDENTIALS
// =================

export interface PayuCredentials {
	environment: 'test' | 'live';
	merchantKey: string;
	merchantSalt: string;
	merchantId?: string;
	paymentLinksClientId?: string;
	paymentLinksClientSecret?: string;
}

// =================
// TRANSACTION TYPES
// =================

export interface TransactionDetail {
	id: string;
	status: string;
	key?: string;
	merchantname?: string;
	txnid: string;
	mihpayid?: string;
	firstname?: string;
	lastname?: string;
	email?: string;
	phone?: string;
	addedon?: string;
	bank_name?: string;
	payment_gateway?: string;
	amount?: string;
	transaction_fee?: string;
	discount?: string;
	additional_charges?: string;
	productinfo?: string;
	error_code?: string;
	error_Message?: string;
	bank_ref_num?: string;
	bank_ref_no?: string;
	ibibo_code?: string;
	mode?: string;
	ip?: string;
	card_no?: string;
	cardtype?: string;
	field2?: string;
	udf1?: string;
	udf2?: string;
	udf3?: string;
	udf4?: string;
	udf5?: string;
	net_amount_debit?: string;
	unmappedstatus?: string;
	Settled_At?: string | null;
	[key: string]: unknown;
}

export interface VerifyPaymentResponse {
	status: number;
	msg: string;
	transaction_details: Record<string, TransactionDetail & { mihpayid?: string }>;
}

export interface TransactionInfoResponse {
	status: number;
	msg: string;
	Transaction_details: TransactionDetail[];
}

// =================
// REFUND TYPES
// =================

export interface RefundDetail {
	PayuID: string;
	RequestID: string;
	RefundToken: string;
	PaymentGateway: string;
	Amount: string;
	Status: string;
	RefundCreationDate: string;
	bank_ref_no?: string;
	bank_arn?: string | null;
	success_at?: string;
}

export interface InitiateRefundResponse {
	status: number;
	msg: string;
	request_id?: string;
	txn_update_id?: string;
	bank_ref_num?: string;
	mihpayid?: string;
}

export interface RefundStatusDetail {
	mihpayid: string;
	bank_ref_num?: string;
	request_id: string;
	amt: string;
	mode: string;
	action: string;
	token: string;
	status: string;
	bank_arn?: string | null;
	settlement_id?: string | null;
	amount_settled?: string | null;
	UTR_no?: string | null;
	value_date?: string | null;
	refund_mode: string;
}

export interface CheckRefundStatusResponse {
	status: number;
	msg: string;
	transaction_details: Record<string, Record<string, RefundStatusDetail>>;
}

export interface GetAllRefundsResponse {
	status: number;
	msg: string;
	'Refund Details'?: Record<string, RefundDetail[]>;
}

// =================
// PAYMENT LINK TYPES
// =================

export interface PaymentLinkResponse {
	id?: string;
	invoiceNumber?: string;
	subAmount?: number;
	isPartialPaymentAllowed?: boolean;
	description?: string;
	source?: string;
	status?: string;
	shortUrl?: string;
	createdAt?: string;
	updatedAt?: string;
	[key: string]: unknown;
}

export interface CreatePaymentLinkBody {
	subAmount: number;
	isPartialPaymentAllowed?: boolean;
	description?: string;
	source?: string;
	enforcePayMethod?: string;
	expiryDate?: string;
	customerName?: string;
	customerEmail?: string;
	customerPhone?: string;
}
