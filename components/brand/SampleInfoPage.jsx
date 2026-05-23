// import { useEffect, useState } from "react";
// import { CheckCircle2, CreditCard, ShieldCheck, Sparkles } from "lucide-react";
// import { useRouter } from "next/router";
// import { sampleInfoPoints, sampleSteps } from "../../data/mockData";
// import Button from "../ui/Button";
// import Modal from "../ui/Modal";
// import Spinner from "../ui/Spinner";
// import { getKycStatus } from "../../services/authService";
// import {
//   getSampleProgress,
//   initializeSamplePayment,
// } from "../../services/paymentService";
// import {
//   calculateTotalWithVat,
//   formatNaira,
//   formatVatPercent,
// } from "../../utils/pricing";

// const SAMPLE_BASE_FEE = 30000;
// const SAMPLE_PAYMENT = calculateTotalWithVat(SAMPLE_BASE_FEE);
// const VAT_LABEL = `VAT (${formatVatPercent()})`;

// export default function SampleInfoPage() {
//   const router = useRouter();
//   const [paymentOpen, setPaymentOpen] = useState(false);
//   const [email, setEmail] = useState("");
//   const [phone, setPhone] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");
//   const [paymentDetails, setPaymentDetails] = useState(null);
//   const [paymentStage, setPaymentStage] = useState("form");
//   const [sampleRequestId, setSampleRequestId] = useState("");
//   const [currentSampleStatus, setCurrentSampleStatus] = useState("requested");
//   const [progressLoading, setProgressLoading] = useState(false);
//   const [productionActionLoading, setProductionActionLoading] = useState(false);
//   const [productionDecision, setProductionDecision] = useState("idle");
//   const [productionDecisionError, setProductionDecisionError] = useState("");

//   const PENDING_QUOTE_INTENT_KEY = "leddar_pending_quote_intent";

//   async function handleInitiatePayment(event) {
//     event.preventDefault();
//     setLoading(true);
//     setError("");
//     setPaymentStage("loading");

//     try {
//       const result = await initializeSamplePayment({
//         email,
//         amount: SAMPLE_BASE_FEE,
//       });
//       setPaymentDetails(result);
//       setSampleRequestId(result.sampleRequestId || "");
//       setPaymentStage("success");
//     } catch (err) {
//       setError(err.message || "Unable to initialize payment.");
//       setPaymentStage("form");
//     } finally {
//       setLoading(false);
//     }
//   }

//   function closeModal() {
//     setPaymentOpen(false);
//     setError("");
//     setPaymentDetails(null);
//     setPaymentStage("form");
//   }

//   function handleOpenSamplePayment() {
//     if (getKycStatus() !== "verified") {
//       router.push(
//         `/kyc?returnUrl=${encodeURIComponent(router.asPath || "/sample-requests")}`,
//       );
//       return;
//     }

//     setPaymentOpen(true);
//   }

//   function getDefaultProductionIntent() {
//     return {
//       productType: "Custom Leather Products",
//       quantity: 100,
//       requiredTimeline: "3-4 weeks",
//       notes: `Sample ${sampleRequestId || "request"} approved. Request production pricing and apply \u20a630,000 sample fee credit.`,
//       attachments: [],
//     };
//   }

//   async function handleProceedToProductionPricing() {
//     setProductionDecisionError("");
//     setProductionDecision("idle");
//     setProductionActionLoading(true);

//     try {
//       if (getKycStatus() !== "verified") {
//         router.push(
//           `/kyc?returnUrl=${encodeURIComponent(router.asPath || "/sample-requests")}`,
//         );
//         return;
//       }

//       if (typeof window !== "undefined") {
//         window.sessionStorage.setItem(
//           PENDING_QUOTE_INTENT_KEY,
//           JSON.stringify(getDefaultProductionIntent()),
//         );
//       }

//       await router.push("/new-order?resume=pricing&source=sample");
//     } catch (err) {
//       setProductionDecisionError(
//         err.message || "Unable to continue to production pricing.",
//       );
//     } finally {
//       setProductionActionLoading(false);
//     }
//   }

