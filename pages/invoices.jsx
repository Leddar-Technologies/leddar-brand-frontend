import PageWrapper from "../components/layout/PageWrapper";
import InvoiceRow from "../components/brand/InvoiceRow";
import { invoices } from "../data/mockData";

function parseNairaAmount(value) {
  return Number(value.replace(/[^\d.-]/g, "")) || 0;
}

function formatNaira(amount) {
  return `₦${amount.toLocaleString("en-NG")}`;
}

export default function InvoicesPage() {
  const paidTotal = invoices
    .filter((invoice) => invoice.status === "Paid")
    .reduce((sum, invoice) => sum + parseNairaAmount(invoice.total), 0);

  const outstandingTotal = invoices
    .filter((invoice) => invoice.status !== "Paid")
    .reduce((sum, invoice) => sum + parseNairaAmount(invoice.total), 0);

  const pendingCount = invoices.filter(
    (invoice) => invoice.status !== "Paid",
  ).length;

  function handlePayNow(invoice) {
    const reference = `INV-${invoice.orderId}-${Date.now()}`;
    window.open(
      `https://paystack.com/pay/mock-invoice-${encodeURIComponent(reference)}`,
      "_blank",
      "noopener,noreferrer",
    );
  }

  return (
    <PageWrapper>
      <h1 className="page-title">Payment & Invoices</h1>
      <p className="page-subtitle mt-1">
        Track invoice statuses and settle pending balances.
      </p>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="card p-5">
          <p className="text-sm text-[#6A5B54]">Total Paid</p>
          <p className="mt-2 text-3xl font-semibold text-success">
            {formatNaira(paidTotal)}
          </p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-[#6A5B54]">Outstanding Balance</p>
          <p className="mt-2 text-3xl font-semibold text-gold">
            {formatNaira(outstandingTotal)}
          </p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-[#6A5B54]">Pending Invoices</p>
          <p className="mt-2 text-3xl font-semibold text-ink">{pendingCount}</p>
        </div>
      </div>

      <div className="card mt-6 overflow-x-auto p-4">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-[#EEE4DB] text-left text-xs uppercase tracking-wide text-[#7F7068]">
              <th className="px-3 py-3">Order ID</th>
              <th className="px-3 py-3">Product</th>
              <th className="px-3 py-3">Date</th>
              <th className="px-3 py-3">Amount</th>
              <th className="px-3 py-3">VAT</th>
              <th className="px-3 py-3">Total</th>
              <th className="px-3 py-3">Status</th>
              <th className="px-3 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <InvoiceRow
                key={invoice.orderId}
                invoice={invoice}
                onPayNow={handlePayNow}
              />
            ))}
          </tbody>
        </table>
      </div>
    </PageWrapper>
  );
}
