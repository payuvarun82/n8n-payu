# n8n-nodes-payu

![npm version](https://img.shields.io/npm/v/n8n-nodes-payu)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![n8n community node](https://img.shields.io/badge/n8n-community%20node-orange)

An n8n community node for integrating with the **PayU payment gateway** (India). Supports transaction verification, refund management, webhook validation, and payment link creation via PayU's v1 postservice and OneAPI REST APIs.

---

## Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Credentials Setup](#credentials-setup)
- [Resources and Operations](#resources-and-operations)
  - [Transaction](#transaction)
  - [Refund](#refund)
  - [Payment Link](#payment-link)
- [Typical Workflow Examples](#typical-workflow-examples)
- [API Endpoints Reference](#api-endpoints-reference)
- [Troubleshooting](#troubleshooting)

---

## Overview

`n8n-nodes-payu` provides 10 operations across three resources:

| Resource | Operations |
|----------|-----------|
| Transaction | Verify Payment, Get Transaction Info, Get Transaction Details, Verify Webhook |
| Refund | Get Refund Token, Initiate Refund, Check Refund Status, Get All Refunds |
| Payment Link | Create Payment Link, Get Payment Link |

The node automatically handles OAuth2 token fetching for Payment Links — no manual token management required.

---

## Prerequisites

- A self-hosted n8n instance (v0.x or later)
- A PayU merchant account (India)
- Merchant Key and Salt from your PayU Dashboard
- For Payment Links: OAuth Client ID and Secret from PayU Dashboard → Developer

---

## Installation

### Via n8n UI (recommended)

1. Open your n8n instance and go to **Settings → Community Nodes**
2. Click **Install**
3. Enter the package name: `n8n-nodes-payu`
4. Check the acknowledgement checkbox and click **Install**
5. Restart n8n if prompted

### Via Docker / Manual Install

If you are running n8n in Docker or a custom environment, install the package into the n8n user data directory:

```bash
# Inside your n8n container or server
npm install n8n-nodes-payu
```

Ensure the package resolves within n8n's `NODE_PATH` or the custom extensions directory configured via `N8N_CUSTOM_EXTENSIONS`.

---

## Credentials Setup

Create a single **PayU API** credential in n8n (Credentials → New → PayU API). All operations use this one credential.

### Fields

| Field | Required | Description |
|-------|----------|-------------|
| Environment | Yes | `Test` or `Live`. Determines which PayU endpoint is used. |
| Merchant Key | Yes | Found in PayU Dashboard → Profile → Merchant Keys |
| Merchant Salt | Yes | Found in PayU Dashboard → Profile → Merchant Keys |
| Merchant ID | For Payment Links | Found in PayU Dashboard → Profile |
| Payment Links Client ID | Optional | PayU Dashboard → Developer → Payment Links OAuth |
| Payment Links Client Secret | Optional | PayU Dashboard → Developer → Payment Links OAuth |

### Where to find your credentials

1. **Merchant Key & Salt**: Log in to [PayU Dashboard](https://dashboard.payu.in) → Profile → Merchant Keys
2. **Merchant ID**: PayU Dashboard → Profile (numeric ID shown in account details)
3. **Payment Links OAuth credentials**: PayU Dashboard → Developer → Payment Links OAuth → Create App

> **Note**: Payment Links use a separate OAuth2 flow (Client ID + Secret) that is independent of the Merchant Key/Salt. You need both sets of credentials if you intend to use Payment Link operations.

---

## Resources and Operations

### Transaction

#### Verify Payment

Verifies the current status of a transaction using your internal merchant transaction ID (`txnid`).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Transaction ID | String | Yes | Your merchant-assigned `txnid` (not PayU's `mihpayid`) |

**Use case**: Confirm payment status after a user returns from the PayU checkout page, or reconcile orders in your database.

---

#### Get Transaction Info

Fetches a list of transactions within a datetime range with time precision (HH:MM:SS).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| From DateTime | DateTime | Yes | Start of range (e.g. `2024-01-01 00:00:00`) |
| To DateTime | DateTime | Yes | End of range (e.g. `2024-01-01 23:59:59`) |

**Use case**: Pull all transactions for a specific hour window for real-time reporting or monitoring.

---

#### Get Transaction Details

Fetches transactions by date range (date only, no time component).

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| From Date | Date | Yes | Start date (e.g. `2024-01-01`) |
| To Date | Date | Yes | End date (e.g. `2024-01-31`) |

**Use case**: Daily or monthly settlement reconciliation.

---

#### Verify Webhook

Validates the hash sent by PayU in a payment callback (webhook/redirect) to confirm the payload has not been tampered with. This operation computes the expected hash using your Salt and compares it against the received hash.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Transaction ID | String | Yes | `txnid` from the callback |
| Amount | String | Yes | `amount` from the callback |
| Product Info | String | Yes | `productinfo` from the callback |
| First Name | String | Yes | `firstname` from the callback |
| Email | String | Yes | `email` from the callback |
| Status | String | Yes | `status` from the callback (e.g. `success`) |
| Received Hash | String | Yes | `hash` value sent by PayU in the callback |
| UDF1–UDF5 | String | No | User-defined fields if included in the original request |

Returns a boolean indicating whether the hash is valid.

**Use case**: Always use this operation in webhook-triggered workflows before processing any payment as confirmed. A hash mismatch indicates a potentially tampered request.

---

### Refund

> **Important**: The refund flow is two-step. You must call **Get Refund Token** before **Initiate Refund**. The token is tied to the specific transaction and is required to authorize the refund.

#### Get Refund Token

Retrieves the refund authorization token for a transaction.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| PayU Transaction ID | String | Yes | PayU's internal `mihpayid` (e.g. `403993715529716`) — NOT your merchant `txnid` |

> **mihpayid vs txnid**: `txnid` is the ID you assign when creating the payment request. `mihpayid` is PayU's numeric ID assigned after the transaction is processed. You can find `mihpayid` in the payment callback payload or via Verify Payment.

---

#### Initiate Refund

Initiates a full or partial refund for a transaction.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| PayU Transaction ID | String | Yes | `mihpayid` of the transaction to refund |
| Refund Token | String | Yes | Token obtained from **Get Refund Token** |
| Amount | Number | Yes | Amount to refund (can be less than the original for partial refunds) |

Returns a request ID that can be used to track the refund status.

**Use case**: Process customer refund requests, trigger partial refunds for cancelled line items.

---

#### Check Refund Status

Checks the current status of a previously initiated refund.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Request ID | String | Yes | The request ID returned by **Initiate Refund** |

**Use case**: Poll refund status in a scheduled workflow, or confirm refund completion before notifying the customer.

---

#### Get All Refunds

Retrieves all refund attempts associated with a transaction.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Transaction ID | String | Yes | Merchant `txnid` |

**Use case**: Audit all refunds for a given order, check if a refund was already initiated.

---

### Payment Link

> Payment Link operations require **Merchant ID** and **OAuth credentials** (Client ID + Secret) in addition to the Merchant Key/Salt. The node handles OAuth token fetching automatically.

#### Create Payment Link

Creates a shareable payment link that can be sent to a customer via email, SMS, or WhatsApp.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Amount | Number | Yes | Payment amount in INR |
| Description | String | Yes | Description of the payment / product |
| Customer Name | String | No | Pre-fills the customer name on the payment page |
| Customer Email | String | No | Pre-fills email; PayU may also send the link here |
| Customer Phone | String | No | Pre-fills phone number |
| Expiry Date | DateTime | No | Link expiry date and time |
| Payment Method | String | No | Restrict to a specific payment method |
| Allow Partial Payment | Boolean | No | Allow the customer to pay a partial amount |

Returns an invoice number and the shareable payment link URL.

---

#### Get Payment Link

Retrieves the details and status of an existing payment link.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Invoice Number | String | Yes | The invoice number returned when the link was created |

**Use case**: Check whether a payment link has been paid, expired, or is still pending.

---

## Typical Workflow Examples

### 1. Payment Verification Workflow

Triggered after a user completes payment and lands on your return URL (via webhook or HTTP trigger).

```
HTTP Trigger (POST)
    → PayU: Verify Payment
        [Transaction ID = {{ $json.txnid }}]
    → IF (status == "success")
        → Update Order in Database
        → Send Confirmation Email
    → ELSE
        → Mark Order as Failed
        → Notify Support
```

**Steps**:
1. Add an **HTTP Trigger** or **Webhook** node as the starting point
2. Add a **PayU** node, select Resource: `Transaction`, Operation: `Verify Payment`
3. Map `Transaction ID` to `{{ $json.body.txnid }}` (adjust path based on your payload)
4. Add an **IF** node checking `{{ $json.status }} === "success"`

---

### 2. Refund Workflow (Two-Step)

Triggered manually or from a support system when a refund is requested.

```
Trigger (manual / webhook from CRM)
    → PayU: Get Refund Token
        [PayU Transaction ID = {{ $json.mihpayid }}]
    → PayU: Initiate Refund
        [PayU Transaction ID = {{ $json.mihpayid }}]
        [Refund Token = {{ $('Get Refund Token').item.json.token }}]
        [Amount = {{ $json.refundAmount }}]
    → PayU: Check Refund Status
        [Request ID = {{ $json.requestId }}]
    → Send Refund Confirmation to Customer
```

**Key points**:
- The **Get Refund Token** and **Initiate Refund** nodes must be sequential — the token from step 1 is passed into step 2
- Use `mihpayid` (PayU's ID), not your internal `txnid`
- For partial refunds, set Amount to less than the original transaction amount

---

### 3. Webhook Validation Workflow

Use this pattern for any workflow that receives PayU payment callbacks to ensure the payload is authentic before acting on it.

```
Webhook Trigger (POST /payu-callback)
    → PayU: Verify Webhook
        [Transaction ID = {{ $json.body.txnid }}]
        [Amount = {{ $json.body.amount }}]
        [Product Info = {{ $json.body.productinfo }}]
        [First Name = {{ $json.body.firstname }}]
        [Email = {{ $json.body.email }}]
        [Status = {{ $json.body.status }}]
        [Received Hash = {{ $json.body.hash }}]
    → IF (hashValid == true)
        → Process Payment (update DB, send email, etc.)
    → ELSE
        → Log Tampered Request
        → Return 400 / alert security team
```

**Why this matters**: PayU sends a `hash` in every callback computed from your Salt and transaction fields. If any field is altered in transit, the hash will not match. Never skip this check in production.

---

## API Endpoints Reference

The node automatically selects the correct endpoint based on the **Environment** setting in your credentials.

| API | Test | Live |
|-----|------|------|
| Transactions & Refunds (v1 postservice) | `https://test.payu.in/merchant/postservice.php?form=2` | `https://info.payu.in/merchant/postservice.php?form=2` |
| Payment Links (OneAPI) | `https://uatoneapi.payu.in/payment-links` | `https://oneapi.payu.in/payment-links` |
| OAuth Token (Payment Links) | `https://uatoneapi.payu.in/oauth/token` | `https://oneapi.payu.in/oauth/token` |

---

## Troubleshooting

### "Invalid hash" from Verify Webhook

- Ensure you are passing the exact values received in the callback — do not trim, decode, or modify any field before passing to this operation
- Confirm the Salt in your credentials matches the one on your PayU Dashboard
- UDF fields (UDF1–UDF5) must be included if they were part of the original payment request; otherwise leave them empty

### Payment Links operations fail with 401 / "Unauthorized"

- Check that **Merchant ID**, **Client ID**, and **Client Secret** are all filled in the credential
- Confirm the OAuth app is active in PayU Dashboard → Developer → Payment Links OAuth
- Test and Live environments use different OAuth apps — ensure you are using the correct credentials for your selected environment

### Get Refund Token returns "Transaction not found"

- Verify you are passing `mihpayid` (PayU's numeric ID like `403993715529716`), not your merchant `txnid`
- You can retrieve `mihpayid` from the payment callback payload field `mihpayid`, or by calling **Verify Payment** first and extracting it from the response

### Initiate Refund returns "Token expired" or "Invalid token"

- The refund token has a short validity window. Run **Get Refund Token** and **Initiate Refund** in the same workflow execution without delay
- Do not store and reuse refund tokens across separate executions

### Transactions not appearing in Get Transaction Info / Get Transaction Details

- PayU's reporting API may have a delay of a few minutes for new transactions
- Double-check the datetime format: `Get Transaction Info` expects `YYYY-MM-DD HH:MM:SS`, `Get Transaction Details` expects `YYYY-MM-DD`
- Ensure the date range does not exceed PayU's maximum allowed window (typically 31 days)

### Node does not appear after installation

- Restart your n8n instance after installing the community node
- If using Docker, ensure the package is installed inside the container and not just on the host
- Check n8n logs for any import errors related to `n8n-nodes-payu`

---

## License

MIT