//   function handleRejectProduction() {
//     setProductionDecision("rejected");
//     setProductionDecisionError("");
//   }

//   useEffect(() => {
//     if (!sampleRequestId) {
//       return;
//     }

//     let active = true;

//     const fetchProgress = async () => {
//       setProgressLoading(true);
//       try {
//         const result = await getSampleProgress(sampleRequestId);
//         if (active && result?.currentStatus) {
//           setCurrentSampleStatus(result.currentStatus);
//         }
//       } catch {
//         // Keep currently displayed state if progress fetch fails.
//       } finally {
//         if (active) {
//           setProgressLoading(false);
//         }
//       }
//     };

//     fetchProgress();
//     const interval = setInterval(fetchProgress, 5000);

//     return () => {
//       active = false;
//       clearInterval(interval);
//     };
//   }, [sampleRequestId]);

//   const activeStepIndex = Math.max(
//     0,
//     sampleSteps.findIndex((step) => step.key === currentSampleStatus),
//   );
//   const canDecideProduction =
//     currentSampleStatus === "sample_ready" ||
//     currentSampleStatus === "completed";

//   return (
//     <div className="space-y-6">
//       <div className="card p-6">
//         <h1 className="page-title">
//           Start with a Sample — Validate Before You Produce
//         </h1>
//         <ul className="mt-5 space-y-3">
//           {sampleInfoPoints.map((point) => (
//             <li
//               key={point}
//               className="flex items-start gap-3 text-sm text-[#4D3F39]"
//             >
//               <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
//               <span>{point}</span>
//             </li>
//           ))}
//         </ul>
//         <Button
//           variant="accent"
//           className="mt-6 w-full md:w-auto"
//           onClick={handleOpenSamplePayment}
//         >
//           Pay Sample Fee - ₦30,000 (+ VAT)
//         </Button>
//       </div>

//       <div className="card p-6">
//         <h2 className="text-lg font-semibold text-ink">Sample Progress</h2>
//         <p className="mt-1 text-sm text-[#5A4A44]">
//           This section shows the sample workflow only. Production orders are
//           tracked separately in Order Tracker.
//         </p>
//         <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#7B6A62]">
//           {progressLoading ? (
//             <>
//               <Spinner size="xs" className="text-gold" />
//               <span>Refreshing sample progress...</span>
//             </>
//           ) : (
//             <>
//               <span className="inline-block h-2 w-2 rounded-full bg-success" />
//               <span>Progress auto-updates every few seconds.</span>
//             </>
//           )}
//         </div>
//         <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
//           {sampleSteps.map((step, index) => {
//             const completed = index < activeStepIndex;
//             const activeStep = index === activeStepIndex;

//             return (
//               <div
//                 key={step.key}
//                 className={`rounded-xl border p-4 ${
//                   activeStep
//                     ? "border-[#C49A3C55] bg-[#FFF8EA]"
//                     : completed
//                       ? "border-[#2D6A4F1A] bg-[#2D6A4F10]"
//                       : "border-[#E8DED5] bg-white"
//                 }`}
//               >
//                 <div className="flex items-start gap-3">
//                   <span
//                     className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
//                       activeStep
//                         ? "bg-gold text-espresso"
//                         : completed
//                           ? "bg-success text-white"
//                           : "bg-[#DCCFBE] text-[#6D5A51]"
//                     }`}
//                   >
//                     {index + 1}
//                   </span>
//                   <div>
//                     <p className="text-sm font-semibold text-ink">
//                       {step.title}
//                     </p>
//                     <p className="mt-1 text-sm text-[#5A4A44]">{step.note}</p>
//                   </div>
//                 </div>
//               </div>
//             );
//           })}
//         </div>

