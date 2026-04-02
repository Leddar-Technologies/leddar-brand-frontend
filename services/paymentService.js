function wait(ms = 600) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function initializeSamplePayment({ email, amount }) {
  // Replace with POST /payments/sample-fee when backend is ready.
  await wait();

  if (!email) {
    throw new Error("Email is required to initialize payment.");
  }

  return {
    reference: `PAY-${Date.now()}`,
    authorizationUrl: "https://paystack.com/pay/mock-sample-fee",
    amount,
  };
}
