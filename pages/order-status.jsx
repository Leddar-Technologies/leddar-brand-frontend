// import Link from "next/link";
// import { useRouter } from "next/router";
// import { useEffect, useState } from "react";
// import { CreditCard, ShieldCheck } from "lucide-react";
// import PageWrapper from "../components/layout/PageWrapper";
// import Badge from "../components/ui/Badge";
// import Button from "../components/ui/Button";
// import Modal from "../components/ui/Modal";
// import Spinner from "../components/ui/Spinner";
// import {
//   getOrderStatus,
//   listPricingRequests,
//   initializeQuoteBalancePayment,
//   rejectQuoteRequest,
// } from "../services/prototypeService";
// import { getKycStatus } from "../services/authService";
// import { formatNaira, formatVatPercent } from "../utils/pricing";

// const PENDING_QUOTE_REQUEST_KEY = "leddar_pending_quote_request_id";

// export default function OrderStatus() {
//   const router = useRouter();
//   const [requestId, setRequestId] = useState("");

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [quoteResponse, setQuoteResponse] = useState(null);
//   const [quoteHistory, setQuoteHistory] = useState([]);
//   const [approveModalOpen, setApproveModalOpen] = useState(false);
//   const [rejectModalOpen, setRejectModalOpen] = useState(false);
//   const [balancePaymentDetails, setBalancePaymentDetails] = useState(null);
//   const [approveLoading, setApproveLoading] = useState(false);
//   const [rejectSubmitting, setRejectSubmitting] = useState(false);
//   const [rejectReason, setRejectReason] = useState("");

//   useEffect(() => {
//     if (!router.isReady) {
//       return;
//     }

//     if (typeof router.query.requestId === "string" && router.query.requestId) {
//       setRequestId(router.query.requestId);
//       return;
//     }

//     if (typeof window !== "undefined") {
//       const storedRequestId = window.localStorage.getItem(
//         PENDING_QUOTE_REQUEST_KEY,
//       );
//       if (storedRequestId) {
//         setRequestId(storedRequestId);
//       }
//     }
//   }, [router.isReady, router.query.requestId]);

//   useEffect(() => {
//     let active = true;

//     const fetchHistory = async () => {
//       try {
//         const history = await listPricingRequests();
//         if (active) {
//           setQuoteHistory(history);
//         }
//       } catch {
//         // Keep existing history if request fails.
//       }
//     };

//     fetchHistory();
//     const interval = setInterval(fetchHistory, 6000);

//     return () => {
//       active = false;
//       clearInterval(interval);
//     };
//   }, []);

//   const historySection = (
//     <div className="card mt-6 max-w-2xl p-6">
//       <h2 className="text-lg font-semibold text-ink">Quote History</h2>
//       <p className="mt-1 text-sm text-[#5A4A44]">
//         View all pricing requests and their current status.
//       </p>

//       {quoteHistory.length === 0 ? (
//         <p className="mt-4 text-sm text-[#7B6A62]">No new orders yet.</p>
//       ) : (
//         <div className="mt-4 space-y-3">
//           {quoteHistory.map((item) => (
//             <div
//               key={item.id}
//               className="rounded-lg border border-[#E9DFD6] bg-white p-3"
//             >
//               <div className="flex flex-wrap items-center justify-between gap-2">
//                 <p className="text-sm font-semibold text-ink">{item.id}</p>
//                 <Badge
//                   status={
//                     item.status === "pricing_ready"
//                       ? "Ready"
//                       : item.status === "rejected"
//                         ? "Rejected"
//                         : "Pending"
//                   }
//                 />
//               </div>
//               <p className="mt-1 text-xs text-[#7B6A62]">
//                 {item.productType} • Qty {item.quantity}
//               </p>
//               <div className="mt-2">
//                 <Link
//                   href={`/quote-response?requestId=${item.id}`}
//                   className="inline-flex"
//                 >
//                   <Button variant="outline" className="px-3 py-2 text-xs">
//                     Open Response
//                   </Button>
//                 </Link>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}
//     </div>
//   );

//   async function handleOpenApproveModal() {
//     if (!requestId) {
//       return;
//     }

//     if (getKycStatus() !== "verified") {
//       const fallbackReturnUrl = requestId
//         ? `/order-status?requestId=${requestId}`
//         : "/order-status";
//       router.push(`/kyc?returnUrl=${encodeURIComponent(fallbackReturnUrl)}`);
//       return;
//     }

