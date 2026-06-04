// import { useMemo, useState } from "react";
// import PageWrapper from "../components/layout/PageWrapper";
// import Badge from "../components/ui/Badge";
// import Button from "../components/ui/Button";
// import { orderHistory } from "../data/mockData";

// const tabs = ["All Orders", "Sample Orders", "Production Orders"];

// export default function OrderHistoryPage() {
//   const [activeTab, setActiveTab] = useState("All Orders");

//   const rows = useMemo(() => {
//     if (activeTab === "Sample Orders") {
//       return orderHistory.filter((item) => item.type === "Sample");
//     }
//     if (activeTab === "Production Orders") {
//       return orderHistory.filter((item) => item.type === "Production");
//     }
//     return orderHistory;
//   }, [activeTab]);

//   return (
//     <PageWrapper>
//       <h1 className="page-title">Order History</h1>

//       <div className="mt-6 flex flex-wrap gap-2">
//         {tabs.map((tab) => (
//           <button
//             key={tab}
//             onClick={() => setActiveTab(tab)}
//             className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
//               activeTab === tab
//                 ? "bg-gold text-espresso"
//                 : "border border-[#D8CCC2] bg-white text-[#5A4A44]"
//             }`}
//           >
//             {tab}
//           </button>
//         ))}
//       </div>

//       <div className="card mt-5 overflow-x-auto p-4">
//         <table className="min-w-full">
//           <thead>
//             <tr className="border-b border-[#EEE4DB] text-left text-xs uppercase tracking-wide text-[#7F7068]">
//               <th className="px-3 py-3">Order ID</th>
//               <th className="px-3 py-3">Type</th>
//               <th className="px-3 py-3">Product</th>
//               <th className="px-3 py-3">Date</th>
//               <th className="px-3 py-3">Status</th>
//               <th className="px-3 py-3">Action</th>
//             </tr>
//           </thead>
//           <tbody>
//             {rows.map((row) => (
//               <tr key={row.id} className="border-b border-[#EEE4DB]">
//                 <td className="px-3 py-3 text-sm">{row.id}</td>
//                 <td className="px-3 py-3 text-sm">{row.type}</td>
//                 <td className="px-3 py-3 text-sm">{row.product}</td>
//                 <td className="px-3 py-3 text-sm">{row.date}</td>
//                 <td className="px-3 py-3 text-sm">
//                   <Badge status={row.status} />
//                 </td>
//                 <td className="px-3 py-3 text-sm">
//                   <Button variant="outline" className="px-3 py-2 text-xs">
//                     View Details
//                   </Button>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       </div>
//     </PageWrapper>
//   );
// }

// pages/order-history.jsx — Brand app
import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, Package, FlaskConical } from "lucide-react";
import PageWrapper from "../components/layout/PageWrapper";
import Spinner from "../components/ui/Spinner";
import { getBrandOrders } from "../services/paymentService";
import { formatNaira } from "../utils/pricing";

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
  SAMPLE_IN_PROGRESS: "In Progress",
  SAMPLE_COMPLETED:   "Sample Ready",
  SAMPLE_APPROVED:    "Sample Approved",
  BALANCE_PAID:       "Balance Paid",
  IN_PRODUCTION:      "In Production",
  SHIPPED:            "Shipped",
  DELIVERED:          "Delivered",
};

function OrderCard({ order }) {
  const productType = order.quote?.productType?.[0] || "Leather Product";
  const isSample = order.type === "SAMPLE";

  return (
    <Link href={`/order-history/${order.id}`}>
      <div className="flex items-center justify-between gap-4 rounded-xl border border-[#E6D7CB] bg-white p-4 hover:bg-[#FFF8EF] transition-colors cursor-pointer">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${isSample ? "bg-[#FFF8EA]" : "bg-[#EAF3DE]"}`}>
            {isSample
              ? <FlaskConical className="h-4 w-4 text-gold" />
              : <Package className="h-4 w-4 text-success" />
            }
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink">{productType}</p>
            <p className="mt-0.5 text-xs text-[#7B6A62]">
              {order.type} · {new Date(order.createdAt).toLocaleDateString("en-NG")}
            </p>
            {order.totalAmount ? (
              <p className="mt-0.5 text-xs font-medium text-[#5A4A44]">{formatNaira(order.totalAmount)}</p>
            ) : null}
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${STATUS_COLORS[order.status] || "bg-[#F0EDE8] text-[#6D5A51]"}`}>
            {STATUS_LABELS[order.status] || order.status}
          </span>
          <ChevronRight className="h-4 w-4 text-[#9B8A82]" />
        </div>
      </div>
    </Link>
  );
}

export default function OrderHistoryPage() {
  const [orders, setOrders] = useState({ sample: [], production: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("all"); // all | sample | production

  useEffect(() => {
    getBrandOrders()
      .then(setOrders)
      .catch((err) => setError(err.message || "Failed to load orders."))
      .finally(() => setLoading(false));
  }, []);

  const sampleOrders     = orders.sample     || [];
  const productionOrders = orders.production || [];
  const allOrders        = [...sampleOrders, ...productionOrders].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );

  const displayed = tab === "sample" ? sampleOrders : tab === "production" ? productionOrders : allOrders;

  return (
    <PageWrapper>
      <h1 className="page-title">Order History</h1>
      <p className="page-subtitle mt-1">All your past and active orders.</p>

      {/* Tabs */}
      <div className="mt-5 flex gap-2">
        {["all", "sample", "production"].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition-colors ${
              tab === t
                ? "bg-gold text-espresso"
                : "bg-white border border-[#E6D7CB] text-[#7B6A62] hover:bg-[#FFF8EF]"
            }`}
          >
            {t}
            <span className="ml-1.5 opacity-60">
              ({t === "all" ? allOrders.length : t === "sample" ? sampleOrders.length : productionOrders.length})
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-10 flex justify-center">
          <Spinner size="lg" className="text-gold" />
        </div>
      ) : error ? (
        <p className="mt-6 text-sm text-[#B42318]">{error}</p>
      ) : displayed.length === 0 ? (
        <div className="mt-8 rounded-xl border border-[#E8DED5] bg-white p-8 text-center text-sm text-[#7B6A62]">
          No {tab === "all" ? "" : tab} orders yet.
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {displayed.map((order) => <OrderCard key={order.id} order={order} />)}
        </div>
      )}
    </PageWrapper>
  );
}
