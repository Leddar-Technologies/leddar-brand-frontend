// export const VAT_RATE = 0.075;

// export function calculateVat(amount, rate = VAT_RATE) {
//   const normalizedAmount = Number(amount) || 0;
//   return Math.round(normalizedAmount * Number(rate));
// }

// export function calculateTotalWithVat(amount, rate = VAT_RATE) {
//   const baseAmount = Number(amount) || 0;
//   const vatAmount = calculateVat(baseAmount, rate);

//   return {
//     baseAmount,
//     vatAmount,
//     totalAmount: baseAmount + vatAmount,
//   };
// }

// export function formatVatPercent(rate = VAT_RATE) {
//   return `${(Number(rate) * 100).toLocaleString("en-NG")}%`;
// }

// export function formatNaira(amount) {
//   return `₦${Number(amount || 0).toLocaleString("en-NG")}`;
// }

// src/utils/pricing.js

const VAT_RATE = 0.075; // 7.5% Nigerian VAT

// Paystack local-card fee: 1.5% + ₦100 (waived under ₦2,500), capped at ₦2,000.
// Mirrors server/src/services/paystack.service.js so the pre-checkout estimate
// shown here matches what the backend actually charges. Brands absorb this fee,
// shown as its own line item for transparency.
const PAYSTACK_FEE_RATE       = 0.015;
const PAYSTACK_FLAT_FEE       = 100;
const PAYSTACK_FEE_CAP        = 2000;
const PAYSTACK_FLAT_THRESHOLD = 2500;

export function calculatePaystackFee(amount) {
  const flat = amount >= PAYSTACK_FLAT_THRESHOLD ? PAYSTACK_FLAT_FEE : 0;
  return Math.min(PAYSTACK_FEE_CAP, Math.round(amount * PAYSTACK_FEE_RATE + flat));
}

function grossUpForPaystackFee(target) {
  // Assume the flat fee applies (true once the charge clears ₦2,500); if the
  // resulting charge actually falls under the threshold, redo without it.
  let totalAmount = Math.round((target + PAYSTACK_FLAT_FEE) / (1 - PAYSTACK_FEE_RATE));
  if (totalAmount < PAYSTACK_FLAT_THRESHOLD) {
    totalAmount = Math.round(target / (1 - PAYSTACK_FEE_RATE));
  }
  let paystackFee = calculatePaystackFee(totalAmount);
  if (paystackFee >= PAYSTACK_FEE_CAP) {
    totalAmount = target + PAYSTACK_FEE_CAP;
    paystackFee = PAYSTACK_FEE_CAP;
  }
  return { totalAmount, paystackFee };
}

/**
 * Calculates VAT, the Paystack fee, and the total from a base amount in Naira.
 * @param {number} baseAmount - Amount in Naira before VAT
 * @returns {{ baseAmount: number, vatAmount: number, paystackFee: number, totalAmount: number }}
 */
export function calculateTotalWithVat(baseAmount) {
  const vatAmount = Math.round(baseAmount * VAT_RATE);
  const { totalAmount, paystackFee } = grossUpForPaystackFee(baseAmount + vatAmount);
  return { baseAmount, vatAmount, paystackFee, totalAmount };
}

/**
 * Formats a number as Nigerian Naira.
 * @param {number} amount
 * @returns {string} e.g. "₦30,000"
 */
export function formatNaira(amount) {
  if (amount == null || isNaN(amount)) return "₦0";
  return `₦${Number(amount).toLocaleString("en-NG")}`;
}

/**
 * Returns the VAT percentage as a readable string.
 * @returns {string} e.g. "7.5%"
 */
export function formatVatPercent() {
  return `${(VAT_RATE * 100).toString().replace(/\.0$/, "")}%`;
}