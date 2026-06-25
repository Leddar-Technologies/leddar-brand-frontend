// // src/services/paymentService.js  (frontend)
// import axios from "axios";
// import { getSession } from "./authService";

// const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

// function authHeaders() {
//   const session = getSession();
//   if (!session?.token) throw new Error("Not authenticated.");
//   return { Authorization: `Bearer ${session.token}` };
// }

// // ---------------------------------------------------------------------------
// // Sample flat fee — ₦30,000
// // POST /api/v1/payments/initialize-sample
// //
// // No quoteId needed up front. The backend creates the Quote + Order after
// // the Paystack webhook confirms payment. We send the quote intent (product
// // details) as metadata so the webhook has everything it needs.
// // ---------------------------------------------------------------------------

// /**
//  * @param {{ email: string, quoteIntent: object }} payload
//  *   quoteIntent = { productType, quantity, requiredTimeline, notes, attachments }
//  * @returns {{ reference, authorizationUrl, amount, vatAmount, totalAmount }}
//  */
// export async function initializeSamplePayment({ email, quoteIntent }) {
//   const response = await axios.post(
//     `${API_URL}/payments/initialize-sample`,
//     { email, quoteIntent },
//     { headers: authHeaders() },
//   );
//   return response.data.data;
// }

// // ---------------------------------------------------------------------------
// // Production balance payment
// // POST /api/v1/payments/initialize-production
// // ---------------------------------------------------------------------------

// /**
//  * @param {{ email: string, orderId: string }} payload
//  * @returns {{ reference, authorizationUrl, productionTotal, sampleCredit,
//  *             balanceDue, vatAmount, totalPayable }}
//  */
// export async function initializeProductionPayment({ email, orderId }) {
//   const response = await axios.post(
//     `${API_URL}/payments/initialize-production`,
//     { email, orderId },
//     { headers: authHeaders() },
//   );
//   return response.data.data;
// }

// // ---------------------------------------------------------------------------
// // Sample progress polling
// // GET /api/v1/orders/:sampleRequestId/progress
// // ---------------------------------------------------------------------------

// /**
//  * @param {string} sampleRequestId
//  * @returns {{ sampleRequestId: string, currentStatus: string }}
//  */
// export async function getSampleProgress(sampleRequestId) {
//   const response = await axios.get(
//     `${API_URL}/orders/${sampleRequestId}/progress`,
//     { headers: authHeaders() },
//   );
//   return response.data.data;
// }

// src/services/paymentService.js (frontend — brand app)
import axios from "axios";
import { getSession } from "./authService";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

function authHeaders() {
  const session = getSession();
  if (!session?.token) throw new Error("Not authenticated.");
  return { Authorization: `Bearer ${session.token}` };
}

// ---------------------------------------------------------------------------
// Sample flat fee — ₦30,000
// POST /api/v1/payments/initialize-sample
// ---------------------------------------------------------------------------
export async function initializeSamplePayment({ email, quoteIntent, fileIds = [] }) {
  if (!quoteIntent?.productType || !quoteIntent?.quantity) {
    throw new Error("Quote details are missing. Please go back to New Order and try again.");
  }
  const response = await axios.post(
    `${API_URL}/payments/initialize-sample`,
    { email, quoteIntent, fileIds },
    { headers: authHeaders() },
  );
  return response.data.data;
}

// ---------------------------------------------------------------------------
// Production balance payment
// POST /api/v1/payments/initialize-production
// ---------------------------------------------------------------------------
export async function initializeProductionPayment({ email, orderId, quoteId }) {
  if (!orderId && !quoteId) throw new Error("Either orderId or quoteId is required.");
  const response = await axios.post(
    `${API_URL}/payments/initialize-production`,
    { email, ...(orderId ? { orderId } : { quoteId }) },
    { headers: authHeaders() },
  );
  return response.data.data;
}

// ---------------------------------------------------------------------------
// Sample progress polling
// GET /api/v1/brands/orders/:orderId/progress
// ---------------------------------------------------------------------------
export async function getSampleProgress(orderId) {
  const response = await axios.get(
    `${API_URL}/brands/orders/${orderId}/progress`,
    { headers: authHeaders() },
  );
  return response.data.data;
}

// ---------------------------------------------------------------------------
// Brand quotes — view all quotes + single quote with pricing
// ---------------------------------------------------------------------------
export async function getBrandQuotes() {
  const response = await axios.get(
    `${API_URL}/brands/quotes`,
    { headers: authHeaders() },
  );
  return response.data.data;
}

export async function getBrandQuoteById(quoteId) {
  const response = await axios.get(
    `${API_URL}/brands/quotes/${quoteId}`,
    { headers: authHeaders() },
  );
  return response.data.data;
}

// ---------------------------------------------------------------------------
// Brand orders — history + single order detail
// ---------------------------------------------------------------------------
export async function getBrandOrders() {
  const response = await axios.get(
    `${API_URL}/brands/orders`,
    { headers: authHeaders() },
  );
  return response.data.data;
}

export async function getBrandOrderById(orderId) {
  const response = await axios.get(
    `${API_URL}/brands/orders/${orderId}`,
    { headers: authHeaders() },
  );
  return response.data.data;
}

// ---------------------------------------------------------------------------
// Sample review — brand approves / rejects / requests edit
// ---------------------------------------------------------------------------
export async function submitSampleReview({ orderId, decision, feedback }) {
  const response = await axios.post(
    `${API_URL}/brands/orders/${orderId}/review`,
    { decision, feedback },
    { headers: authHeaders() },
  );
  return response.data.data;
}

export async function getSampleReviewData(orderId) {
  const response = await axios.get(
    `${API_URL}/brands/orders/${orderId}/sample-review`,
    { headers: authHeaders() },
  );
  return response.data.data;
}

// ---------------------------------------------------------------------------
// Payment history
// ---------------------------------------------------------------------------
export async function getBrandPayments() {
  const response = await axios.get(
    `${API_URL}/brands/payments`,
    { headers: authHeaders() },
  );
  return response.data.data;
}

// ---------------------------------------------------------------------------
// Job pipeline — brand actions
// ---------------------------------------------------------------------------

/** Brand approves the sample → triggers production job creation */
export async function approveSample(jobId) {
  const response = await axios.patch(
    `${API_URL}/brands/jobs/${jobId}/approve-sample`,
    {},
    { headers: authHeaders() },
  );
  return response.data;
}

/**
 * Brand requests a correction
 * @param {string} jobId
 * @param {string} note  — feedback for the artisan
 */
export async function requestCorrection(jobId, note) {
  const response = await axios.patch(
    `${API_URL}/brands/jobs/${jobId}/request-correction`,
    { note },
    { headers: authHeaders() },
  );
  return response.data;
}

/** Brand confirms receipt of dispatched production order */
export async function confirmReceipt(jobId) {
  const response = await axios.patch(
    `${API_URL}/brands/jobs/${jobId}/confirm-receipt`,
    {},
    { headers: authHeaders() },
  );
  return response.data;
}

/** Get a 15-min presigned URL for a private S3 file (video, etc.) */
export async function presignBrandFile(url) {
  const response = await axios.get(
    `${API_URL}/brands/files/presign`,
    { params: { url }, headers: authHeaders() },
  );
  return response.data.signedUrl;
}
