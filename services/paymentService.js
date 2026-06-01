// import { calculateTotalWithVat } from "../utils/pricing";

// function wait(ms = 600) {
//   return new Promise((resolve) => setTimeout(resolve, ms));
// }

// const SAMPLE_STATUS_ORDER = [
//   "requested",
//   "payment_confirmed",
//   "in_review",
//   "sample_ready",
//   "revisions_needed",
//   "completed",
// ];

// const mockSampleRequests = {};

// function getStatusFromElapsed(elapsedMs) {
//   if (elapsedMs < 3000) {
//     return SAMPLE_STATUS_ORDER[0];
//   }
//   if (elapsedMs < 8000) {
//     return SAMPLE_STATUS_ORDER[1];
//   }
//   if (elapsedMs < 14000) {
//     return SAMPLE_STATUS_ORDER[2];
//   }
//   if (elapsedMs < 20000) {
//     return SAMPLE_STATUS_ORDER[3];
//   }
//   if (elapsedMs < 26000) {
//     return SAMPLE_STATUS_ORDER[4];
//   }
//   return SAMPLE_STATUS_ORDER[5];
// }

// export async function initializeSamplePayment({ email, amount }) {
//   // Replace with POST /payments/sample-fee when backend is ready.
//   await wait();

//   if (!email) {
//     throw new Error("Email is required to initialize payment.");
//   }

//   const baseAmount = Number(amount);
//   if (!Number.isFinite(baseAmount) || baseAmount <= 0) {
//     throw new Error("A valid sample fee amount is required.");
//   }

//   const { vatAmount, totalAmount } = calculateTotalWithVat(baseAmount);

//   const sampleRequestId = `SAM-${Date.now()}`;
//   mockSampleRequests[sampleRequestId] = {
//     createdAt: Date.now(),
//   };

//   return {
//     reference: `PAY-${Date.now()}`,
//     authorizationUrl: "https://paystack.com/pay/mock-sample-fee",
//     amount: baseAmount,
//     vatAmount,
//     totalAmount,
//     sampleRequestId,
//   };
// }

// export async function getSampleProgress(sampleRequestId) {
//   // Replace with GET /samples/:id/progress when backend is ready.
//   await wait(400);

//   const sampleRequest = mockSampleRequests[sampleRequestId];
//   if (!sampleRequest) {
//     throw new Error("Sample request not found.");
//   }

//   const elapsedMs = Date.now() - sampleRequest.createdAt;

//   return {
//     id: sampleRequestId,
//     currentStatus: getStatusFromElapsed(elapsedMs),
//     updatedAt: new Date().toISOString(),
//   };
// }

// src/services/paymentService.js  (frontend)
import axios from "axios";
import { getSession } from "./authService";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

function authHeaders() {
  const session = getSession();
  if (!session?.token) throw new Error("Not authenticated.");
  return { Authorization: `Bearer ${session.token}` };
}

// ---------------------------------------------------------------------------
// Sample flat fee — ₦30,000
// POST /api/v1/payments/initialize-sample
//
// No quoteId needed up front. The backend creates the Quote + Order after
// the Paystack webhook confirms payment. We send the quote intent (product
// details) as metadata so the webhook has everything it needs.
// ---------------------------------------------------------------------------

/**
 * @param {{ email: string, quoteIntent: object }} payload
 *   quoteIntent = { productType, quantity, requiredTimeline, notes, attachments }
 * @returns {{ reference, authorizationUrl, amount, vatAmount, totalAmount }}
 */
export async function initializeSamplePayment({ email, quoteIntent }) {
  const response = await axios.post(
    `${API_URL}/payments/initialize-sample`,
    { email, quoteIntent },
    { headers: authHeaders() },
  );
  return response.data.data;
}

// ---------------------------------------------------------------------------
// Production balance payment
// POST /api/v1/payments/initialize-production
// ---------------------------------------------------------------------------

/**
 * @param {{ email: string, orderId: string }} payload
 * @returns {{ reference, authorizationUrl, productionTotal, sampleCredit,
 *             balanceDue, vatAmount, totalPayable }}
 */
export async function initializeProductionPayment({ email, orderId }) {
  const response = await axios.post(
    `${API_URL}/payments/initialize-production`,
    { email, orderId },
    { headers: authHeaders() },
  );
  return response.data.data;
}

// ---------------------------------------------------------------------------
// Sample progress polling
// GET /api/v1/orders/:sampleRequestId/progress
// ---------------------------------------------------------------------------

/**
 * @param {string} sampleRequestId
 * @returns {{ sampleRequestId: string, currentStatus: string }}
 */
export async function getSampleProgress(sampleRequestId) {
  const response = await axios.get(
    `${API_URL}/orders/${sampleRequestId}/progress`,
    { headers: authHeaders() },
  );
  return response.data.data;
}
