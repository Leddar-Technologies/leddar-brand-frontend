import PageWrapper from "../components/layout/PageWrapper";
import InvoiceRow from "../components/brand/InvoiceRow";
import { invoices } from "../data/mockData";

export default function InvoicesPage() {
  return (
    <PageWrapper>
      <h1 className="page-title">Invoices</h1>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="card p-5">
          <p className="text-sm text-[#6A5B54]">Total Paid</p>
          <p className="mt-2 text-3xl font-semibold text-success">₦210,000</p>
        </div>
        <div className="card p-5">
          <p className="text-sm text-[#6A5B54]">Outstanding Balance</p>
          <p className="mt-2 text-3xl font-semibold text-gold">₦70,000</p>
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
              <InvoiceRow key={invoice.orderId} invoice={invoice} />
            ))}
          </tbody>
        </table>
      </div>
    </PageWrapper>
  );
}
