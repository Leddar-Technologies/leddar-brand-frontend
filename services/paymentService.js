// src/services/paymentService.js (frontend — brand app)
import api from "./api";

// ---------------------------------------------------------------------------
// Sample flat fee — ₦30,000
// POST /api/v1/payments/initialize-sample
// ---------------------------------------------------------------------------
export async function initializeSamplePayment({ email, quoteIntent, fileIds = [] }) {
  if (!quoteIntent?.productType || !quoteIntent?.quantity) {
    throw new Error("Quote details are missing. Please go back to New Order and try again.");
  }
  const response = await api.post("/payments/initialize-sample", { email, quoteIntent, fileIds });
  return response.data.data;
}

// ---------------------------------------------------------------------------
// Production balance payment
// POST /api/v1/payments/initialize-production
// ---------------------------------------------------------------------------
export async function initializeProductionPayment({ email, orderId, quoteId }) {
  if (!orderId && !quoteId) throw new Error("Either orderId or quoteId is required.");
  const response = await api.post("/payments/initialize-production", {
    email,
    ...(orderId ? { orderId } : { quoteId }),
  });
  return response.data.data;
}

// ---------------------------------------------------------------------------
// Sample progress polling
// GET /api/v1/brands/orders/:orderId/progress
// ---------------------------------------------------------------------------
export async function getSampleProgress(orderId) {
  const response = await api.get(`/brands/orders/${orderId}/progress`);
  return response.data.data;
}

// ---------------------------------------------------------------------------
// Brand quotes — view all quotes + single quote with pricing
// ---------------------------------------------------------------------------
export async function getBrandQuotes() {
  const response = await api.get("/brands/quotes");
  return response.data.data;
}

export async function getBrandQuoteById(quoteId) {
  const response = await api.get(`/brands/quotes/${quoteId}`);
  return response.data.data;
}

// ---------------------------------------------------------------------------
// Brand orders — history + single order detail
// ---------------------------------------------------------------------------
export async function getBrandOrders() {
  const response = await api.get("/brands/orders");
  return response.data.data;
}

export async function getBrandOrderById(orderId) {
  const response = await api.get(`/brands/orders/${orderId}`);
  return response.data.data;
}

// ---------------------------------------------------------------------------
// Sample review — brand approves / rejects / requests edit
// ---------------------------------------------------------------------------
export async function submitSampleReview({ orderId, decision, feedback }) {
  const response = await api.post(`/brands/orders/${orderId}/review`, { decision, feedback });
  return response.data.data;
}

export async function getSampleReviewData(orderId) {
  const response = await api.get(`/brands/orders/${orderId}/sample-review`);
  return response.data.data;
}

// ---------------------------------------------------------------------------
// Payment history
// ---------------------------------------------------------------------------
export async function getBrandPayments() {
  const response = await api.get("/brands/payments");
  return response.data.data;
}

// ---------------------------------------------------------------------------
// Job pipeline — brand actions
// ---------------------------------------------------------------------------

/** Brand approves the sample → triggers production job creation */
export async function approveSample(jobId) {
  const response = await api.patch(`/brands/jobs/${jobId}/approve-sample`, {});
  return response.data;
}

/**
 * Brand requests a correction
 * @param {string} jobId
 * @param {string} note  — feedback for the artisan
 */
export async function requestCorrection(jobId, note) {
  const response = await api.patch(`/brands/jobs/${jobId}/request-correction`, { note });
  return response.data;
}

/** Brand confirms receipt of dispatched production order */
export async function confirmReceipt(jobId) {
  const response = await api.patch(`/brands/jobs/${jobId}/confirm-receipt`, {});
  return response.data;
}

/** Get a 15-min presigned URL for a private S3 file (video, etc.) */
export async function presignBrandFile(url) {
  const response = await api.get("/brands/files/presign", { params: { url } });
  return response.data.signedUrl;
}