//         {canDecideProduction ? (
//           <div className="mt-6 rounded-xl border border-[#E6D7CB] bg-[#FFF8EF] p-4 sm:p-5">
//             <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8B6A39]">
//               Sample Approved - Next Decision
//             </p>
//             <h3 className="mt-2 text-base font-semibold text-ink">
//               Proceed to production pricing or reject this production run
//             </h3>
//             <p className="mt-2 text-sm text-[#5A4A44]">
//               Your sample fee of \u20a630,000 will be credited from the full
//               production total.
//             </p>

//             <div className="mt-4 flex flex-col gap-3 sm:flex-row">
//               <Button
//                 variant="accent"
//                 className="w-full sm:w-auto"
//                 onClick={handleProceedToProductionPricing}
//                 disabled={productionActionLoading}
//               >
//                 {productionActionLoading ? (
//                   <span className="inline-flex items-center gap-2">
//                     <Spinner size="sm" className="text-espresso" />
//                     <span>Submitting Production Request...</span>
//                   </span>
//                 ) : (
//                   "Go Ahead - Request Production Pricing"
//                 )}
//               </Button>
//               <Button
//                 variant="outline"
//                 className="w-full sm:w-auto"
//                 onClick={handleRejectProduction}
//                 disabled={productionActionLoading}
//               >
//                 Reject Production
//               </Button>
//             </div>

//             {productionDecision === "rejected" ? (
//               <p className="mt-3 text-sm text-[#7B6A62]">
//                 Production request rejected. You can continue with corrections
//                 or submit a fresh sample when ready.
//               </p>
//             ) : null}

//             {productionDecisionError ? (
//               <p className="mt-3 text-sm text-[#B42318]">
//                 {productionDecisionError}
//               </p>
//             ) : null}
//           </div>
//         ) : null}
//       </div>

//       <Modal open={paymentOpen} title="Paystack Checkout" onClose={closeModal}>
//         <div className="mb-5 flex items-center gap-3 rounded-xl border border-[#E6D7CB] bg-[#FFF8EF] px-4 py-3">
//           <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold text-espresso">
//             <CreditCard className="h-5 w-5" />
//           </div>
//           <div className="min-w-0 flex-1">
//             <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8B6A39]">
//               Paystack Secure Checkout
//             </p>
//             <p className="truncate text-sm text-[#5A4A44]">
//               Sample fee payment for Leddar - {formatNaira(SAMPLE_BASE_FEE)}
//             </p>
//           </div>
//           <span className="inline-flex shrink-0 items-center rounded-full bg-[#2D6A4F14] px-2.5 py-1 text-[11px] font-semibold text-success">
//             <ShieldCheck className="mr-1 h-3.5 w-3.5" />
//             Secure
//           </span>
//         </div>

//         {paymentStage === "loading" ? (
//           <div className="space-y-4 py-6 text-center">
//             <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FAF4E7]">
//               <Spinner size="lg" className="text-gold" />
//             </div>
//             <div>
//               <p className="text-base font-semibold text-ink">
//                 Initializing Paystack...
//               </p>
//               <p className="mt-1 text-sm text-[#5A4A44]">
//                 Preparing your payment reference and checkout session.
//               </p>
//             </div>
//           </div>
//         ) : paymentStage === "success" && paymentDetails ? (
//           <div className="space-y-4">
//             <div className="rounded-xl border border-success/20 bg-[#2D6A4F10] p-4 text-center">
//               <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
//               <p className="mt-3 text-lg font-semibold text-ink">
//                 Payment session created
//               </p>
//               <p className="mt-1 text-sm text-[#5A4A44]">
//                 Your Paystack checkout is ready. Use the button below to open
//                 the payment page.
//               </p>
//             </div>

