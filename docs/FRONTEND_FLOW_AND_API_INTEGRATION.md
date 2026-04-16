# Leddar Frontend Flow and API Integration Guide

This document explains how the current prototype works and how to replace mock services with real backend APIs.

Use this as a shared contract between frontend and backend developers.

## 1. Purpose and Scope

This guide covers:

- User journey and route-level behavior.
- KYC and payment gating rules.
- Current frontend state model and local storage keys.
- API contracts expected by the frontend.
- Migration steps from mock services to real APIs.

This guide does not define backend database schema. It focuses on frontend-consumable HTTP contracts.

## 2. Current Stack and Structure

- Framework: Next.js (Pages Router)
- UI: React + Tailwind CSS
- Service abstraction layer:
  - services/authService.js
  - services/prototypeService.js
  - services/paymentService.js

All business actions already call service functions. To integrate backend, keep component calls unchanged and replace service implementations.

## 3. Route Map and Responsibilities

### Public routes

- /login: Authenticate and create session.
- /signup: Submit partner access request.
- /signup-confirmation: Submission confirmation screen.
- /forgot-password: Password reset intent flow.

### Protected routes (wrapped by PageWrapper)

- /dashboard: Entry overview, primary CTA depends on KYC status.
- /kyc: KYC verification flow with optional returnUrl.
- /quote-request: Upload specs and initialize pricing-deposit flow.
- /quote-response: View pricing state, approve balance payment, or reject quote.
- /sample-order: Initialize sample fee payment and track sample progress.
- /order-history: Read-only history page (sample + production tabs).
- /order-tracker: Production tracking page.
- /invoices: Invoice list and PDF action.
- /profile: Profile view.

## 4. High-Level User Flows

## 4.1 Access and Session

1. User logs in from /login.
2. Frontend stores session with token and business metadata.
3. Protected pages redirect to /login if session is absent.

## 4.2 KYC flow

1. User opens /kyc directly, or is redirected from a gated action.
2. User submits idType and idNumber.
3. On success, KYC status becomes verified.
4. Frontend redirects to returnUrl if present, else /dashboard.

## 4.3 Quote deposit and pricing flow

1. User fills /quote-request form and uploads at least one file.
2. If KYC is not verified, user is redirected to /kyc?returnUrl=/quote-request?resume=pricing.
3. After KYC success, quote intent is restored and deposit initialization runs.
4. Frontend initializes deposit payment and opens modal with authorization URL.
5. Frontend confirms deposit payment using draftId/paymentReference.
6. Backend returns requestId and pending status.
7. Frontend polls quote status until pricing_ready.
8. User is redirected to /quote-response?requestId=...

## 4.4 Quote response actions

- Approve and proceed:
  - Requires KYC verified.
  - Frontend initializes balance payment and opens checkout modal.
- Reject quote:
  - Sends requestId and optional reason.
  - Quote state changes to rejected.

## 4.5 Sample payment and progress flow

1. User starts sample payment from /sample-order.
2. If KYC is not verified, frontend redirects to /kyc with returnUrl.
3. Frontend initializes payment.
4. Frontend stores sampleRequestId and starts polling progress.
5. UI updates step timeline by currentStatus.

## 5. Frontend Gating Rules (Critical)

Financial actions must be KYC-gated:

- Quote pricing deposit initialization.
- Quote balance payment initialization.
- Sample fee payment initialization.

Read-only actions are not KYC-gated:

- Dashboard reading.
- Quote history viewing.
- Order history viewing.

## 6. Frontend State and Persistence

## 6.1 Local storage keys

- leddar_session
  - token
  - email
  - businessName
  - kycStatus
  - kycRejectionReason
- leddar_last_brand_name
- leddar_kyc_profile
  - status: not_started | in_progress | pending_review | verified | rejected
  - rejectionReason
  - updatedAt
- leddar_pending_quote_request_id

## 6.2 Session storage keys

- leddar_pending_quote_intent
  - productType
  - quantity
  - requiredTimeline
  - notes
  - attachments: [{ name, type }]

## 7. Status Enums Used by Frontend

## 7.1 KYC status

- not_started
- in_progress
- pending_review
- verified
- rejected

## 7.2 Quote request status