//     setApproveLoading(true);
//     setError("");

//     try {
//       const details = await initializeQuoteBalancePayment(requestId);
//       setBalancePaymentDetails(details);
//       setApproveModalOpen(true);
//     } catch (approveError) {
//       setError(approveError.message || "Unable to initialize balance payment.");
//     } finally {
//       setApproveLoading(false);
//     }
//   }

//   async function handleConfirmApprovePayment() {
//     if (!balancePaymentDetails?.authorizationUrl) {
//       setError("Balance payment details are unavailable.");
//       return;
//     }

//     window.open(
//       balancePaymentDetails.authorizationUrl,
//       "_blank",
//       "noopener,noreferrer",
//     );
//     setApproveModalOpen(false);
//   }

//   async function handleRejectQuote() {
//     if (!requestId) {
//       return;
//     }

//     setRejectSubmitting(true);
//     setError("");

//     try {
//       const result = await rejectQuoteRequest(requestId, rejectReason);
//       setQuoteResponse((current) => ({
//         ...(current || {}),
//         id: result.id,
//         status: result.status,
//         rejectionReason: result.rejectionReason,
//       }));
//       setRejectModalOpen(false);
//       setRejectReason("");
//     } catch (rejectError) {
//       setError(rejectError.message || "Unable to submit rejection reason.");
//     } finally {
//       setRejectSubmitting(false);
//     }
//   }

//   useEffect(() => {
//     if (!requestId) {
//       setQuoteResponse(null);
//       return;
//     }

//     let active = true;

//     const fetchQuote = async () => {
//       if (!active) {
//         return;
//       }

//       setLoading(true);
//       setError("");

//       try {
//         const response = await getOrderStatus(requestId);
//         if (active) {
//           if (
//             typeof window !== "undefined" &&
//             (response?.status === "pricing_ready" ||
//               response?.status === "not_found")
//           ) {
//             window.localStorage.removeItem(PENDING_QUOTE_REQUEST_KEY);
//           }
//           setQuoteResponse(response);
//         }
//       } catch (fetchError) {
//         if (active) {
//           setError(fetchError.message || "Unable to load quote response.");
//         }
//       } finally {
//         if (active) {
//           setLoading(false);
//         }
//       }
//     };

//     fetchQuote();
//     const interval = setInterval(fetchQuote, 5000);

//     return () => {
//       active = false;
//       clearInterval(interval);
//     };
//   }, [requestId]);

//   if (!requestId) {
//     return (
//       <PageWrapper>
//         <div className="card max-w-2xl p-6">
//           <div className="mb-4 flex items-center justify-between">
//             <h1 className="page-title">Quote Response</h1>
//             <Badge status="Pending" />
//           </div>
//           <p className="text-sm text-[#5A4A44]">
//             No pricing request selected yet. Submit a new order to receive a
//             response from admin.
//           </p>
//           <div className="mt-6">
//             <Link href="/new-order" className="inline-flex">
//               <Button variant="accent">Go to New Order</Button>
//             </Link>
//           </div>
//         </div>
//         {historySection}
//       </PageWrapper>
//     );
//   }

//   if (loading && !quoteResponse) {
//     return (
//       <PageWrapper>
//         <div className="card max-w-2xl p-6">
//           <div className="flex items-center gap-3 text-sm text-[#5A4A44]">
//             <Spinner className="text-gold" />
//             <span>Loading quote response...</span>
//           </div>
//         </div>
//         {historySection}
//       </PageWrapper>
//     );
//   }

//   if (error) {
//     return (
//       <PageWrapper>
//         <div className="card max-w-2xl p-6">
//           <div className="mb-4 flex items-center justify-between">
//             <h1 className="page-title">Quote Response</h1>
//             <Badge status="Pending" />
//           </div>
//           <p className="text-sm text-[#B42318]">{error}</p>
//           <div className="mt-6">
//             <Button variant="outline" onClick={() => router.reload()}>
//               Retry
//             </Button>
//           </div>
//         </div>
//         {historySection}
//       </PageWrapper>
//     );
//   }

//   if (!quoteResponse || quoteResponse.status !== "pricing_ready") {
//     if (quoteResponse?.status === "rejected") {
//       return (
//         <PageWrapper>
//           <div className="card max-w-2xl p-6">
//             <div className="mb-4 flex items-center justify-between">
//               <h1 className="page-title">Quote Response</h1>
//               <Badge status="Rejected" />
//             </div>