//             <div className="grid gap-3 rounded-xl border border-[#E6D7CB] bg-white p-4 text-sm text-[#4D3F39] sm:grid-cols-2">
//               <div>
//                 <p className="text-xs uppercase tracking-[0.14em] text-[#8B6A39]">
//                   Reference
//                 </p>
//                 <p className="mt-1 font-semibold text-ink">
//                   {paymentDetails.reference}
//                 </p>
//               </div>
//               <div>
//                 <p className="text-xs uppercase tracking-[0.14em] text-[#8B6A39]">
//                   Sample Fee
//                 </p>
//                 <p className="mt-1 font-semibold text-ink">
//                   {formatNaira(paymentDetails.amount || SAMPLE_BASE_FEE)}
//                 </p>
//               </div>
//               <div>
//                 <p className="text-xs uppercase tracking-[0.14em] text-[#8B6A39]">
//                   {VAT_LABEL}
//                 </p>
//                 <p className="mt-1 font-semibold text-ink">
//                   {formatNaira(paymentDetails.vatAmount || SAMPLE_PAYMENT.vatAmount)}
//                 </p>
//               </div>
//               <div>
//                 <p className="text-xs uppercase tracking-[0.14em] text-[#8B6A39]">
//                   Total Payable
//                 </p>
//                 <p className="mt-1 font-semibold text-ink">
//                   {formatNaira(
//                     paymentDetails.totalAmount || SAMPLE_PAYMENT.totalAmount,
//                   )}
//                 </p>
//               </div>
//               <div className="sm:col-span-2 flex items-center gap-2 rounded-lg bg-[#FAF4E7] px-3 py-2 text-xs text-[#7A5A2A]">
//                 <Sparkles className="h-4 w-4" />
//                 VAT is shown for prototype visibility; real backend should
//                 return official tax values.
//               </div>
//             </div>

//             <div className="flex flex-col gap-3 sm:flex-row">
//               <a
//                 href={paymentDetails.authorizationUrl}
//                 target="_blank"
//                 rel="noreferrer"
//                 className="inline-flex w-full sm:w-auto"
//               >
//                 <Button variant="accent" className="w-full sm:w-auto">
//                   Open Paystack
//                 </Button>
//               </a>
//               <Button
//                 variant="outline"
//                 className="w-full sm:w-auto"
//                 onClick={closeModal}
//               >
//                 Close
//               </Button>
//             </div>
//           </div>
//         ) : (
//           <form className="space-y-4" onSubmit={handleInitiatePayment}>
//             <p className="text-sm text-[#5A4A44]">
//               Initialize the sample fee payment through Paystack. VAT is{" "}
//               {formatVatPercent()} of the sample fee.
//             </p>

//             <div>
//               <label className="label">Email Address</label>
//               <input
//                 className="input"
//                 type="email"
//                 value={email}
//                 onChange={(event) => setEmail(event.target.value)}
//                 placeholder="you@brand.com"
//                 required
//               />
//             </div>

//             <div>
//               <label className="label">WhatsApp Number</label>
//               <input
//                 className="input"
//                 value={phone}
//                 onChange={(event) => setPhone(event.target.value)}
//                 placeholder="+234..."
//               />
//             </div>

//             {error ? <p className="text-sm text-[#B42318]">{error}</p> : null}

//             <div className="flex flex-col gap-3 sm:flex-row">
//               <Button
//                 type="submit"
//                 variant="accent"
//                 disabled={loading}
//                 className="w-full sm:w-auto"
//               >
//                 {loading ? (
//                   <span className="inline-flex items-center gap-2">
//                     <Spinner size="sm" className="text-espresso" />
//                     <span>Initializing...</span>
//                   </span>
//                 ) : (
//                   "Continue to Paystack"
//                 )}
//               </Button>
//               <Button
//                 type="button"
//                 variant="outline"
//                 className="w-full sm:w-auto"
//                 onClick={closeModal}
//               >
//                 Cancel
//               </Button>
//             </div>
//           </form>
//         )}
//       </Modal>
//     </div>
//   );
// }

// src/components/sample/SampleInfoPage.jsx
import { useEffect, useState } from "react";
import { CheckCircle2, CreditCard, ShieldCheck, Sparkles } from "lucide-react";
import { useRouter } from "next/router";
import { sampleInfoPoints, sampleSteps } from "../../data/mockData";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import Spinner from "../ui/Spinner";
import { getSession, getKycStatus } from "../../services/authService";
import {
  getSampleProgress,
  initializeSamplePayment,
  initializeProductionPayment,
} from "../../services/paymentService";
import { calculateTotalWithVat, formatNaira, formatVatPercent } from "../../utils/pricing";

