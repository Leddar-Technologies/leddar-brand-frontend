import {
  calculateTotalWithVat,
  formatNaira,
  formatVatPercent,
} from "../utils/pricing";

function wait(ms = 700) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const mockPricingRequests = {};
const mockPricingRequestDrafts = {};

const PRICE_DEPOSIT_AMOUNT = 20000;
const MOCK_QUOTE_SUBTOTAL_AMOUNT = 70000;

function buildMockQuote(payload) {
  const { vatAmount, totalAmount } = calculateTotalWithVat(
    MOCK_QUOTE_SUBTOTAL_AMOUNT,
  );
  const balanceAmount = totalAmount - PRICE_DEPOSIT_AMOUNT;

  return {
    breakdown: [
      { item: "Materials", amount: "₦45,000" },
      { item: "Labour", amount: "₦25,000" },
      {
        item: `VAT (${formatVatPercent()})`,
        amount: formatNaira(vatAmount),
      },
      {
        item: "Timeline",
        amount: payload?.requiredTimeline || "To be confirmed",
      },
    ],
    subtotalAmount: MOCK_QUOTE_SUBTOTAL_AMOUNT,
    vatAmount,
    total: formatNaira(totalAmount),
    totalAmount,
    depositAmount: PRICE_DEPOSIT_AMOUNT,
    balanceAmount,
  };
}

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

export async function initializePricingDepositPayment(payload) {
  // Replace with POST /quotes/pricing-requests/deposit/initialize when backend is ready.
  await wait();

  if (!payload?.productType || !payload?.quantity) {
    throw new Error("Product type and quantity are required.");
  }

  if (!payload?.requiredTimeline) {
    throw new Error("Required timeline is required.");
  }

  const draftId = `QPD-${Date.now()}`;
  const paymentReference = `QDP-${Date.now()}`;

  mockPricingRequestDrafts[draftId] = {
    payload,
    paymentReference,
    depositAmount: PRICE_DEPOSIT_AMOUNT,
    createdAt: Date.now(),
  };

  return {
    draftId,
    paymentReference,
    depositAmount: PRICE_DEPOSIT_AMOUNT,
    authorizationUrl: "https://paystack.com/pay/mock-pricing-deposit",
  };
}

export async function confirmPricingDepositPayment({
  draftId,
  paymentReference,
}) {
  // Replace with POST /quotes/pricing-requests/deposit/confirm when backend is ready.
  await wait(500);

  const draft = mockPricingRequestDrafts[draftId];
  if (!draft) {
    throw new Error("Pricing deposit request not found.");
  }

  if (paymentReference && paymentReference !== draft.paymentReference) {
    throw new Error("Invalid payment reference.");
  }

  const id = `QPR-${Date.now()}`;

  mockPricingRequests[id] = {
    payload: draft.payload,
    readyAt: Date.now() + 12000,
    quote: buildMockQuote(draft.payload),
    status: "pending_admin_pricing",
    deposit: {
      amount: draft.depositAmount,
      reference: draft.paymentReference,
      paidAt: new Date().toISOString(),
    },
  };

  delete mockPricingRequestDrafts[draftId];

  return {
    id,
    status: "pending_admin_pricing",
    submittedAt: new Date().toISOString(),
  };
}

export async function getPricingRequestStatus(requestId) {
  // Replace with GET /quotes/pricing-requests/:id/status when backend is ready.
  await wait(500);

  const request = mockPricingRequests[requestId];
  if (!request) {
    throw new Error("Pricing request not found.");
  }

  if (request.status === "rejected") {
    return {
      id: requestId,
      status: "rejected",
      rejectionReason: request.rejectionReason || "No reason provided.",
    };
  }

  const ready = Date.now() >= request.readyAt;

  if (ready) {
    request.status = "pricing_ready";
  }

  return ready
    ? {
        id: requestId,
        status: "pricing_ready",
        redirectPath: `/order-status?requestId=${requestId}`,
      }
    : {
        id: requestId,
        status: "pending_admin_pricing",
      };
}

export async function getOrderStatus(requestId) {
  // Replace with GET /quotes/pricing-requests/:id/response when backend is ready.
  await wait(450);

  const request = mockPricingRequests[requestId];
  if (!request) {
    return {
      id: requestId,
      status: "not_found",
    };
  }

  if (request.status === "rejected") {
    return {
      id: requestId,
      status: "rejected",
      rejectionReason: request.rejectionReason || "No reason provided.",
      submittedAt: new Date(request.deposit.paidAt).toISOString(),
    };
  }

  const ready = Date.now() >= request.readyAt;

  if (ready) {
    request.status = "pricing_ready";
  }

  if (!ready) {
    return {
      id: requestId,
      status: "pending_admin_pricing",
      submittedAt: new Date(request.deposit.paidAt).toISOString(),
    };
  }

  return {
    id: requestId,
    status: "pricing_ready",
    breakdown: request.quote.breakdown,
    total: request.quote.total,
    subtotalAmount: request.quote.subtotalAmount,
    vatAmount: request.quote.vatAmount,
    totalAmount: request.quote.totalAmount,
    depositAmount: request.quote.depositAmount,
    balanceAmount: request.quote.balanceAmount,
    submittedAt: new Date(request.deposit.paidAt).toISOString(),
  };
}

export async function initializeQuoteBalancePayment(requestId) {
  // Replace with POST /quotes/pricing-requests/:id/balance/initialize when backend is ready.
  await wait(500);

  const request = mockPricingRequests[requestId];
  if (!request) {
    throw new Error("New order not found.");
  }

  const ready = Date.now() >= request.readyAt;
  if (!ready && request.status !== "pricing_ready") {
    throw new Error("Quote is not ready for payment yet.");
  }

  request.status = "pricing_ready";

  return {
    requestId,
    authorizationUrl: `https://paystack.com/pay/mock-balance-${requestId}`,
    subtotalAmount: request.quote.subtotalAmount,
    vatAmount: request.quote.vatAmount,
    amountDue: request.quote.balanceAmount,
    depositApplied: request.quote.depositAmount,
    totalAmount: request.quote.totalAmount,
  };
}

export async function rejectQuoteRequest(requestId, reason) {
  // Replace with POST /quotes/pricing-requests/:id/reject when backend is ready.
  await wait(450);

  const request = mockPricingRequests[requestId];
  if (!request) {
    throw new Error("New order not found.");
  }

  request.status = "rejected";
  request.rejectionReason = String(reason || "").trim();

  return {
    id: requestId,
    status: "rejected",
    rejectionReason: request.rejectionReason || "No reason provided.",
  };
}

export async function listPricingRequests() {
  // Replace with GET /quotes/pricing-requests when backend is ready.
  await wait(350);

  return Object.entries(mockPricingRequests)
    .map(([id, request]) => {
      const ready = Date.now() >= request.readyAt;
      const status =
        request.status === "rejected"
          ? "rejected"
          : ready
            ? "pricing_ready"
            : "pending_admin_pricing";

      return {
        id,
        productType: request.payload?.productType || "-",
        quantity: request.payload?.quantity || 0,
        submittedAt: request.deposit?.paidAt || new Date().toISOString(),
        status,
      };
    })
    .sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));
}