//             <div className="rounded-xl border border-[#F1C1C1] bg-[#FFF3F3] p-4 text-sm text-[#5A4A44]">
//               <p className="font-semibold text-ink">Quote was rejected</p>
//               <p className="mt-2">The brand has rejected this new order.</p>
//               {quoteResponse.rejectionReason ? (
//                 <p className="mt-3 rounded-lg border border-[#E8B5B5] bg-white p-3 text-sm text-[#5A4A44]">
//                   <span className="font-semibold text-ink">Reason:</span>{" "}
//                   {quoteResponse.rejectionReason}
//                 </p>
//               ) : null}
//             </div>
//           </div>
//           {historySection}
//         </PageWrapper>
//       );
//     }

//     return (
//       <PageWrapper>
//         <div className="card max-w-2xl p-6">
//           <div className="mb-4 flex items-center justify-between">
//             <h1 className="page-title">Quote Response</h1>
//             <Badge status="Pending" />
//           </div>

//           <div className="rounded-xl border border-[#E9DFD6] bg-white p-4 text-sm text-[#5A4A44]">
//             <p className="font-semibold text-ink">
//               Pricing is pending admin input
//             </p>
//             <p className="mt-2">
//               Your request has been received, but the admin has not added
//               pricing yet. This page refreshes automatically every few seconds.
//             </p>
//             <p className="mt-3 inline-flex items-center gap-2 text-xs text-[#7B6A62]">
//               <Spinner size="xs" className="text-gold" />
//               Waiting for quote response...
//             </p>
//           </div>
//         </div>
//         {historySection}
//       </PageWrapper>
//     );
//   }

//   return (
//     <PageWrapper>
//       <div className="card max-w-2xl p-6">
//         <div className="mb-4 flex items-center justify-between">
//           <h1 className="page-title">Quote Response</h1>
//           <Badge status="Ready" />
//         </div>

//         <div className="space-y-3 rounded-xl border border-[#E9DFD6] bg-white p-4">
//           {quoteResponse.breakdown?.map((row) => (
//             <div
//               key={row.item}
//               className="flex items-center justify-between text-sm"
//             >
//               <span className="text-[#5A4A44]">{row.item}</span>
//               <span className="font-semibold text-ink">{row.amount}</span>
//             </div>
//           ))}
//           <div className="mt-2 border-t border-[#EAE1D8] pt-3 text-base font-bold text-ink">
//             <div className="flex items-center justify-between">
//               <span>Total</span>
//               <span>{quoteResponse.total}</span>
//             </div>
//           </div>
//         </div>

//         <div className="mt-6 flex flex-wrap gap-3">
//           <Button
//             variant="accent"
//             onClick={handleOpenApproveModal}
//             disabled={approveLoading}
//           >
//             {approveLoading ? (
//               <span className="inline-flex items-center gap-2">
//                 <Spinner size="sm" className="text-espresso" />
//                 <span>Preparing Payment...</span>
//               </span>
//             ) : (
//               "Approve & Proceed to Payment"
//             )}
//           </Button>
//           <Button
//             variant="dangerOutline"
//             onClick={() => setRejectModalOpen(true)}
//           >
//             Reject Quote
//           </Button>
//         </div>
//       </div>
//       {historySection}

//       <Modal
//         open={approveModalOpen}
//         title="Balance Payment Checkout"
//         onClose={() => setApproveModalOpen(false)}
//       >
//         <div className="mb-5 flex items-center gap-3 rounded-xl border border-[#E6D7CB] bg-[#FFF8EF] px-4 py-3">
//           <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold text-espresso">
//             <CreditCard className="h-5 w-5" />
//           </div>
//           <div className="min-w-0 flex-1">
//             <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8B6A39]">
//               Pay Remaining Balance
//             </p>
//             <p className="truncate text-sm text-[#5A4A44]">
//               Deposit of ₦20,000 has already been deducted from the quote.
//             </p>
//           </div>
//           <span className="inline-flex shrink-0 items-center rounded-full bg-[#2D6A4F14] px-2.5 py-1 text-[11px] font-semibold text-success">
//             <ShieldCheck className="mr-1 h-3.5 w-3.5" />
//             Secure
//           </span>
//         </div>

