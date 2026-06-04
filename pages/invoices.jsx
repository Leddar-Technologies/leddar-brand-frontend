// import PageWrapper from "../components/layout/PageWrapper";
// import InvoiceRow from "../components/brand/InvoiceRow";
// import { invoices } from "../data/mockData";

// function parseNairaAmount(value) {
//   return Number(value.replace(/[^\d.-]/g, "")) || 0;
// }

// function formatNaira(amount) {
//   return `₦${amount.toLocaleString("en-NG")}`;
// }

// export default function InvoicesPage() {
//   const paidTotal = invoices
//     .filter((invoice) => invoice.status === "Paid")
//     .reduce((sum, invoice) => sum + parseNairaAmount(invoice.total), 0);

//   const outstandingTotal = invoices
//     .filter((invoice) => invoice.status !== "Paid")
//     .reduce((sum, invoice) => sum + parseNairaAmount(invoice.total), 0);

//   const pendingCount = invoices.filter(
//     (invoice) => invoice.status !== "Paid",
//   ).length;

//   function handlePayNow(invoice) {
//     const reference = `INV-${invoice.orderId}-${Date.now()}`;
//     window.open(
//       `https://paystack.com/pay/mock-invoice-${encodeURIComponent(reference)}`,
//       "_blank",
//       "noopener,noreferrer",
//     );
//   }

//   return (
//     <PageWrapper>
//       <h1 className="page-title">Payment & Invoices</h1>
//       <p className="page-subtitle mt-1">
//         Track invoice statuses and settle pending balances.
//       </p>

//       <div className="mt-6 grid gap-4 md:grid-cols-3">
//         <div className="card p-5">
//           <p className="text-sm text-[#6A5B54]">Total Paid</p>
//           <p className="mt-2 text-3xl font-semibold text-success">
//             {formatNaira(paidTotal)}
//           </p>
//         </div>
//         <div className="card p-5">
//           <p className="text-sm text-[#6A5B54]">Outstanding Balance</p>
//           <p className="mt-2 text-3xl font-semibold text-gold">
//             {formatNaira(outstandingTotal)}
//           </p>
//         </div>
//         <div className="card p-5">
//           <p className="text-sm text-[#6A5B54]">Pending Invoices</p>
//           <p className="mt-2 text-3xl font-semibold text-ink">{pendingCount}</p>
//         </div>
//       </div>

//       <div className="card mt-6 overflow-x-auto p-4">
//         <table className="min-w-full">
//           <thead>
//             <tr className="border-b border-[#EEE4DB] text-left text-xs uppercase tracking-wide text-[#7F7068]">
//               <th className="px-3 py-3">Order ID</th>
//               <th className="px-3 py-3">Product</th>
//               <th className="px-3 py-3">Date</th>
//               <th className="px-3 py-3">Amount</th>
//               <th className="px-3 py-3">VAT</th>
//               <th className="px-3 py-3">Total</th>
//               <th className="px-3 py-3">Status</th>
//               <th className="px-3 py-3">Actions</th>
//             </tr>
//           </thead>
//           <tbody>
//             {invoices.map((invoice) => (
//               <InvoiceRow
//                 key={invoice.orderId}
//                 invoice={invoice}
//                 onPayNow={handlePayNow}
//               />
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </PageWrapper>
//   );
// }

// pages/invoices.jsx — Brand app
import { useEffect, useState } from "react";
import { Download, CheckCircle2, Clock, Loader2 } from "lucide-react";
import PageWrapper from "../components/layout/PageWrapper";
import Spinner from "../components/ui/Spinner";
import { getBrandPayments, getBrandOrders } from "../services/paymentService";
import { getSession } from "../services/authService";
import { formatNaira } from "../utils/pricing";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

// Fetch PDF with auth token then trigger browser download
async function downloadInvoicePdf(orderId, filename) {
  const session = getSession();
  const res = await fetch(`${API_URL}/brands/orders/${orderId}/invoice`, {
    headers: { Authorization: `Bearer ${session?.token}` },
  });
  if (!res.ok) throw new Error("Failed to download invoice");
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function InvoicesPage() {
  const [orders, setOrders] = useState({ sample: [], production: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState("");

  useEffect(() => {
    getBrandOrders()
      .then(setOrders)
      .catch((err) => setError(err.message || "Failed to load invoices."))
      .finally(() => setLoading(false));
  }, []);

  const allOrders = [...(orders.sample || []), ...(orders.production || [])].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );

  return (
    <PageWrapper>
      <h1 className="page-title">Payment & Invoices</h1>
      <p className="page-subtitle mt-1">Download invoices and view your payment history.</p>

      {loading ? (
        <div className="mt-10 flex justify-center">
          <Spinner size="lg" className="text-gold" />
        </div>
      ) : error ? (
        <p className="mt-6 text-sm text-[#B42318]">{error}</p>
      ) : allOrders.length === 0 ? (
        <div className="mt-10 rounded-xl border border-[#E8DED5] bg-white p-8 text-center text-sm text-[#7B6A62]">
          No invoices yet. Complete a payment to see your invoices here.
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {allOrders.map((order) => {
            // Payment is confirmed if any payment record is RECEIVED or HELD_IN_ESCROW
            const PAID_STATUSES = ["RECEIVED", "HELD_IN_ESCROW", "RELEASED"];
            const isPaid = order.payments?.some((p) => PAID_STATUSES.includes(p.status));
            const productTypes = order.quote?.productType || [];
            const productType = productTypes.join(", ") || "Leather Product";
            const invoiceUrl = `${API_URL}/brands/orders/${order.id}/invoice`;

            return (
              <div
                key={order.id}
                className="flex items-center justify-between gap-4 rounded-xl border border-[#E6D7CB] bg-white p-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-ink">{productType}</p>
                  <p className="mt-0.5 text-xs text-[#7B6A62]">
                    {order.type} · {new Date(order.createdAt).toLocaleDateString("en-NG")}
                  </p>
                  <p className="mt-0.5 text-xs font-medium text-ink">{formatNaira(order.totalAmount)}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                      isPaid
                        ? "bg-[#2D6A4F14] text-success"
                        : "bg-[#FFF3E0] text-[#B45309]"
                    }`}
                  >
                    {isPaid ? (
                      <><CheckCircle2 className="h-3 w-3" /> Payment Confirmed</>
                    ) : (
                      <><Clock className="h-3 w-3" /> Pending</>
                    )}
                  </span>

                  {isPaid ? (
                    <button
                      disabled={downloading === order.id}
                      onClick={async () => {
                        setDownloading(order.id);
                        try {
                          const ref = `INV-${order.id.slice(0, 8).toUpperCase()}`;
                          await downloadInvoicePdf(order.id, `${ref}.pdf`);
                        } catch {
                          alert("Could not download invoice. Please try again.");
                        } finally {
                          setDownloading("");
                        }
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#E6D7CB] bg-white px-3 py-1.5 text-xs font-medium text-ink hover:bg-[#FFF8EF] transition-colors disabled:opacity-60"
                    >
                      {downloading === order.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Download className="h-3.5 w-3.5" />
                      )}
                      Download Invoice
                    </button>
                  ) : (
                    <span className="text-xs text-[#9B8A82]">Awaiting payment</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageWrapper>
  );
}
