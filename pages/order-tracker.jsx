// import PageWrapper from "../components/layout/PageWrapper";
// import OrderTrackerCard from "../components/brand/OrderTrackerCard";

// const steps = ["Quote Approved", "In Production", "Shipped", "Delivered"];

// export default function OrderTrackerPage() {
//   return (
//     <PageWrapper>
//       <h1 className="page-title">Order Tracker</h1>
//       <div className="card mt-6 p-5">
//         <div className="flex flex-wrap items-center gap-4 md:gap-8">
//           {steps.map((step, index) => {
//             const active = step === "In Production";
//             return (
//               <div key={step} className="flex items-center gap-3">
//                 <span
//                   className={`relative h-3 w-3 rounded-full ${active ? "bg-gold" : "bg-[#DCCFBE]"}`}
//                 >
//                   {active ? (
//                     <span className="absolute -inset-1 animate-ping rounded-full bg-[#C49A3C99]" />
//                   ) : null}
//                 </span>
//                 <span
//                   className={`text-sm font-medium ${active ? "text-gold" : "text-[#6A5B54]"}`}
//                 >
//                   {step}
//                 </span>
//                 {index < steps.length - 1 ? (
//                   <span className="hidden h-[2px] w-10 bg-[#DCCFBE] md:block" />
//                 ) : null}
//               </div>
//             );
//           })}
//         </div>
//       </div>
//       <div className="mt-6">
//         <OrderTrackerCard />
//       </div>
//     </PageWrapper>
//   );
// }

// pages/order-tracker.jsx — Brand app
// Visual pipeline: Quote Approved → In Production → Shipped → Delivered
import { useEffect, useState } from "react";
import { CheckCircle2, Circle, Package } from "lucide-react";
import PageWrapper from "../components/layout/PageWrapper";
import Spinner from "../components/ui/Spinner";
import { getBrandOrders } from "../services/paymentService";
import { formatNaira } from "../utils/pricing";

const PRODUCTION_STEPS = [
  { key: "BALANCE_PAID",   label: "Quote Approved",  note: "Production payment confirmed." },
  { key: "IN_PRODUCTION",  label: "In Production",   note: "Artisan is working on your order." },
  { key: "SHIPPED",        label: "Shipped",          note: "Your order is on the way." },
  { key: "DELIVERED",      label: "Delivered",        note: "Order delivered successfully." },
];

const STATUS_ORDER = ["BALANCE_PAID", "IN_PRODUCTION", "SHIPPED", "DELIVERED"];

function getActiveStep(status) {
  const idx = STATUS_ORDER.indexOf(status);
  return idx >= 0 ? idx : 0;
}

function OrderTrackerCard({ order }) {
  const activeStep = getActiveStep(order.status);
  const productType = order.quote?.productType?.[0] || "Leather Product";

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-ink">{productType}</p>
          <p className="mt-0.5 text-xs text-[#7B6A62]">
            {new Date(order.createdAt).toLocaleDateString("en-NG")} · {formatNaira(order.totalAmount)}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-[#FFF8EA] px-2.5 py-1 text-[11px] font-semibold text-gold">
          {PRODUCTION_STEPS[activeStep]?.label || order.status}
        </span>
      </div>

      {/* Step pipeline */}
      <div className="mt-5 flex items-start gap-0">
        {PRODUCTION_STEPS.map((step, index) => {
          const completed = index < activeStep;
          const active    = index === activeStep;
          const isLast    = index === PRODUCTION_STEPS.length - 1;

          return (
            <div key={step.key} className="flex flex-1 flex-col items-center">
              <div className="flex w-full items-center">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  completed ? "border-success bg-success"
                  : active   ? "border-gold bg-gold"
                  : "border-[#DCCFBE] bg-white"
                }`}>
                  {completed
                    ? <CheckCircle2 className="h-4 w-4 text-white" />
                    : <Circle className={`h-3 w-3 ${active ? "text-espresso" : "text-[#DCCFBE]"}`} />
                  }
                </div>
                {!isLast && (
                  <div className={`h-0.5 flex-1 ${completed ? "bg-success" : "bg-[#E8DED5]"}`} />
                )}
              </div>
              <p className={`mt-2 text-center text-[11px] font-semibold ${active ? "text-gold" : completed ? "text-success" : "text-[#9B8A82]"}`}>
                {step.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Current step note */}
      <p className="mt-3 text-center text-xs text-[#5A4A44]">
        {PRODUCTION_STEPS[activeStep]?.note}
      </p>
    </div>
  );
}

export default function OrderTrackerPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getBrandOrders()
      .then((data) => {
        // Only show production orders that are past SAMPLE stage
        const trackable = (data.production || []).filter((o) =>
          STATUS_ORDER.includes(o.status),
        );
        setOrders(trackable);
      })
      .catch((err) => setError(err.message || "Failed to load orders."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageWrapper>
      <h1 className="page-title">Order Tracker</h1>
      <p className="page-subtitle mt-1">Track your active production orders.</p>

      {loading ? (
        <div className="mt-10 flex justify-center"><Spinner size="lg" className="text-gold" /></div>
      ) : error ? (
        <p className="mt-6 text-sm text-[#B42318]">{error}</p>
      ) : orders.length === 0 ? (
        <div className="mt-10 rounded-xl border border-[#E8DED5] bg-white p-10 text-center">
          <Package className="mx-auto h-10 w-10 text-[#DCCFBE]" />
          <p className="mt-3 text-sm font-semibold text-ink">No active production orders</p>
          <p className="mt-1 text-xs text-[#7B6A62]">
            Orders will appear here once your production payment is confirmed.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {orders.map((order) => <OrderTrackerCard key={order.id} order={order} />)}
        </div>
      )}
    </PageWrapper>
  );
}