//         <div className="space-y-4">
//           <div className="rounded-xl border border-[#E6D7CB] bg-white p-4 text-sm text-[#4D3F39]">
//             <div className="flex items-center justify-between">
//               <span className="text-[#5A4A44]">Subtotal</span>
//               <span className="font-semibold text-ink">
//                 {formatNaira(
//                   balancePaymentDetails?.subtotalAmount ||
//                     quoteResponse?.subtotalAmount ||
//                     70000,
//                 )}
//               </span>
//             </div>
//             <div className="mt-2 flex items-center justify-between">
//               <span className="text-[#5A4A44]">VAT ({formatVatPercent()})</span>
//               <span className="font-semibold text-ink">
//                 {formatNaira(
//                   balancePaymentDetails?.vatAmount || quoteResponse?.vatAmount,
//                 )}
//               </span>
//             </div>
//             <div className="mt-2 flex items-center justify-between">
//               <span className="text-[#5A4A44]">Total Quote</span>
//               <span className="font-semibold text-ink">
//                 {formatNaira(
//                   balancePaymentDetails?.totalAmount ||
//                     quoteResponse?.totalAmount ||
//                     75250,
//                 )}
//               </span>
//             </div>
//             <div className="mt-2 flex items-center justify-between">
//               <span className="text-[#5A4A44]">Deposit Applied</span>
//               <span className="font-semibold text-ink">
//                 {formatNaira(
//                   balancePaymentDetails?.depositApplied ||
//                     quoteResponse?.depositAmount ||
//                     20000,
//                 )}
//               </span>
//             </div>
//             <div className="mt-2 border-t border-[#EAE1D8] pt-2 flex items-center justify-between text-base font-bold text-ink">
//               <span>Balance Due</span>
//               <span>
//                 {formatNaira(balancePaymentDetails?.amountDue || 55250)}
//               </span>
//             </div>
//           </div>

//           <div className="flex flex-col gap-3 sm:flex-row">
//             <a
//               href={balancePaymentDetails?.authorizationUrl || "#"}
//               target="_blank"
//               rel="noreferrer"
//               className="inline-flex w-full sm:w-auto"
//             >
//               <Button variant="accent" className="w-full sm:w-auto">
//                 Open Paystack
//               </Button>
//             </a>
//             <Button
//               variant="outline"
//               className="w-full sm:w-auto"
//               onClick={handleConfirmApprovePayment}
//             >
//               Go to Paystack
//             </Button>
//           </div>
//         </div>
//       </Modal>

//       <Modal
//         open={rejectModalOpen}
//         title="Reject Quote"
//         onClose={() => setRejectModalOpen(false)}
//       >
//         <div className="space-y-4">
//           <p className="text-sm text-[#5A4A44]">
//             Tell us why you are rejecting this quote. This helps the admin
//             improve the next revision.
//           </p>
//           <div>
//             <label className="label">Reason for rejection</label>
//             <textarea
//               className="input min-h-28"
//               value={rejectReason}
//               onChange={(event) => setRejectReason(event.target.value)}
//               placeholder="Enter your reason for rejecting this quote"
//             />
//           </div>
//           <div className="flex flex-col gap-3 sm:flex-row">
//             <Button
//               variant="dangerOutline"
//               className="w-full sm:w-auto"
//               onClick={handleRejectQuote}
//               disabled={rejectSubmitting}
//             >
//               {rejectSubmitting ? (
//                 <span className="inline-flex items-center gap-2">
//                   <Spinner size="sm" className="text-[#B42318]" />
//                   <span>Submitting Reason...</span>
//                 </span>
//               ) : (
//                 "Submit Rejection"
//               )}
//             </Button>
//             <Button
//               variant="outline"
//               className="w-full sm:w-auto"
//               onClick={() => setRejectModalOpen(false)}
//             >
//               Cancel
//             </Button>
//           </div>
//         </div>
//       </Modal>
//     </PageWrapper>
//   );
// }

// pages/order-status.jsx — Brand app
// Shows quote response: pricing breakdown + Approve for Payment button
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { CheckCircle2, CreditCard, ShieldCheck, FileText } from "lucide-react";
import PageWrapper from "../components/layout/PageWrapper";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import Spinner from "../components/ui/Spinner";
import { getSession, getKycStatus } from "../services/authService";
import {
  getBrandQuotes,
  initializeProductionPayment,
} from "../services/paymentService";
import { formatNaira } from "../utils/pricing";

