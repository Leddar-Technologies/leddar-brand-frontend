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

/**
 * Calculates VAT and total from a base amount in Naira.
 * @param {number} baseAmount - Amount in Naira before VAT
 * @returns {{ baseAmount: number, vatAmount: number, totalAmount: number }}
 */
export function calculateTotalWithVat(baseAmount) {
  const vatAmount = Math.round(baseAmount * VAT_RATE);
  const totalAmount = baseAmount + vatAmount;
  return { baseAmount, vatAmount, totalAmount };
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