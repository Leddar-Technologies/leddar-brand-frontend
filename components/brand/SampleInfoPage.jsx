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

import { useEffect, useState } from "react";
import { CheckCircle2, CreditCard, ShieldCheck, Sparkles } from "lucide-react";
import { useRouter } from "next/router";
import { sampleInfoPoints, sampleSteps } from "../../data/mockData";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import Spinner from "../ui/Spinner";
import { getKycStatus } from "../../services/authService";
import {
  getSampleProgress,
  initializeSamplePayment,
} from "../../services/paymentService";
import {
  calculateTotalWithVat,
  formatNaira,
  formatVatPercent,
} from "../../utils/pricing";

const SAMPLE_BASE_FEE = 30000;
const SAMPLE_PAYMENT = calculateTotalWithVat(SAMPLE_BASE_FEE);
const VAT_LABEL = `VAT (${formatVatPercent()})`;

export default function SampleInfoPage() {
  const router = useRouter();
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [paymentStage, setPaymentStage] = useState("form");
  const [sampleRequestId, setSampleRequestId] = useState("");
  const [currentSampleStatus, setCurrentSampleStatus] = useState("requested");
  const [progressLoading, setProgressLoading] = useState(false);
  const [productionActionLoading, setProductionActionLoading] = useState(false);
  const [productionDecision, setProductionDecision] = useState("idle");
  const [productionDecisionError, setProductionDecisionError] = useState("");

  const PENDING_QUOTE_INTENT_KEY = "leddar_pending_quote_intent";

  async function handleInitiatePayment(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setPaymentStage("loading");

    try {
      const result = await initializeSamplePayment({
        email,
        amount: SAMPLE_BASE_FEE,
      });
      setPaymentDetails(result);
      setSampleRequestId(result.sampleRequestId || "");
      setPaymentStage("success");
    } catch (err) {
      setError(err.message || "Unable to initialize payment.");
      setPaymentStage("form");
    } finally {
      setLoading(false);
    }
  }

  function closeModal() {
    setPaymentOpen(false);
    setError("");
    setPaymentDetails(null);
    setPaymentStage("form");
  }

async function handleOpenSamplePayment() {
  const kycProfile = await getKycStatus();
  if (kycProfile?.status !== "verified") {
    router.push(`/kyc?...`);
    return;
  }
  setPaymentOpen(true);
}

  function getDefaultProductionIntent() {
    return {
      productType: "Custom Leather Products",
      quantity: 100,
      requiredTimeline: "3-4 weeks",
      notes: `Sample ${sampleRequestId || "request"} approved. Request production pricing and apply \u20a630,000 sample fee credit.`,
      attachments: [],
    };
  }

  async function handleProceedToProductionPricing() {
    setProductionDecisionError("");
    setProductionDecision("idle");
    setProductionActionLoading(true);

    try {
      if (getKycStatus() !== "verified") {
        router.push(
          `/kyc?returnUrl=${encodeURIComponent(router.asPath || "/sample-requests")}`,
        );
        return;
      }

      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(
          PENDING_QUOTE_INTENT_KEY,
          JSON.stringify(getDefaultProductionIntent()),
        );
      }

      await router.push("/new-order?resume=pricing&source=sample");
    } catch (err) {
      setProductionDecisionError(
        err.message || "Unable to continue to production pricing.",
      );
    } finally {
      setProductionActionLoading(false);
    }
  }

  function handleRejectProduction() {
    setProductionDecision("rejected");
    setProductionDecisionError("");
  }

  useEffect(() => {
    if (!sampleRequestId) {
      return;
    }

    let active = true;

    const fetchProgress = async () => {
      setProgressLoading(true);
      try {
        const result = await getSampleProgress(sampleRequestId);
        if (active && result?.currentStatus) {
          setCurrentSampleStatus(result.currentStatus);
        }
      } catch {
        // Keep currently displayed state if progress fetch fails.
      } finally {
        if (active) {
          setProgressLoading(false);
        }
      }
    };

    fetchProgress();
    const interval = setInterval(fetchProgress, 5000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [sampleRequestId]);

  const activeStepIndex = Math.max(
    0,
    sampleSteps.findIndex((step) => step.key === currentSampleStatus),
  );
  const canDecideProduction =
    currentSampleStatus === "sample_ready" ||
    currentSampleStatus === "completed";

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <h1 className="page-title">
          Start with a Sample — Validate Before You Produce
        </h1>
        <ul className="mt-5 space-y-3">
          {sampleInfoPoints.map((point) => (
            <li
              key={point}
              className="flex items-start gap-3 text-sm text-[#4D3F39]"
            >
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
          Pay Sample Fee - ₦30,000 (+ VAT)
        </Button>
      </div>

      <div className="card p-6">
        <h2 className="text-lg font-semibold text-ink">Sample Progress</h2>
        <p className="mt-1 text-sm text-[#5A4A44]">
          This section shows the sample workflow only. Production orders are
          tracked separately in Order Tracker.
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
                    <p className="text-sm font-semibold text-ink">
                      {step.title}
                    </p>
                    <p className="mt-1 text-sm text-[#5A4A44]">{step.note}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {canDecideProduction ? (
          <div className="mt-6 rounded-xl border border-[#E6D7CB] bg-[#FFF8EF] p-4 sm:p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8B6A39]">
              Sample Approved - Next Decision
            </p>
            <h3 className="mt-2 text-base font-semibold text-ink">
              Proceed to production pricing or reject this production run
            </h3>
            <p className="mt-2 text-sm text-[#5A4A44]">
              Your sample fee of \u20a630,000 will be credited from the full
              production total.
            </p>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Button
                variant="accent"
                className="w-full sm:w-auto"
                onClick={handleProceedToProductionPricing}
                disabled={productionActionLoading}
              >
                {productionActionLoading ? (
                  <span className="inline-flex items-center gap-2">
                    <Spinner size="sm" className="text-espresso" />
                    <span>Submitting Production Request...</span>
                  </span>
                ) : (
                  "Go Ahead - Request Production Pricing"
                )}
              </Button>
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={handleRejectProduction}
                disabled={productionActionLoading}
              >
                Reject Production
              </Button>
            </div>

            {productionDecision === "rejected" ? (
              <p className="mt-3 text-sm text-[#7B6A62]">
                Production request rejected. You can continue with corrections
                or submit a fresh sample when ready.
              </p>
            ) : null}

            {productionDecisionError ? (
              <p className="mt-3 text-sm text-[#B42318]">
                {productionDecisionError}
              </p>
            ) : null}
          </div>
        ) : null}
      </div>

      <Modal open={paymentOpen} title="Paystack Checkout" onClose={closeModal}>
        <div className="mb-5 flex items-center gap-3 rounded-xl border border-[#E6D7CB] bg-[#FFF8EF] px-4 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gold text-espresso">
            <CreditCard className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8B6A39]">
              Paystack Secure Checkout
            </p>
            <p className="truncate text-sm text-[#5A4A44]">
              Sample fee payment for Leddar - {formatNaira(SAMPLE_BASE_FEE)}
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
            <div>
              <p className="text-base font-semibold text-ink">
                Initializing Paystack...
              </p>
              <p className="mt-1 text-sm text-[#5A4A44]">
                Preparing your payment reference and checkout session.
              </p>
            </div>
          </div>
        ) : paymentStage === "success" && paymentDetails ? (
          <div className="space-y-4">
            <div className="rounded-xl border border-success/20 bg-[#2D6A4F10] p-4 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
              <p className="mt-3 text-lg font-semibold text-ink">
                Payment session created
              </p>
              <p className="mt-1 text-sm text-[#5A4A44]">
                Your Paystack checkout is ready. Use the button below to open
                the payment page.
              </p>
            </div>

            <div className="grid gap-3 rounded-xl border border-[#E6D7CB] bg-white p-4 text-sm text-[#4D3F39] sm:grid-cols-2">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-[#8B6A39]">
                  Reference
                </p>
                <p className="mt-1 font-semibold text-ink">
                  {paymentDetails.reference}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-[#8B6A39]">
                  Sample Fee
                </p>
                <p className="mt-1 font-semibold text-ink">
                  {formatNaira(paymentDetails.amount || SAMPLE_BASE_FEE)}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-[#8B6A39]">
                  {VAT_LABEL}
                </p>
                <p className="mt-1 font-semibold text-ink">
                  {formatNaira(
                    paymentDetails.vatAmount || SAMPLE_PAYMENT.vatAmount,
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-[#8B6A39]">
                  Total Payable
                </p>
                <p className="mt-1 font-semibold text-ink">
                  {formatNaira(
                    paymentDetails.totalAmount || SAMPLE_PAYMENT.totalAmount,
                  )}
                </p>
              </div>
              <div className="sm:col-span-2 flex items-center gap-2 rounded-lg bg-[#FAF4E7] px-3 py-2 text-xs text-[#7A5A2A]">
                <Sparkles className="h-4 w-4" />
                VAT is shown for prototype visibility; real backend should
                return official tax values.
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                href={paymentDetails.authorizationUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full sm:w-auto"
              >
                <Button variant="accent" className="w-full sm:w-auto">
                  Open Paystack
                </Button>
              </a>
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={closeModal}
              >
                Close
              </Button>
            </div>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleInitiatePayment}>
            <p className="text-sm text-[#5A4A44]">
              Initialize the sample fee payment through Paystack. VAT is{" "}
              {formatVatPercent()} of the sample fee.
            </p>

            <div>
              <label className="label">Email Address</label>
              <input
                className="input"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@brand.com"
                required
              />
            </div>

            <div>
              <label className="label">WhatsApp Number</label>
              <input
                className="input"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+234..."
              />
            </div>

            {error ? <p className="text-sm text-[#B42318]">{error}</p> : null}

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="submit"
                variant="accent"
                disabled={loading}
                className="w-full sm:w-auto"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <Spinner size="sm" className="text-espresso" />
                    <span>Initializing...</span>
                  </span>
                ) : (
                  "Continue to Paystack"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                onClick={closeModal}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}