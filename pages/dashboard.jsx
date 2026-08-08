// import PageWrapper from "../components/layout/PageWrapper";
// import Link from "next/link";
// import StatCard from "../components/ui/StatCard";
// import Badge from "../components/ui/Badge";
// import Button from "../components/ui/Button";
// import { ArrowRight } from "lucide-react";
// import { useEffect, useState } from "react";
// import { recentActivity, stats } from "../data/mockData";
// import { getKycStatus, getSession } from "../services/authService";

// export default function Dashboard() {
//   const [brandName, setBrandName] = useState("Business");
//   const [kycStatus, setKycStatus] = useState("not_started");
//   const kycVerified = kycStatus === "verified";

//   useEffect(() => {
//     const session = getSession();
//     if (session?.businessName) {
//       setBrandName(session.businessName);
//     }
//     setKycStatus(getKycStatus());
//   }, []);

//   return (
//     <PageWrapper>
//       <section className="overflow-hidden rounded-2xl border border-[#E8DED5] bg-white shadow-card">
//         <div className="bg-atmosphere p-5 sm:p-6 md:p-7">
//           <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-end">
//             <div>
//               <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8A7A72]">
//                 Dashboard Overview
//               </p>
//               <h1 className="mt-2 text-2xl font-semibold text-ink md:text-3xl">
//                 Welcome back, {brandName}.
//               </h1>
//               <p className="mt-2 text-sm text-[#5A4A44] md:text-base">
//                 {kycVerified
//                   ? "Ready for your next run? Submit a new order in seconds."
//                   : "Place a new order now to move from concept to production faster."}
//               </p>
//             </div>

//             <div className="rounded-xl border border-[#E8DED5] bg-white/80 p-4 sm:p-5">
//               <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8A7A72]">
//                 {kycVerified ? "Primary Action" : "Recommended Next Step"}
//               </p>
//               <Link
//                 href="/new-order"
//                 className="mt-3 inline-flex w-full sm:w-auto"
//               >
//                 <Button
//                   variant="accent"
//                   className="inline-flex w-full items-center justify-center gap-2 px-5 py-3 sm:w-auto"
//                 >
//                   <span>{kycVerified ? "New Order" : "Create New Order"}</span>
//                   <ArrowRight className="h-4 w-4" />
//                 </Button>
//               </Link>
//             </div>
//           </div>
//         </div>
//       </section>

//       <section className="mt-6 grid gap-4 md:grid-cols-3">
//         {stats.map((item) => (
//           <StatCard key={item.label} label={item.label} value={item.value} />
//         ))}
//       </section>

//       <section className="card mt-6 overflow-x-auto p-5">
//         <h2 className="text-lg font-semibold text-ink">Recent Activity</h2>
//         <table className="mt-4 min-w-full">
//           <thead>
//             <tr className="border-b border-[#EEE4DB] text-left text-xs uppercase tracking-wide text-[#7F7068]">
//               <th className="px-3 py-2">Date</th>
//               <th className="px-3 py-2">Type</th>
//               <th className="px-3 py-2">Description</th>
//               <th className="px-3 py-2">Status</th>
//             </tr>
//           </thead>
//           <tbody>
//             {recentActivity.map((activity) => (
//               <tr
//                 key={`${activity.date}-${activity.type}`}
//                 className="border-b border-[#F0E8E0]"
//               >
//                 <td className="px-3 py-3 text-sm">{activity.date}</td>
//                 <td className="px-3 py-3 text-sm">{activity.type}</td>
//                 <td className="px-3 py-3 text-sm">{activity.description}</td>
//                 <td className="px-3 py-3 text-sm">
//                   <Badge status={activity.status} />
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </section>
//     </PageWrapper>
//   );
// }

// pages/dashboard.jsx — Brand app (real API)
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight, Package, FlaskConical, FileText,
  TrendingUp, Clock, CheckCircle2, AlertCircle,
} from "lucide-react";
import PageWrapper from "../components/layout/PageWrapper";
import StatCard from "../components/ui/StatCard";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Spinner from "../components/ui/Spinner";
import { getSession, getKycStatus } from "../services/authService";
import { getBrandOrders, getBrandQuotes } from "../services/paymentService";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.myleddar.com/api/v1";

