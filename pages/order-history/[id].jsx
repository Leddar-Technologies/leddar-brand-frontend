// pages/order-history/[id].jsx — Brand order detail
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import {
  ArrowLeft, CheckCircle2, Clock, Package, Download,
  FlaskConical, Loader2, Video,
} from "lucide-react";
import PageWrapper from "../../components/layout/PageWrapper";
import Spinner from "../../components/ui/Spinner";
import BrandingBadges from "../../components/ui/BrandingBadges";
import { getBrandOrderById } from "../../services/paymentService";
import { getSession } from "../../services/authService";
import { formatNaira } from "../../utils/pricing";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.myleddar.com/api/v1";

const STATUS_COLORS = {
  SUBMITTED:          "bg-[#F0EDE8] text-[#6D5A51]",
  FLAT_FEE_PAID:      "bg-[#FFF3E0] text-[#B45309]",
  SAMPLE_IN_PROGRESS: "bg-[#FFF3E0] text-[#B45309]",
  SAMPLE_COMPLETED:   "bg-[#E6F1FB] text-[#0C447C]",
  SAMPLE_APPROVED:    "bg-[#EAF3DE] text-[#27500A]",
  BALANCE_PAID:       "bg-[#EAF3DE] text-[#27500A]",
  IN_PRODUCTION:      "bg-[#FFF3E0] text-[#B45309]",
  SHIPPED:            "bg-[#E6F1FB] text-[#0C447C]",
  DELIVERED:          "bg-[#EAF3DE] text-[#27500A]",
};

const STATUS_LABELS = {
  SUBMITTED:          "Submitted",
  FLAT_FEE_PAID:      "Fee Paid",
  SAMPLE_IN_PROGRESS: "Sample In Progress",
  SAMPLE_COMPLETED:   "Sample Ready",
  SAMPLE_APPROVED:    "Sample Approved",
  BALANCE_PAID:       "Balance Paid",
  IN_PRODUCTION:      "In Production",
  SHIPPED:            "Shipped",
  DELIVERED:          "Delivered",
};

const PAYMENT_STAGE_LABELS = {
  SAMPLE_FLAT_FEE: "Sample Fee",
  MATERIAL:        "Materials (Stage 1)",
  SERVICE:         "Service Fee (Stage 2)",
  FULL_PAYMENT:    "Production Balance",
};

async function downloadInvoicePdf(orderId, fallbackFilename) {
  const session = getSession();
  const res = await fetch(`${API_URL}/brands/orders/${orderId}/invoice`, {
    headers: { Authorization: `Bearer ${session?.token}` },
  });
  if (!res.ok) throw new Error("Failed to download invoice");
  // Use the server-provided filename from Content-Disposition (single source of truth)
  const disposition = res.headers.get("Content-Disposition") || "";
  const match = disposition.match(/filename="([^"]+)"/);
  const filename = match ? match[1] : fallbackFilename;
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