const SAMPLE_BASE_FEE = 30000;
const SAMPLE_PAYMENT = calculateTotalWithVat(SAMPLE_BASE_FEE);
const VAT_LABEL = `VAT (${formatVatPercent()})`;

export default function SampleInfoPage({ quoteId, orderId, productionTotal }) {
  const router = useRouter();
  const session = getSession();

  // --- Sample payment modal ---
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [email, setEmail] = useState(session?.email || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [paymentStage, setPaymentStage] = useState("form"); // "form" | "loading" | "success"

  // --- Sample progress ---
  const [sampleOrderId, setSampleOrderId] = useState(orderId || "");
  const [currentSampleStatus, setCurrentSampleStatus] = useState("requested");
  const [progressLoading, setProgressLoading] = useState(false);

  // --- Production payment modal ---
  const [productionPaymentOpen, setProductionPaymentOpen] = useState(false);
  const [productionEmail, setProductionEmail] = useState(session?.email || "");
  const [productionLoading, setProductionLoading] = useState(false);
  const [productionError, setProductionError] = useState("");
  const [productionDetails, setProductionDetails] = useState(null);
  const [productionStage, setProductionStage] = useState("form"); // "form" | "loading" | "success"

  // --- Production decision ---
  const [productionDecision, setProductionDecision] = useState("idle");

  // ---------------------------------------------------------------------------
  // KYC guard (shared)
  // ---------------------------------------------------------------------------
  async function requireKyc() {
    const kycProfile = await getKycStatus();
    if (kycProfile?.status !== "verified") {
      router.push(
        `/kyc?returnUrl=${encodeURIComponent(router.asPath || "/sample-requests")}`,
      );
      return false;
    }
    return true;
  }

  // ---------------------------------------------------------------------------
  // Sample flat fee payment
  // ---------------------------------------------------------------------------
  async function handleOpenSamplePayment() {
    const ok = await requireKyc();
    if (ok) setPaymentOpen(true);
  }

  async function handleInitiateSamplePayment(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setPaymentStage("loading");

    try {
      const result = await initializeSamplePayment({ email, quoteId });
      setPaymentDetails(result);
      setPaymentStage("success");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to initialize payment.");
      setPaymentStage("form");
    } finally {
      setLoading(false);
    }
  }

  function handleRedirectToSamplePaystack() {
    if (paymentDetails?.authorizationUrl) {
      window.location.href = paymentDetails.authorizationUrl;
    }
  }

  function closeSampleModal() {
    setPaymentOpen(false);
    setError("");
    setPaymentDetails(null);
    setPaymentStage("form");
  }

  // ---------------------------------------------------------------------------
  // Production balance payment
  // ---------------------------------------------------------------------------
  async function handleOpenProductionPayment() {
    const ok = await requireKyc();
    if (ok) {
      setProductionDecision("paying");
      setProductionPaymentOpen(true);
    }
  }

  async function handleInitiateProductionPayment(event) {
    event.preventDefault();
    setProductionLoading(true);
    setProductionError("");
    setProductionStage("loading");

    try {
      const result = await initializeProductionPayment({
        email: productionEmail,
        orderId: sampleOrderId,
      });
      setProductionDetails(result);
      setProductionStage("success");
    } catch (err) {
      setProductionError(
        err.response?.data?.message || err.message || "Unable to initialize production payment.",
      );
      setProductionStage("form");
    } finally {
      setProductionLoading(false);
    }
  }

  function handleRedirectToProductionPaystack() {
    if (productionDetails?.authorizationUrl) {
      window.location.href = productionDetails.authorizationUrl;
    }
  }

  function closeProductionModal() {
    setProductionPaymentOpen(false);
    setProductionError("");
    setProductionDetails(null);
    setProductionStage("form");
  }

  function handleRejectProduction() {
    setProductionDecision("rejected");
  }

  // ---------------------------------------------------------------------------
  // Sample progress polling
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!sampleOrderId) return;

    let active = true;

    const fetchProgress = async () => {
      setProgressLoading(true);
      try {
        const result = await getSampleProgress(sampleOrderId);
        if (active && result?.currentStatus) {
          setCurrentSampleStatus(result.currentStatus);
        }
      } catch {
        // Retain current status on network error
      } finally {
        if (active) setProgressLoading(false);
      }
    };

    fetchProgress();
    const interval = setInterval(fetchProgress, 5000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [sampleOrderId]);

  // After Paystack redirects back, the orderId may arrive in the query string
  useEffect(() => {
    if (router.query.orderId && !sampleOrderId) {
      setSampleOrderId(router.query.orderId);
    }
  }, [router.query.orderId]);

  const activeStepIndex = Math.max(
    0,
    sampleSteps.findIndex((step) => step.key === currentSampleStatus),
  );
  const canDecideProduction =
    currentSampleStatus === "sample_ready" || currentSampleStatus === "completed";

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-6">

      {/* Sample info + pay button */}
      <div className="card p-6">
        <h1 className="page-title">Start with a Sample — Validate Before You Produce</h1>
        <ul className="mt-5 space-y-3">
          {sampleInfoPoints.map((point) => (
            <li key={point} className="flex items-start gap-3 text-sm text-[#4D3F39]">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
        <Button
          variant="accent"
          className="mt-6 w-full md:w-auto"
          onClick={handleOpenSamplePayment}
        >
          Pay Sample Fee — ₦30,000 (+ VAT)
        </Button>
      </div>

      {/* Sample progress stepper */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-ink">Sample Progress</h2>
        <p className="mt-1 text-sm text-[#5A4A44]">
          Production orders are tracked separately in Order Tracker.
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#7B6A62]">
          {progressLoading ? (
            <>
              <Spinner size="xs" className="text-gold" />
              <span>Refreshing sample progress...</span>
            </>
          ) : (
            <>
              <span className="inline-block h-2 w-2 rounded-full bg-success" />
              <span>Progress auto-updates every few seconds.</span>
            </>
          )}
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {sampleSteps.map((step, index) => {
            const completed = index < activeStepIndex;
            const activeStep = index === activeStepIndex;
            return (
              <div
                key={step.key}
                className={`rounded-xl border p-4 ${
                  activeStep
                    ? "border-[#C49A3C55] bg-[#FFF8EA]"
                    : completed
                      ? "border-[#2D6A4F1A] bg-[#2D6A4F10]"
                      : "border-[#E8DED5] bg-white"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                      activeStep
                        ? "bg-gold text-espresso"
                        : completed
                          ? "bg-success text-white"
                          : "bg-[#DCCFBE] text-[#6D5A51]"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink">{step.title}</p>
                    <p className="mt-1 text-sm text-[#5A4A44]">{step.note}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Production decision panel */}
        {canDecideProduction && productionDecision !== "rejected" ? (
          <div className="mt-6 rounded-xl border border-[#E6D7CB] bg-[#FFF8EF] p-4 sm:p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8B6A39]">
              Sample Approved — Next Step
            </p>
            <h3 className="mt-2 text-base font-semibold text-ink">
              Pay production balance or reject this run
            </h3>
            <p className="mt-2 text-sm text-[#5A4A44]">
              Your ₦30,000 sample fee is deducted from the production total. Pay only the balance.
            </p>

            {productionTotal ? (
              <div className="mt-3 grid gap-2 rounded-lg border border-[#E6D7CB] bg-white p-3 text-sm sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-[#8B6A39]">Production Total</p>
                  <p className="mt-0.5 font-semibold text-ink">{formatNaira(productionTotal)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.12em] text-[#8B6A39]">Sample Credit</p>
                  <p className="mt-0.5 font-semibold text-success">− {formatNaira(SAMPLE_BASE_FEE)}</p>
                </div>
                <div className="border-t border-[#E6D7CB] pt-2 sm:col-span-2">
                  <p className="text-xs uppercase tracking-[0.12em] text-[#8B6A39]">Balance Due</p>
                  <p className="mt-0.5 text-base font-bold text-ink">
                    {formatNaira(Math.max(0, productionTotal - SAMPLE_BASE_FEE))}
                    <span className="ml-1 text-xs font-normal text-[#7B6A62]">(+ VAT)</span>
                  </p>
                </div>
              </div>
            ) : null}

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Button variant="accent" className="w-full sm:w-auto" onClick={handleOpenProductionPayment}>
                Pay Production Balance
              </Button>
              <Button variant="outline" className="w-full sm:w-auto" onClick={handleRejectProduction}>
                Reject Production
              </Button>
            </div>
          </div>
        ) : null}

        {productionDecision === "rejected" ? (
          <div className="mt-6 rounded-xl border border-[#E8DED5] bg-white p-4 text-sm text-[#7B6A62]">
            Production rejected. You can submit a fresh sample when ready.
          </div>
        ) : null}
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* MODAL 1 — Sample Flat Fee                                           */}
      {/* ------------------------------------------------------------------ */}
      <Modal open={paymentOpen} title="Pay Sample Fee" onClose={closeSampleModal}>
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-[#E6D7CB] bg-[#FFF8EF] px-4 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold text-espresso">
            <CreditCard className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8B6A39]">
              Paystack Secure Checkout
            </p>
            <p className="truncate text-sm text-[#5A4A44]">
              Sample fee — {formatNaira(SAMPLE_BASE_FEE)}
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center rounded-full bg-[#2D6A4F14] px-2.5 py-1 text-[11px] font-semibold text-success">
            <ShieldCheck className="mr-1 h-3.5 w-3.5" />
            Secure
          </span>
        </div>

        {paymentStage === "loading" ? (
          <div className="space-y-4 py-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FAF4E7]">
              <Spinner size="lg" className="text-gold" />
            </div>
            <p className="text-base font-semibold text-ink">Initializing Paystack...</p>
            <p className="mt-1 text-sm text-[#5A4A44]">Preparing your checkout session.</p>
          </div>
        ) : paymentStage === "success" && paymentDetails ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-success/20 bg-[#2D6A4F10] p-4 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
              <p className="mt-3 text-lg font-semibold text-ink">Payment session ready</p>
              <p className="mt-1 text-sm text-[#5A4A44]">
                Click below to complete payment on Paystack.
              </p>
            </div>
            <div className="grid gap-3 rounded-xl border border-[#E6D7CB] bg-white p-4 text-sm text-[#4D3F39] sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-[#8B6A39]">Reference</p>
                <p className="mt-1 font-semibold text-ink">{paymentDetails.reference}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-[#8B6A39]">Sample Fee</p>
                <p className="mt-1 font-semibold text-ink">{formatNaira(paymentDetails.amount)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-[#8B6A39]">{VAT_LABEL}</p>
                <p className="mt-1 font-semibold text-ink">
                  {formatNaira(paymentDetails.vatAmount ?? SAMPLE_PAYMENT.vatAmount)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-[#8B6A39]">Total Payable</p>
                <p className="mt-1 font-semibold text-ink">
                  {formatNaira(paymentDetails.totalAmount ?? SAMPLE_PAYMENT.totalAmount)}
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button variant="accent" className="w-full sm:w-auto" onClick={handleRedirectToSamplePaystack}>
                Continue to Paystack
              </Button>
              <Button variant="outline" className="w-full sm:w-auto" onClick={closeSampleModal}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleInitiateSamplePayment}>
            <p className="text-sm text-[#5A4A44]">
              Pay the ₦30,000 flat sample fee via Paystack. VAT ({formatVatPercent()}) applies.
            </p>
            <div>
              <label className="label">Email Address</label>
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@brand.com"
                required
              />
            </div>
            {error ? <p className="text-sm text-[#B42318]">{error}</p> : null}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="submit" variant="accent" disabled={loading} className="w-full sm:w-auto">
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <Spinner size="sm" className="text-espresso" />
                    <span>Initializing...</span>
                  </span>
                ) : (
                  "Continue to Paystack"
                )}
              </Button>
              <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={closeSampleModal}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* ------------------------------------------------------------------ */}
      {/* MODAL 2 — Production Balance                                        */}
      {/* ------------------------------------------------------------------ */}
      <Modal open={productionPaymentOpen} title="Pay Production Balance" onClose={closeProductionModal}>
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-[#E6D7CB] bg-[#FFF8EF] px-4 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold text-espresso">
            <CreditCard className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8B6A39]">
              Paystack Secure Checkout
            </p>
            <p className="truncate text-sm text-[#5A4A44]">
              Production balance — sample credit applied
            </p>
          </div>
          <span className="inline-flex shrink-0 items-center rounded-full bg-[#2D6A4F14] px-2.5 py-1 text-[11px] font-semibold text-success">
            <ShieldCheck className="mr-1 h-3.5 w-3.5" />
            Secure
          </span>
        </div>

        {productionStage === "loading" ? (
          <div className="space-y-4 py-6 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FAF4E7]">
              <Spinner size="lg" className="text-gold" />
            </div>
            <p className="text-base font-semibold text-ink">Initializing Paystack...</p>
            <p className="mt-1 text-sm text-[#5A4A44]">Preparing your production payment session.</p>
          </div>
        ) : productionStage === "success" && productionDetails ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-success/20 bg-[#2D6A4F10] p-4 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
              <p className="mt-3 text-lg font-semibold text-ink">Payment session ready</p>
              <p className="mt-1 text-sm text-[#5A4A44]">
                Redirecting you to Paystack to complete payment...
              </p>
            </div>
            <div className="grid gap-3 rounded-xl border border-[#E6D7CB] bg-white p-4 text-sm text-[#4D3F39] sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-[#8B6A39]">Reference</p>
                <p className="mt-1 font-semibold text-ink">{productionDetails.reference}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-[#8B6A39]">Production Total</p>
                <p className="mt-1 font-semibold text-ink">{formatNaira(productionDetails.productionTotal)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-[#8B6A39]">Sample Credit</p>
                <p className="mt-1 font-semibold text-success">− {formatNaira(productionDetails.sampleCredit)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-[#8B6A39]">Balance Due</p>
                <p className="mt-1 font-semibold text-ink">{formatNaira(productionDetails.balanceDue)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-[#8B6A39]">{VAT_LABEL}</p>
                <p className="mt-1 font-semibold text-ink">{formatNaira(productionDetails.vatAmount)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-[#8B6A39]">Total Payable</p>
                <p className="mt-1 font-bold text-ink">{formatNaira(productionDetails.totalPayable)}</p>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-[#FAF4E7] px-3 py-2 text-xs text-[#7A5A2A] sm:col-span-2">
                <Sparkles className="h-4 w-4" />
                Funds are held in escrow and released after confirmed delivery.
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button variant="accent" className="w-full sm:w-auto" onClick={handleRedirectToProductionPaystack}>
                Continue to Paystack
              </Button>
              <Button variant="outline" className="w-full sm:w-auto" onClick={closeProductionModal}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleInitiateProductionPayment}>
            <p className="text-sm text-[#5A4A44]">
              Your ₦30,000 sample fee is deducted automatically. Funds are held
              in escrow until delivery is confirmed.
            </p>
            <div>
              <label className="label">Email Address</label>
              <input
                className="input"
                type="email"
                value={productionEmail}
                onChange={(e) => setProductionEmail(e.target.value)}
                placeholder="you@brand.com"
                required
              />
            </div>
            {productionError ? <p className="text-sm text-[#B42318]">{productionError}</p> : null}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="submit" variant="accent" disabled={productionLoading} className="w-full sm:w-auto">
                {productionLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <Spinner size="sm" className="text-espresso" />
                    <span>Initializing...</span>
                  </span>
                ) : (
                  "Continue to Paystack"
                )}
              </Button>
              <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={closeProductionModal}>
                Cancel
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
