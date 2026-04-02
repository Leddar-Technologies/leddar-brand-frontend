function wait(ms = 700) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const mockPricingRequests = {};

export async function submitAccessRequest(payload) {
  // Replace with POST /access-requests when backend is ready.
  await wait();

  if (!payload?.businessName || !payload?.email) {
    throw new Error("Business name and email are required.");
  }

  return {
    id: "REQ-1001",
    status: "received",
  };
}

export async function submitPricingRequest(payload) {
  // Replace with POST /quotes/pricing-requests when backend is ready.
  await wait();

  if (!payload?.productType || !payload?.quantity) {
    throw new Error("Product type and quantity are required.");
  }

  const id = `QPR-${Date.now()}`;

  mockPricingRequests[id] = {
    readyAt: Date.now() + 12000
  };

  return {
    id,
    status: "pending_admin_pricing",
    submittedAt: new Date().toISOString()
  };
}

export async function getPricingRequestStatus(requestId) {
  // Replace with GET /quotes/pricing-requests/:id/status when backend is ready.
  await wait(500);

  const request = mockPricingRequests[requestId];
  if (!request) {
    throw new Error("Pricing request not found.");
  }

  const ready = Date.now() >= request.readyAt;

  return ready
    ? {
        id: requestId,
        status: "pricing_ready",
        redirectPath: `/quote-response?requestId=${requestId}`
      }
    : {
        id: requestId,
        status: "pending_admin_pricing"
      };
}