export default function OrderDetailPage() {
  const router    = useRouter();
  const { id }    = router.query;

  const [order, setOrder]           = useState(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!id) return;
    getBrandOrderById(id)
      .then(setOrder)
      .catch((err) => setError(err.message || "Failed to load order."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <PageWrapper>
      <div className="flex justify-center py-20"><Spinner size="lg" className="text-gold" /></div>
    </PageWrapper>
  );

  if (error || !order) return (
    <PageWrapper>
      <Link href="/order-history" className="inline-flex items-center gap-2 text-sm text-[#7B6A62] hover:text-ink">
        <ArrowLeft className="h-4 w-4" /> Back to Order History
      </Link>
      <p className="mt-6 text-sm text-[#B42318]">{error || "Order not found."}</p>
    </PageWrapper>
  );

  const isSample     = order.type === "SAMPLE";
  const productType  = order.quote?.productType?.[0] || "Leather Product";
  const statusLabel  = STATUS_LABELS[order.status] || order.status;
  const statusColor  = STATUS_COLORS[order.status]  || "bg-[#F0EDE8] text-[#6D5A51]";
  const job          = order.jobs?.[0];
  const sampleVideo  = job?.video?.url;
  const hasPaidPayment = order.payments?.some((p) =>
    ["RECEIVED", "HELD_IN_ESCROW", "RELEASED"].includes(p.status)
  );

  return (
    <PageWrapper>
      {/* Back */}
      <Link href="/order-history" className="inline-flex items-center gap-2 text-sm text-[#7B6A62] hover:text-ink mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Order History
      </Link>

      {/* Header */}
      <div className="card p-6 mb-4">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${isSample ? "bg-[#FFF8EA]" : "bg-[#EAF3DE]"}`}>
              {isSample
                ? <FlaskConical className="h-5 w-5 text-gold" />
                : <Package className="h-5 w-5 text-success" />
              }
            </div>
            <div>
              <h1 className="text-lg font-bold text-ink">{productType}</h1>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                <span className="text-xs text-[#7B6A62]">{order.type} ·</span>
                <span className="font-mono text-[10px] font-semibold text-[#C49A3C] bg-[#FFF8EA] border border-[#E8D89A] rounded px-1.5 py-0.5">
                  #{order.ref || order.id.slice(0, 8).toUpperCase()}
                </span>
                {order.quote?.ref && (
                  <span className="font-mono text-[10px] font-semibold text-[#6A5B54] bg-[#F4EFEA] border border-[#E8DED5] rounded px-1.5 py-0.5">
                    [{order.quote.ref}]
                  </span>
                )}
                <span className="text-xs text-[#7B6A62]">· {new Date(order.createdAt).toLocaleDateString("en-NG")}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor}`}>
              {statusLabel}
            </span>
            {hasPaidPayment && (
              <button
                disabled={downloading}
                onClick={async () => {
                  setDownloading(true);
                  try {
                    await downloadInvoicePdf(order.id, `Leddar - ${order.invoice?.ref || `INV-${order.id.slice(0, 8).toUpperCase()}`}.pdf`);
                  } catch { alert("Could not download invoice."); }
                  finally { setDownloading(false); }
                }}
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#E6D7CB] bg-white px-3 py-1.5 text-xs font-medium text-ink hover:bg-[#FFF8EF] transition-colors disabled:opacity-60"
              >
                {downloading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
                Invoice
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {/* Left col */}
        <div className="lg:col-span-2 space-y-4">

          {/* Product details */}
          <div className="card p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-[#A39289] mb-3">Order Details</p>
            <div className="grid gap-3 sm:grid-cols-2 text-sm">
              <div>
                <p className="text-xs text-[#9B8A82] uppercase tracking-wide">Product</p>
                <p className="mt-0.5 font-semibold text-ink">{order.quote?.productType?.join(", ") || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-[#9B8A82] uppercase tracking-wide">Quantity</p>
                <p className="mt-0.5 font-semibold text-ink">{order.quote?.quantity || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-[#9B8A82] uppercase tracking-wide">Total Amount</p>
                <p className="mt-0.5 font-semibold text-ink">{order.totalAmount ? formatNaira(order.totalAmount) : "—"}</p>
              </div>
              <div>
                <p className="text-xs text-[#9B8A82] uppercase tracking-wide">Type</p>
                <p className="mt-0.5 font-semibold text-ink capitalize">{order.type?.toLowerCase()}</p>
              </div>
            </div>
            {order.quote?.brandProvides?.some((i) => i !== "I don't need any of these") && (
              <div className="mt-3 pt-3 border-t border-[#F0E9E2]">
                <p className="text-xs text-[#9B8A82] uppercase tracking-wide mb-1.5">Branding Requested</p>
                <BrandingBadges items={order.quote.brandProvides} />
              </div>
            )}
          </div>

          {/* Sample video — only visible after sample is approved */}
          {sampleVideo && ["SAMPLE_APPROVED", "BALANCE_PAID", "IN_PRODUCTION", "SHIPPED", "DELIVERED"].includes(order.status) && (
            <div className="card p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-[#A39289] mb-3 flex items-center gap-2">
                <Video className="h-3.5 w-3.5" /> Approved Sample Video
              </p>
              <video
                src={sampleVideo}
                controls
                controlsList="nodownload"
                className="w-full rounded-xl bg-black max-h-64"
                onError={(e) => { e.target.style.display = "none"; }}
              />
            </div>
          )}

          {/* Status timeline */}
          {order.statusLogs?.length > 0 && (
            <div className="card p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-[#A39289] mb-4">Status Timeline</p>
              <ol className="relative border-l border-[#E8DED5] space-y-4 ml-2">
                {order.statusLogs.map((log, i) => (
                  <li key={log.id || i} className="ml-4">
                    <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-white bg-[#C49A3C]" />
                    <p className="text-xs font-semibold text-ink">
                      {STATUS_LABELS[log.status] || log.status}
                    </p>
                    {log.note && <p className="text-xs text-[#7B6A62] mt-0.5">{log.note}</p>}
                    <p className="text-[10px] text-[#A39289] mt-0.5">
                      {new Date(log.createdAt).toLocaleString("en-NG")}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>

        {/* Right col */}
        <div className="space-y-4">
          {/* Payment summary */}
          <div className="card p-5">
            <p className="text-xs font-bold uppercase tracking-widest text-[#A39289] mb-3">Payments</p>
            {order.payments?.length > 0 ? (
              <div className="space-y-2">
                {order.payments.map((p) => (
                  <div key={p.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium text-ink">{PAYMENT_STAGE_LABELS[p.stage] || p.stage}</p>
                      <p className="text-xs text-[#9B8A82]">{new Date(p.createdAt).toLocaleDateString("en-NG")}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-ink">{formatNaira(p.amount)}</p>
                      <span className={`text-[10px] font-semibold ${
                        ["RECEIVED","HELD_IN_ESCROW","RELEASED"].includes(p.status)
                          ? "text-success"
                          : "text-[#B45309]"
                      }`}>
                        {p.status === "HELD_IN_ESCROW" ? "In Escrow"
                          : p.status === "RECEIVED" ? "Confirmed"
                          : p.status === "RELEASED" ? "Released"
                          : p.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[#9B8A82]">No payments yet.</p>
            )}
          </div>

          {/* Job status */}
          {job && (
            <div className="card p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-[#A39289] mb-3">Production Job</p>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#7B6A62]">Type</span>
                  <span className="font-semibold capitalize">{job.type?.toLowerCase()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#7B6A62]">Status</span>
                  <span className="font-semibold capitalize">{job.status?.replace(/_/g, " ").toLowerCase()}</span>
                </div>
                {job.deadline && (
                  <div className="flex justify-between">
                    <span className="text-[#7B6A62]">Deadline</span>
                    <span className="font-semibold">{new Date(job.deadline).toLocaleDateString("en-NG")}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Invoice */}
          {order.invoice && (
            <div className="card p-5">
              <p className="text-xs font-bold uppercase tracking-widest text-[#A39289] mb-3">Invoice</p>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-semibold ${order.invoice.isPaid ? "text-success" : "text-[#B45309]"}`}>
                  {order.invoice.isPaid ? "✓ Paid" : "Pending"}
                </span>
                {hasPaidPayment && (
                  <button
                    onClick={async () => {
                      setDownloading(true);
                      try {
                        await downloadInvoicePdf(order.id, `Leddar - ${order.invoice?.ref || `INV-${order.id.slice(0, 8).toUpperCase()}`}.pdf`);
                      } catch { alert("Could not download invoice."); }
                      finally { setDownloading(false); }
                    }}
                    disabled={downloading}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[#E6D7CB] bg-white px-3 py-1.5 text-xs font-medium text-ink hover:bg-[#FFF8EF] transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" /> Download PDF
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