function authHeaders() {
  const session = getSession();
  return { Authorization: `Bearer ${session?.token}` };
}

const STATUS_LABELS = {
  SUBMITTED: "Submitted", FLAT_FEE_PAID: "Fee Paid",
  SAMPLE_IN_PROGRESS: "In Progress", SAMPLE_COMPLETED: "Sample Ready",
  SAMPLE_APPROVED: "Sample Approved", BALANCE_PAID: "Balance Paid",
  IN_PRODUCTION: "In Production", SHIPPED: "Shipped", DELIVERED: "Delivered",
};

const ACTIVITY_ICON = {
  SAMPLE:     <FlaskConical className="h-4 w-4 text-gold" />,
  PRODUCTION: <Package className="h-4 w-4 text-success" />,
  QUOTE:      <FileText className="h-4 w-4 text-[#8B6A39]" />,
};

export default function Dashboard() {
  const session = getSession();
  const [brandName, setBrandName]   = useState(session?.businessName || "Business");
  const [kycStatus, setKycStatus]   = useState("loading");
  const [orders, setOrders]         = useState({ sample: [], production: [] });
  const [quotes, setQuotes]         = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    // Load KYC status
    getKycStatus().then((p) => setKycStatus(p?.status || "not_started")).catch(() => setKycStatus("not_started"));

    // Load real data in parallel
    Promise.allSettled([
      getBrandOrders(),
      getBrandQuotes(),
      axios.get(`${API_URL}/brands/dashboard/summary`, { headers: authHeaders() }),
    ]).then(([ordersRes, quotesRes, summaryRes]) => {
      if (ordersRes.status === "fulfilled") setOrders(ordersRes.value || { sample: [], production: [] });
      if (quotesRes.status === "fulfilled") setQuotes(quotesRes.value || []);
      if (summaryRes.status === "fulfilled" && summaryRes.value?.data?.data?.businessName) {
        setBrandName(summaryRes.value.data.data.businessName);
      }
    }).finally(() => setLoading(false));
  }, []);

  const kycVerified    = kycStatus === "verified";
  const allOrders      = [...(orders.sample || []), ...(orders.production || [])];
  const activeOrders   = allOrders.filter((o) => !["DELIVERED"].includes(o.status));
  const pendingQuotes  = quotes.filter((q) => q.status === "SUBMITTED" || q.status === "UNDER_REVIEW");
  const totalOrders    = allOrders.length;

  // Recent activity derived from real orders + quotes
  const recentActivity = [
    ...allOrders.slice(0, 3).map((o) => ({
      id: o.id,
      date: new Date(o.createdAt).toLocaleDateString("en-NG"),
      type: o.type,
      description: `${o.type === "SAMPLE" ? "Sample" : "Production"} order — ${o.quote?.productType?.[0] || "Leather Product"}`,
      status: STATUS_LABELS[o.status] || o.status,
    })),
    ...quotes.slice(0, 2).map((q) => ({
      id: q.id,
      date: new Date(q.createdAt).toLocaleDateString("en-NG"),
      type: "QUOTE",
      description: `Quote request — ${q.productType?.[0] || "Leather Product"} (Qty: ${q.quantity})`,
      status: q.status.replace("_", " "),
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5);

  return (
    <PageWrapper>
      {/* Hero welcome */}
      <section className="overflow-hidden rounded-2xl border border-[#E8DED5] bg-white shadow-card">
        <div className="bg-atmosphere p-5 sm:p-6 md:p-7">
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8A7A72]">
                Dashboard Overview
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-ink md:text-3xl">
                Welcome back, {brandName}.
              </h1>
              <p className="mt-2 text-sm text-[#5A4A44] md:text-base">
                {kycVerified
                  ? "Ready for your next run? Submit a new order in seconds."
                  : "Verify your identity to unlock payments and start ordering."}
              </p>

              {/* KYC nudge */}
              {!kycVerified && kycStatus !== "loading" ? (
                <Link href="/kyc" className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[#E6D7CB] bg-white px-4 py-2.5 text-xs font-semibold text-[#8B6A39] hover:bg-[#FFF8EF] transition-colors">
                  <AlertCircle className="h-4 w-4" />
                  Complete KYC to unlock payments
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              ) : null}
            </div>

            <div className="rounded-xl border border-[#E8DED5] bg-white/80 p-4 sm:p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8A7A72]">
                {kycVerified ? "Primary Action" : "Recommended Next Step"}
              </p>
              <Link href="/new-order" className="mt-3 inline-flex w-full sm:w-auto">
                <Button variant="accent" className="inline-flex w-full items-center justify-center gap-2 px-5 py-3 sm:w-auto">
                  <span>New Order</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              {pendingQuotes.length > 0 ? (
                <Link href="/order-status" className="mt-2 flex items-center gap-1.5 text-xs text-[#8B6A39] font-medium hover:underline">
                  <Clock className="h-3.5 w-3.5" />
                  {pendingQuotes.length} quote{pendingQuotes.length > 1 ? "s" : ""} awaiting response
                </Link>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <StatCard label="Active Orders"  value={loading ? "—" : String(activeOrders.length)} />
        <StatCard label="Pending Quotes" value={loading ? "—" : String(pendingQuotes.length)} />
        <StatCard label="Total Orders"   value={loading ? "—" : String(totalOrders)} />
      </section>

      {/* Quick actions */}
      <section className="mt-6 grid gap-3 sm:grid-cols-3">
        {[
          { href: "/sample-requests", icon: FlaskConical, label: "Sample Request",    sub: "Pay flat fee & track sample" },
          { href: "/order-tracker",   icon: Package,       label: "Order Tracker",     sub: "Track production pipeline" },
          { href: "/invoices",        icon: FileText,      label: "Invoices",          sub: "Download & view payments" },
        ].map((item) => (
          <Link key={item.href} href={item.href}>
            <div className="flex items-center gap-3 rounded-xl border border-[#E6D7CB] bg-white p-4 hover:bg-[#FFF8EF] hover:border-[#C49A3C55] transition-all cursor-pointer group">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FFF8EA] group-hover:bg-gold/10 transition-colors">
                <item.icon className="h-5 w-5 text-gold" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-ink">{item.label}</p>
                <p className="text-xs text-[#7B6A62] truncate">{item.sub}</p>
              </div>
              <ArrowRight className="ml-auto h-4 w-4 text-[#DCCFBE] group-hover:text-gold transition-colors shrink-0" />
            </div>
          </Link>
        ))}
      </section>

      {/* Recent activity */}
      <section className="card mt-6 p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-ink">Recent Activity</h2>
          <Link href="/order-history" className="text-xs font-medium text-[#8B6A39] hover:underline">
            View all
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-8"><Spinner size="md" className="text-gold" /></div>
        ) : recentActivity.length === 0 ? (
          <div className="py-8 text-center text-sm text-[#7B6A62]">
            No activity yet. <Link href="/new-order" className="font-medium text-[#8B6A39] underline">Create your first order</Link>.
          </div>
        ) : (
          <div className="space-y-0 divide-y divide-[#F0E8E0]">
            {recentActivity.map((a) => (
              <div key={a.id} className="flex items-center gap-3 py-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#FAF4E7]">
                  {ACTIVITY_ICON[a.type] || <TrendingUp className="h-4 w-4 text-[#8B6A39]" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-ink">{a.description}</p>
                  <p className="text-xs text-[#9B8A82]">{a.date}</p>
                </div>
                <Badge status={a.status} />
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Pending quote action banner */}
      {!loading && pendingQuotes.some((q) => q.price) ? (
        <section className="mt-4 rounded-xl border border-[#C49A3C55] bg-[#FFF8EA] p-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-ink">Quote Ready for Payment</p>
              <p className="mt-0.5 text-xs text-[#5A4A44]">
                {pendingQuotes.filter((q) => q.price).length} production quote{pendingQuotes.filter((q) => q.price).length > 1 ? "s are" : " is"} ready. Review pricing and approve for payment.
              </p>
            </div>
            <Link href="/order-status">
              <Button variant="accent" className="shrink-0 text-sm">
                Review Quote
              </Button>
            </Link>
          </div>
        </section>
      ) : null}
    </PageWrapper>
  );
}
