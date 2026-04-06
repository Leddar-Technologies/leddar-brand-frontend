function wait(ms = 600) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const SAMPLE_STATUS_ORDER = [
  "requested",
  "payment_confirmed",
  "in_review",
  "sample_ready",
  "revisions_needed",
  "completed",
];

const mockSampleRequests = {};

function getStatusFromElapsed(elapsedMs) {
  if (elapsedMs < 3000) {
    return SAMPLE_STATUS_ORDER[0];
  }
  if (elapsedMs < 8000) {
    return SAMPLE_STATUS_ORDER[1];
  }
  if (elapsedMs < 14000) {
    return SAMPLE_STATUS_ORDER[2];
  }
  if (elapsedMs < 20000) {
    return SAMPLE_STATUS_ORDER[3];
  }
  if (elapsedMs < 26000) {
    return SAMPLE_STATUS_ORDER[4];
  }
  return SAMPLE_STATUS_ORDER[5];
}

export async function initializeSamplePayment({ email, amount }) {
  // Replace with POST /payments/sample-fee when backend is ready.
  await wait();

  if (!email) {
    throw new Error("Email is required to initialize payment.");
  }

  const sampleRequestId = `SAM-${Date.now()}`;
  mockSampleRequests[sampleRequestId] = {
    createdAt: Date.now(),
  };

  return {
    reference: `PAY-${Date.now()}`,
    authorizationUrl: "https://paystack.com/pay/mock-sample-fee",
    amount,
    sampleRequestId,
  };
}

export async function getSampleProgress(sampleRequestId) {
  // Replace with GET /samples/:id/progress when backend is ready.
  await wait(400);

  const sampleRequest = mockSampleRequests[sampleRequestId];
  if (!sampleRequest) {
    throw new Error("Sample request not found.");
  }

  const elapsedMs = Date.now() - sampleRequest.createdAt;

  return {
    id: sampleRequestId,
    currentStatus: getStatusFromElapsed(elapsedMs),
    updatedAt: new Date().toISOString(),
  };
}