- pending_admin_pricing
- pricing_ready
- rejected
- not_found

## 7.3 Sample progress status

- requested
- payment_confirmed
- in_review
- sample_ready
- revisions_needed
- completed

## 8. API Contract Expected by Frontend

The endpoints below mirror existing service methods. Backend can keep different internal naming, but should maintain equivalent response shapes.

## 8.1 Auth and session

### POST /auth/login

Request:

```json
{
  "email": "brand@example.com",
  "password": "string"
}
```

Response:

```json
{
  "token": "jwt-or-session-token",
  "email": "brand@example.com",
  "businessName": "Brand Name",
  "kycStatus": "not_started",
  "kycRejectionReason": ""
}
```

## 8.2 Access request

### POST /access-requests

Request:

```json
{
  "businessName": "Brand Name",
  "productType": "Bags",
  "estimatedQuantity": "100-500",
  "contactName": "Jane Doe",
  "email": "brand@example.com",
  "phone": "+234..."
}
```

Response:

```json
{
  "id": "REQ-1001",
  "status": "received"
}
```

## 8.3 KYC

### GET /kyc/profile

Response:

```json
{
  "status": "not_started",
  "rejectionReason": "",
  "updatedAt": "2026-04-06T12:00:00.000Z"
}
```

### POST /kyc/verify

Request:

```json
{
  "idType": "NIN",
  "idNumber": "12345678901"
}
```

Response:

```json
{
  "status": "verified",
  "rejectionReason": "",
  "updatedAt": "2026-04-06T12:01:00.000Z"
}
```

Alternative response for manual compliance:

```json
{
  "status": "pending_review",
  "rejectionReason": "",
  "updatedAt": "2026-04-06T12:01:00.000Z"
}
```

### POST /kyc/retry

Response:

```json
{
  "status": "not_started",
  "rejectionReason": "",
  "updatedAt": "2026-04-06T12:02:00.000Z"
}
```

## 8.4 Quote pricing deposit flow

### POST /quotes/pricing-requests/deposit/initialize

Request:

```json
{
  "productType": "Bags",
  "quantity": 100,
  "requiredTimeline": "3-4 weeks",
  "notes": "string",
  "attachments": [{ "name": "spec.pdf", "type": "application/pdf" }]
}
```

Response:

```json
{
  "draftId": "QPD-123",
  "paymentReference": "QDP-123",
  "depositAmount": 20000,
  "currency": "NGN",
  "authorizationUrl": "https://paystack.com/pay/..."
}
```

### POST /quotes/pricing-requests/deposit/confirm

Request:

```json
{
  "draftId": "QPD-123",
  "paymentReference": "QDP-123"
}
```

Response:

```json
{
  "id": "QPR-123",
  "status": "pending_admin_pricing",
  "submittedAt": "2026-04-06T12:03:00.000Z"
}
```

### GET /quotes/pricing-requests/:id/status

Response (pending):

```json
{
  "id": "QPR-123",
  "status": "pending_admin_pricing"
}
```

Response (ready):

```json
{
  "id": "QPR-123",
  "status": "pricing_ready",
  "redirectPath": "/quote-response?requestId=QPR-123"
}
```

Response (rejected):

```json
{
  "id": "QPR-123",
  "status": "rejected",
  "rejectionReason": "string"
}
```

## 8.5 Quote response and actions

### GET /quotes/pricing-requests/:id/response

Response (ready):

```json
{
  "id": "QPR-123",
  "status": "pricing_ready",
  "breakdown": [
    { "item": "Materials", "amount": "NGN 45000" },
    { "item": "Labour", "amount": "NGN 25000" }
  ],
  "total": "NGN 70000",
  "totalAmount": 70000,
  "depositAmount": 20000,
  "balanceAmount": 50000,
  "submittedAt": "2026-04-06T12:03:00.000Z"
}
```

### GET /quotes/pricing-requests

Response:

```json
[
  {
    "id": "QPR-123",
    "productType": "Bags",
    "quantity": 100,
    "submittedAt": "2026-04-06T12:03:00.000Z",
    "status": "pending_admin_pricing"
  }
]
```

### POST /quotes/pricing-requests/:id/balance/initialize

Response:

