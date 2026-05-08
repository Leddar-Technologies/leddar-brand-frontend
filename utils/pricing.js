export const VAT_RATE = 0.075;

export function calculateVat(amount, rate = VAT_RATE) {
  const normalizedAmount = Number(amount) || 0;
  return Math.round(normalizedAmount * Number(rate));
}

export function calculateTotalWithVat(amount, rate = VAT_RATE) {
  const baseAmount = Number(amount) || 0;
  const vatAmount = calculateVat(baseAmount, rate);

  return {
    baseAmount,
    vatAmount,
    totalAmount: baseAmount + vatAmount,
  };
}

export function formatVatPercent(rate = VAT_RATE) {
  return `${(Number(rate) * 100).toLocaleString("en-NG")}%`;
}

export function formatNaira(amount) {
  return `₦${Number(amount || 0).toLocaleString("en-NG")}`;
}