const STATUS_BADGE = {
  SUBMITTED:    { label: "Pending Review", cls: "bg-[#F0EDE8] text-[#6D5A51]" },
  UNDER_REVIEW: { label: "Under Review",   cls: "bg-[#FFF3E0] text-[#B45309]" },
  APPROVED:     { label: "Approved",       cls: "bg-[#EAF3DE] text-success" },
  REJECTED:     { label: "Rejected",       cls: "bg-[#FEE2E2] text-[#B42318]" },
};

export default function OrderStatusPage() {
  const router = useRouter();
  const session = getSession();

  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Payment modal
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedQuote, setSelectedQuote] = useState(null);
  const [payEmail, setPayEmail] = useState(session?.email || "");
  const [payLoading, setPayLoading] = useState(false);
  const [payError, setPayError] = useState("");
  const [payDetails, setPayDetails] = useState(null);
  const [payStage, setPayStage] = useState("form"); // form | loading | success
  const [sampleWarningId, setSampleWarningId] = useState(null); // quoteId showing the sample warning

  useEffect(() => {
    getBrandQuotes()
      .then(setQuotes)
      .catch((err) => setError(err.message || "Failed to load quotes."))
      .finally(() => setLoading(false));
  }, []);

  async function handleOpenPayment(quote, sampleApproved) {
    if (!sampleApproved) {
      setSampleWarningId(quote.id);
      return;
    }
    setSampleWarningId(null);
    const kycProfile = await getKycStatus();
    if (kycProfile?.status !== "verified") {
      router.push(`/kyc?returnUrl=${encodeURIComponent(router.asPath)}`);
      return;
    }
    setSelectedQuote(quote);
    setPayModalOpen(true);
  }

  async function handleInitiatePayment(e) {
    e.preventDefault();
    setPayLoading(true);
    setPayError("");
    setPayStage("loading");

    try {
      // Always pass the SAMPLE order ID (PATH A) so the backend can find/create
      // the linked PRODUCTION order. Fall back to quoteId only if no sample order exists.
      const sampleOrder = selectedQuote.orders?.find((o) => o.type === "SAMPLE");
      const orderId = sampleOrder?.id || undefined;
      const quoteId = orderId ? undefined : selectedQuote.id;

      const result = await initializeProductionPayment({ email: payEmail, orderId, quoteId });
      setPayDetails(result);
      setPayStage("success");
    } catch (err) {
      setPayError(err.response?.data?.message || err.message || "Unable to initialize payment.");
      setPayStage("form");
    } finally {
      setPayLoading(false);
    }
  }

  function closeModal() {
    setPayModalOpen(false);
    setPayError("");
    setPayDetails(null);
    setPayStage("form");
    setSelectedQuote(null);
  }

  // Show all quotes — quotes are always for production pricing regardless of type field
  const productionQuotes = quotes;

  return (
    <PageWrapper>
      <h1 className="page-title">Quote Responses</h1>
      <p className="page-subtitle mt-1">View pricing from our team and approve for payment.</p>

      {loading ? (
        <div className="mt-10 flex justify-center"><Spinner size="lg" className="text-gold" /></div>
      ) : error ? (
        <p className="mt-6 text-sm text-[#B42318]">{error}</p>
      ) : productionQuotes.length === 0 ? (
        <div className="mt-10 rounded-xl border border-[#E8DED5] bg-white p-10 text-center">
          <FileText className="mx-auto h-10 w-10 text-[#DCCFBE]" />
          <p className="mt-3 text-sm font-semibold text-ink">No production quotes yet</p>
          <p className="mt-1 text-xs text-[#7B6A62]">Submit a production request from New Order to get a quote.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {productionQuotes.map((quote) => {
            const hasPrice = !!quote.price;
            const badge    = (quote.status === "UNDER_REVIEW" && hasPrice)
              ? { label: "Quote Ready", cls: "bg-[#FFF3E0] text-[#B45309]" }
              : STATUS_BADGE[quote.status] || STATUS_BADGE.SUBMITTED;
            const subtotal     = hasPrice ? quote.price : 0;  // pre-VAT (materials + labour + commission)
            const vatAmount    = Math.round(subtotal * 0.075);
            const total        = subtotal + vatAmount;         // VAT-inclusive amount brand actually pays
            const sampleOrder      = quote.orders?.find((o) => o.type === "SAMPLE");
            const productionOrder  = quote.orders?.find((o) => o.type === "PRODUCTION");
            const sampleCredit     = sampleOrder?.flatFeePaid ?? 0;
            // Pay Now unlocks when brand has approved the sample (brand approval = SAMPLE_APPROVED, Leddar confirmation = SAMPLE_COMPLETED)
            const sampleApproved   = ["SAMPLE_APPROVED", "SAMPLE_COMPLETED"].includes(sampleOrder?.status);
            const sampleVideoUrl   = sampleOrder?.jobs?.[0]?.video?.url || null;
            const balanceDue       = Math.max(0, total - sampleCredit);
            // isPaid: production payment confirmed by Paystack.
            // quote.status === "APPROVED" is the ONLY reliable signal — set exclusively by the webhook.
            // Do NOT use productionOrder.status === "IN_PRODUCTION": that status can be set
            // before payment (e.g. when admin marks sample complete). Only downstream statuses
            // that are unreachable without payment are safe to include.
            const isPaid = quote.status === "APPROVED"
              || productionOrder?.status === "PENDING_DELIVERY"
              || productionOrder?.status === "SHIPPED"
              || productionOrder?.status === "DELIVERED";

            return (
              <div key={quote.id} className="card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-ink">{quote.productType?.[0] || "Leather Product"}</p>
                    <p className="mt-0.5 text-xs text-[#7B6A62]">
                      Qty: {quote.quantity} · {new Date(quote.createdAt).toLocaleDateString("en-NG")}
                    </p>
                    <p className="mt-0.5 font-mono text-[10px] font-bold text-[#A39289] tracking-wide">
                      {quote.ref || `#${quote.id?.slice(0, 8).toUpperCase()}`}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${badge.cls}`}>
                    {badge.label}
                  </span>
                </div>

                {/* Sample video — shown once admin forwards it to the brand */}
                {sampleVideoUrl && (
                  <div className="mt-4 rounded-xl border border-[#E6D7CB] bg-[#FFF8EF] p-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#8B6A39]">
                      Sample Video — Ready for Review
                    </p>
                    <video
                      src={sampleVideoUrl}
                      controls
                      className="w-full rounded-lg max-h-72 bg-black"
                      preload="metadata"
                    />
                    <p className="mt-2 text-xs text-[#7B6A62]">
                      Watch the sample your artisan produced. Use the buttons below to approve or request changes.
                    </p>
                  </div>
                )}

                {hasPrice ? (
                  <div className="mt-4 grid gap-2 rounded-xl border border-[#E6D7CB] bg-[#FFF8EF] p-4 text-sm sm:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-[0.12em] text-[#8B6A39]">Materials</p>
                      <p className="mt-0.5 font-semibold text-ink">{formatNaira(quote.materials || 0)}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.12em] text-[#8B6A39]">Labour</p>
                      <p className="mt-0.5 font-semibold text-ink">{formatNaira(quote.labour || 0)}</p>
                    </div>
                    {quote.moq ? (
                      <div>
                        <p className="text-xs uppercase tracking-[0.12em] text-[#8B6A39]">MOQ</p>
                        <p className="mt-0.5 font-semibold text-ink">{quote.moq} units</p>
                      </div>
                    ) : null}
                    <div className="sm:col-span-2 flex items-center justify-between text-sm">
                      <span className="text-[#8B6A39]">VAT (7.5%)</span>
                      <span className="text-[#8B6A39]">+ {formatNaira(vatAmount)}</span>
                    </div>
                    <div className="border-t border-[#E6D7CB] pt-2 sm:col-span-2">
                      <p className="text-xs uppercase tracking-[0.12em] text-[#8B6A39]">Total Payable (incl. VAT)</p>
                      <p className="mt-0.5 text-base font-bold text-ink">{formatNaira(total)}</p>
                    </div>
                    {sampleCredit > 0 ? (
                      <>
                        <div className="sm:col-span-2 flex items-center justify-between text-sm">
                          <span className="text-[#2D6A4F] font-medium">Sample Credit Applied</span>
                          <span className="text-[#2D6A4F] font-semibold">− {formatNaira(sampleCredit)}</span>
                        </div>
                        <div className="border-t border-[#E6D7CB] pt-2 sm:col-span-2">
                          <p className="text-xs uppercase tracking-[0.12em] text-[#8B6A39]">Balance Due</p>
                          <p className="mt-0.5 text-base font-bold text-ink">{formatNaira(balanceDue)}</p>
                        </div>
                      </>
                    ) : null}
                  </div>
                ) : (
                  <div className="mt-4 rounded-xl border border-[#E6D7CB] bg-white p-4 text-sm text-[#7B6A62]">
                    Pricing is being prepared by our team. You will be notified when it's ready.
                  </div>
                )}

                {hasPrice && !isPaid && quote.status !== "REJECTED" ? (
                  <div className="mt-4">
                    <Button
                      variant="accent"
                      className="w-full sm:w-auto"
                      onClick={() => handleOpenPayment(quote, sampleApproved)}
                    >
                      Pay Now — {formatNaira(balanceDue)}
                    </Button>
                    {sampleWarningId === quote.id && (
                      <p className="mt-2 text-xs text-[#B45309]">
                        Please approve your sample first before paying for production.
                      </p>
                    )}
                  </div>
                ) : isPaid ? (
                  <div className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-success">
                    <CheckCircle2 className="h-4 w-4" /> Payment confirmed — order in production
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      {/* Payment modal */}
      <Modal open={payModalOpen} title="Confirm Production Payment" onClose={closeModal}>
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-[#E6D7CB] bg-[#FFF8EF] px-4 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold text-espresso">
            <CreditCard className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8B6A39]">
              Paystack Secure Checkout
            </p>
            <p className="truncate text-sm text-[#5A4A44]">
              {selectedQuote?.productType?.[0] || "Production payment"}
              {selectedQuote?.price
                ? ` · ${formatNaira(selectedQuote.price)}`
                : ""}
              {(selectedQuote?.orders?.[0]?.flatFeePaid ?? 0) > 0
                ? ` · Sample credit: ${formatNaira(selectedQuote.orders[0].flatFeePaid)}`
                : ""}
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center rounded-full bg-[#2D6A4F14] px-2.5 py-1 text-[11px] font-semibold text-success">
            <ShieldCheck className="mr-1 h-3.5 w-3.5" /> Secure
          </span>
        </div>

        {payStage === "loading" ? (
          <div className="space-y-4 py-6 text-center">
            <Spinner size="lg" className="text-gold mx-auto" />
            <p className="text-base font-semibold text-ink">Initializing Paystack...</p>
          </div>
        ) : payStage === "success" && payDetails ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-success/20 bg-[#2D6A4F10] p-4 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
              <p className="mt-3 text-lg font-semibold text-ink">Payment session ready</p>
            </div>
            <div className="grid gap-3 rounded-xl border border-[#E6D7CB] bg-white p-4 text-sm sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-[#8B6A39]">Reference</p>
                <p className="mt-1 font-semibold text-ink">{payDetails.reference}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-[#8B6A39]">Balance Due</p>
                <p className="mt-1 font-semibold text-ink">{formatNaira(payDetails.balanceDue)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-[#8B6A39]">VAT</p>
                <p className="mt-1 font-semibold text-ink">{formatNaira(payDetails.vatAmount)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-[#8B6A39]">Total Payable</p>
                <p className="mt-1 font-bold text-ink">{formatNaira(payDetails.totalPayable)}</p>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button variant="accent" className="w-full sm:w-auto" onClick={() => { window.location.href = payDetails.authorizationUrl; }}>
                Continue to Paystack
              </Button>
              <Button variant="outline" className="w-full sm:w-auto" onClick={closeModal}>Close</Button>
            </div>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleInitiatePayment}>
            <p className="text-sm text-[#5A4A44]">
              Full production payment held in escrow until delivery is confirmed.
            </p>
            <div>
              <label className="label">Email Address</label>
              <input className="input" type="email" value={payEmail}
                onChange={(e) => setPayEmail(e.target.value)} placeholder="you@brand.com" required />
            </div>
            {payError ? <p className="text-sm text-[#B42318]">{payError}</p> : null}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="submit" variant="accent" disabled={payLoading} className="w-full sm:w-auto">
                {payLoading ? <span className="inline-flex items-center gap-2"><Spinner size="sm" className="text-espresso" /><span>Initializing...</span></span> : "Continue to Paystack"}
              </Button>
              <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={closeModal}>Cancel</Button>
            </div>
          </form>
        )}
      </Modal>
    </PageWrapper>
  );
}