```json
{
  "requestId": "QPR-123",
  "authorizationUrl": "https://paystack.com/pay/...",
  "amountDue": 50000,
  "depositApplied": 20000,
  "totalAmount": 70000,
  "currency": "NGN"
}
```

### POST /quotes/pricing-requests/:id/reject

Request:

```json
{
  "reason": "Price too high for current budget"
}
```

Response:

```json
{
  "id": "QPR-123",
  "status": "rejected",
  "rejectionReason": "Price too high for current budget"
}
```

## 8.6 Sample payment and progress

### POST /payments/sample-fee

Request:

```json
{
  "email": "brand@example.com",
  "amount": 30000
}
```

Response:

```json
{
  "reference": "PAY-123",
  "authorizationUrl": "https://paystack.com/pay/...",
  "amount": 30000,
  "currency": "NGN",
  "sampleRequestId": "SAM-123"
}
```

### GET /samples/:id/progress

Response:

```json
{
  "id": "SAM-123",
  "currentStatus": "in_review",
  "updatedAt": "2026-04-06T12:10:00.000Z"
}
```

## 9. Error Contract (Recommended)

Use a consistent JSON shape for all non-2xx responses.

```json
{
  "message": "Human-readable error",
  "code": "OPTIONAL_MACHINE_CODE",
  "details": {}
}
```

Frontend currently displays error.message directly in most flows.

## 10. Frontend Integration Checklist

1. Keep UI component usage unchanged; replace service internals only.
2. Add centralized HTTP client with Authorization header support.
3. Persist token from login and attach on protected requests.
4. Replace mock KYC profile storage with GET /kyc/profile after login.
5. Keep existing status enums; avoid introducing undocumented values.
6. Ensure backend returns requestId and status for quote actions.
7. Maintain returnUrl behavior for KYC redirects.
8. Keep polling intervals until websocket or webhook strategy is added.
9. Ensure payment initialize endpoints return authorizationUrl.
10. Add server-side idempotency for payment confirmation endpoints.

## 11. Suggested HTTP Client Pattern

Create a shared fetch wrapper and call it from service files.

```js
// services/httpClient.js
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function apiRequest(path, options = {}) {
  const sessionRaw =
    typeof window !== "undefined"
      ? window.localStorage.getItem("leddar_session")
      : null;
  const session = sessionRaw ? JSON.parse(sessionRaw) : null;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Request failed.");
  }

  return data;
}
```

Then replace mock wait + in-memory logic in service files with apiRequest calls.

## 12. Migration Plan by File

- services/authService.js
  - Replace local mock login and KYC verification calls with backend requests.
  - Keep helper methods that read/write session until auth architecture changes.

- services/prototypeService.js
  - Replace all quote flow mocks with API requests.
  - Keep function signatures unchanged to avoid page/component refactors.

- services/paymentService.js
  - Replace sample payment/progress mocks with backend endpoints.

- components/brand/QuoteForm.jsx
  - Keep current UX and polling behavior.
  - Optional: move polling to React Query when API is stable.

- pages/quote-response.jsx and components/brand/SampleInfoPage.jsx
  - Keep status rendering as-is; rely on backend status values.

## 13. QA Scenarios for Integration

1. Login success and token persistence.
2. Login failure shows backend message.
3. Unauthenticated access redirects to /login.
4. KYC redirect from quote-request returns to /quote-request?resume=pricing.
5. KYC redirect from quote-response returns to same requestId page.
6. Deposit initialize returns authorizationUrl and opens checkout modal.
7. Deposit confirm returns pending_admin_pricing and starts polling.
8. Pricing transitions to pricing_ready and redirects correctly.
9. Quote rejection persists and appears in quote history.
10. Sample progress updates through all statuses.

## 14. Notes for Backend Developer

- Preserve stable IDs for quote and sample resources.
- Return ISO timestamps for submittedAt and updatedAt.
- Keep numeric amounts as integers in base currency units where possible.
- Ensure payment callbacks can safely confirm only once per reference.
- If KYC can be asynchronous, return pending_review and provide a webhook/refresh strategy.

## 15. Versioning

Document version: v1.0
Last updated: 2026-04-06
Source of truth: Current prototype implementation in pages and services folders.
