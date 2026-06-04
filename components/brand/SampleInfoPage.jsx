import { useEffect, useState } from "react";
import {
  CheckCircle2, CreditCard, ShieldCheck, Sparkles,
  AlertCircle, FlaskConical, ArrowRight,
} from "lucide-react";
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
  getBrandOrderById,
} from "../../services/paymentService";
import { calculateTotalWithVat, formatNaira, formatVatPercent } from "../../utils/pricing";

const SAMPLE_BASE_FEE = 30000;
const getSamplePayment = () => calculateTotalWithVat(SAMPLE_BASE_FEE);
const VAT_LABEL = `VAT (${formatVatPercent()})`;
const PENDING_QUOTE_INTENT_KEY = "leddar_pending_quote_intent";
const SAMPLE_ORDER_ID_KEY = "leddar_sample_order_id";

// ---------------------------------------------------------------------------
// INFO MODE — purely informational, no payment UI
// ---------------------------------------------------------------------------
function SampleInfoView() {
  const router = useRouter();
  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF8EA]">
            <FlaskConical className="h-5 w-5 text-gold" />
          </div>
          <h1 className="page-title mb-0">Start with a Sample</h1>
        </div>
        <p className="text-sm text-[#5A4A44]">
          Before committing to full production, validate your product quality with a physical sample made by our vetted artisans.
        </p>

        {/* Info points */}
        <ul className="mt-5 space-y-3">
          {sampleInfoPoints.map((point) => (
            <li key={point} className="flex items-start gap-3 text-sm text-[#4D3F39]">
              <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-gold" />
              <span>{point}</span>
            </li>
          ))}
        </ul>

        {/* Fee highlight */}
        <div className="mt-6 rounded-xl border border-[#E6D7CB] bg-[#FFF8EF] p-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#8B6A39]">Sample Fee</p>
          <p className="mt-1 text-2xl font-bold text-ink">₦30,000 <span className="text-sm font-normal text-[#7B6A62]">+ VAT</span></p>
          <p className="mt-1 text-xs text-[#7B6A62]">Deducted from your full production total when you approve.</p>
        </div>

        {/* CTA */}
        <div className="mt-6">
          <Button
            variant="accent"
            className="w-full sm:w-auto"
            onClick={() => router.push("/new-order")}
          >
            Go to New Order to Request a Sample
            <ArrowRight className="ml-2 h-4 w-4 inline" />
          </Button>
          <p className="mt-2 text-xs text-[#7B6A62]">
            Fill in your product details on the New Order page, then click "Request Sample — ₦30,000" to proceed to payment.
          </p>
        </div>
      </div>

      {/* How it works */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-ink mb-4">How the Sample Process Works</h2>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {sampleSteps.map((step, index) => (
            <div key={step.key} className="rounded-xl border border-[#E8DED5] bg-white p-4">
              <div className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#DCCFBE] text-xs font-bold text-[#6D5A51]">
                  {index + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink">{step.title}</p>
                  <p className="mt-1 text-xs text-[#5A4A44]">{step.note}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAYMENT MODE — full payment + tracking UI (comes from QuoteForm)
// ---------------------------------------------------------------------------
function SamplePaymentView() {
  const router = useRouter();
  const session = getSession();

  const [quoteIntent, setQuoteIntent] = useState(null);
  const [sampleOrderId, setSampleOrderId] = useState("");
  const [orderData, setOrderData] = useState(null);

  const [currentSampleStatus, setCurrentSampleStatus] = useState("requested");
  const [progressLoading, setProgressLoading] = useState(false);

  // Sample payment modal
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [email, setEmail] = useState(session?.email || "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [paymentStage, setPaymentStage] = useState("form");

  // Production payment modal
  const [productionPaymentOpen, setProductionPaymentOpen] = useState(false);
  const [productionEmail, setProductionEmail] = useState(session?.email || "");
  const [productionLoading, setProductionLoading] = useState(false);
  const [productionError, setProductionError] = useState("");
  const [productionDetails, setProductionDetails] = useState(null);
  const [productionStage, setProductionStage] = useState("form");
  const [productionDecision, setProductionDecision] = useState("idle");

  // Boot: read from storage
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Read quote intent written by QuoteForm
    let intent = null;
    try {
      const raw = window.sessionStorage.getItem(PENDING_QUOTE_INTENT_KEY);
      if (raw) { intent = JSON.parse(raw); setQuoteIntent(intent); }
    } catch { /* ignore */ }

    // If arriving fresh from new-order with a new intent, clear any stale
    // sampleOrderId so the Pay button is visible for the new order
    const fromNewOrder = window.location.search.includes("source=new-order");
    if (fromNewOrder && intent) {
      window.localStorage.removeItem(SAMPLE_ORDER_ID_KEY);
      return; // don't restore old orderId
    }

    const stored = window.localStorage.getItem(SAMPLE_ORDER_ID_KEY);
    if (stored) setSampleOrderId(stored);
  }, []);

  useEffect(() => {
    if (router.query.orderId && !sampleOrderId) {
      setSampleOrderId(router.query.orderId);
    }
  }, [router.query.orderId]);

  useEffect(() => {
    if (!sampleOrderId) return;
    getBrandOrderById(sampleOrderId).then(setOrderData).catch(() => {});
  }, [sampleOrderId]);

  // Progress polling
  useEffect(() => {
    if (!sampleOrderId) return;
    let active = true;
    const fetchProgress = async () => {
      setProgressLoading(true);
      try {
        const result = await getSampleProgress(sampleOrderId);
        if (active && result?.currentStatus) setCurrentSampleStatus(result.currentStatus);
      } catch { /* retain */ } finally {
        if (active) setProgressLoading(false);
      }
    };
    fetchProgress();
    const interval = setInterval(fetchProgress, 5000);
    return () => { active = false; clearInterval(interval); };
  }, [sampleOrderId]);

  async function requireKyc() {
    const kycProfile = await getKycStatus();
    if (kycProfile?.status !== "verified") {
      router.push(`/kyc?returnUrl=${encodeURIComponent(router.asPath || "/sample-requests")}`);
      return false;
    }
    return true;
  }

  // Sample payment
  async function handleOpenSamplePayment() {
    if (!quoteIntent) {
      setError("No quote details found. Please go to New Order and click 'Request Sample' first.");
      return;
    }
    const ok = await requireKyc();
    if (ok) setPaymentOpen(true);
  }

  async function handleInitiateSamplePayment(event) {
    event.preventDefault();
    setLoading(true);
    setError("");
    setPaymentStage("loading");
    try {
      const result = await initializeSamplePayment({ email, quoteIntent });
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
    if (paymentDetails?.authorizationUrl) window.location.href = paymentDetails.authorizationUrl;
  }

  function closeSampleModal() {
    setPaymentOpen(false);
    setError("");
    setPaymentDetails(null);
    setPaymentStage("form");
  }

  // Production payment
  async function handleOpenProductionPayment() {
    const ok = await requireKyc();
    if (ok) { setProductionDecision("paying"); setProductionPaymentOpen(true); }
  }

  async function handleInitiateProductionPayment(event) {
    event.preventDefault();
    setProductionLoading(true);
    setProductionError("");
    setProductionStage("loading");
    try {
      const result = await initializeProductionPayment({ email: productionEmail, orderId: sampleOrderId });
      setProductionDetails(result);
      setProductionStage("success");
    } catch (err) {
      setProductionError(err.response?.data?.message || err.message || "Unable to initialize production payment.");
      setProductionStage("form");
    } finally {
      setProductionLoading(false);
    }
  }

  function handleRedirectToProductionPaystack() {
    if (productionDetails?.authorizationUrl) window.location.href = productionDetails.authorizationUrl;
  }

  function closeProductionModal() {
    setProductionPaymentOpen(false);
    setProductionError("");
    setProductionDetails(null);
    setProductionStage("form");
  }

  function handleRejectProduction() { setProductionDecision("rejected"); }

  // Derived
  const activeStepIndex = Math.max(0, sampleSteps.findIndex((s) => s.key === currentSampleStatus));
  const canDecideProduction = currentSampleStatus === "sample_ready" || currentSampleStatus === "completed";
  const productionTotal = orderData?.quote?.price || null;
  const balanceDue = productionTotal ? Math.max(0, productionTotal - SAMPLE_BASE_FEE) : null;

  return (
    <div className="space-y-6">
      {/* Header + pay CTA */}
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

        {/* No intent warning */}
        {!quoteIntent && !sampleOrderId ? (
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-[#E6D7CB] bg-[#FFF8EF] p-4 text-sm text-[#8B6A39]">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            <span>
              No product details found. Please go to{" "}
              <button className="font-semibold underline underline-offset-2" onClick={() => router.push("/new-order")}>
                New Order
              </button>{" "}
              and click "Request Sample" to set up your sample details first.
            </span>
          </div>
        ) : null}

        {error && !paymentOpen ? <p className="mt-3 text-sm text-[#B42318]">{error}</p> : null}

        {/* Pay button or paid badge */}
        {!sampleOrderId ? (
          <Button
            variant="accent"
            className="mt-6 w-full md:w-auto"
            onClick={handleOpenSamplePayment}
            disabled={!quoteIntent}
          >
            Pay Sample Fee — ₦30,000 (+ VAT)
          </Button>
        ) : (
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-[#2D6A4F14] px-3 py-1.5 text-xs font-semibold text-success">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Sample fee paid — tracking your order below
          </div>
        )}
      </div>

      {/* Progress stepper */}
      <div className="card p-6">
        <h2 className="text-lg font-semibold text-ink">Sample Progress</h2>
        <p className="mt-1 text-sm text-[#5A4A44]">Production orders are tracked separately in Order Tracker.</p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#7B6A62]">
          {progressLoading ? (
            <><Spinner size="xs" className="text-gold" /><span>Refreshing sample progress...</span></>
          ) : sampleOrderId ? (
            <><span className="inline-block h-2 w-2 rounded-full bg-success" /><span>Progress auto-updates every few seconds.</span></>
          ) : (
            <span>Pay the sample fee to start tracking your order.</span>
          )}
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {sampleSteps.map((step, index) => {
            const completed = index < activeStepIndex;
            const activeStep = index === activeStepIndex && !!sampleOrderId;
            return (
              <div
                key={step.key}
                className={`rounded-xl border p-4 ${
                  activeStep ? "border-[#C49A3C55] bg-[#FFF8EA]"
                  : completed ? "border-[#2D6A4F1A] bg-[#2D6A4F10]"
                  : "border-[#E8DED5] bg-white"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    activeStep ? "bg-gold text-espresso"
                    : completed ? "bg-success text-white"
                    : "bg-[#DCCFBE] text-[#6D5A51]"
                  }`}>
                    {completed ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
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
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8B6A39]">Sample Approved — Next Step</p>
            <h3 className="mt-2 text-base font-semibold text-ink">Pay production balance or reject this run</h3>
            <p className="mt-2 text-sm text-[#5A4A44]">
              Your ₦30,000 sample fee is deducted from the production total. Pay only the balance.
            </p>
            {productionTotal && balanceDue !== null ? (
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
                    {formatNaira(balanceDue)}
                    <span className="ml-1 text-xs font-normal text-[#7B6A62]">(+ VAT)</span>
                  </p>
                </div>
              </div>
            ) : (
              <p className="mt-3 text-sm text-[#7B6A62]">
                Production pricing is being finalised by our team. You will be notified when it is ready.
              </p>
            )}
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Button variant="accent" className="w-full sm:w-auto" onClick={handleOpenProductionPayment} disabled={!productionTotal}>
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
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8B6A39]">Paystack Secure Checkout</p>
            <p className="truncate text-sm text-[#5A4A44]">Sample fee — {formatNaira(SAMPLE_BASE_FEE)}</p>
          </div>
          <span className="inline-flex shrink-0 items-center rounded-full bg-[#2D6A4F14] px-2.5 py-1 text-[11px] font-semibold text-success">
            <ShieldCheck className="mr-1 h-3.5 w-3.5" />Secure
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
              <p className="mt-1 text-sm text-[#5A4A44]">Click below to complete payment on Paystack.</p>
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
                <p className="mt-1 font-semibold text-ink">{formatNaira(paymentDetails.vatAmount ?? getSamplePayment().vatAmount)}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-[#8B6A39]">Total Payable</p>
                <p className="mt-1 font-semibold text-ink">{formatNaira(paymentDetails.totalAmount ?? getSamplePayment().totalAmount)}</p>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button variant="accent" className="w-full sm:w-auto" onClick={handleRedirectToSamplePaystack}>Continue to Paystack</Button>
              <Button variant="outline" className="w-full sm:w-auto" onClick={closeSampleModal}>Close</Button>
            </div>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleInitiateSamplePayment}>
            <p className="text-sm text-[#5A4A44]">
              Pay the ₦30,000 flat sample fee via Paystack. VAT ({formatVatPercent()}) applies.
            </p>
            {quoteIntent ? (
              <div className="rounded-lg border border-[#E6D7CB] bg-white p-3 text-xs text-[#7B6A62]">
                <span className="font-semibold text-ink">Product: </span>
                {Array.isArray(quoteIntent.productType) ? quoteIntent.productType.join(", ") : quoteIntent.productType}
                {" · "}
                <span className="font-semibold text-ink">Qty: </span>{quoteIntent.quantity}
              </div>
            ) : null}
            <div>
              <label className="label">Email Address</label>
              <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@brand.com" required />
            </div>
            {error ? <p className="text-sm text-[#B42318]">{error}</p> : null}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="submit" variant="accent" disabled={loading} className="w-full sm:w-auto">
                {loading ? <span className="inline-flex items-center gap-2"><Spinner size="sm" className="text-espresso" /><span>Initializing...</span></span> : "Continue to Paystack"}
              </Button>
              <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={closeSampleModal}>Cancel</Button>
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
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#8B6A39]">Paystack Secure Checkout</p>
            <p className="truncate text-sm text-[#5A4A44]">Production balance — sample credit applied</p>
          </div>
          <span className="inline-flex shrink-0 items-center rounded-full bg-[#2D6A4F14] px-2.5 py-1 text-[11px] font-semibold text-success">
            <ShieldCheck className="mr-1 h-3.5 w-3.5" />Secure
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
              <p className="mt-1 text-sm text-[#5A4A44]">Redirecting you to Paystack to complete payment...</p>
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
              <Button variant="accent" className="w-full sm:w-auto" onClick={handleRedirectToProductionPaystack}>Continue to Paystack</Button>
              <Button variant="outline" className="w-full sm:w-auto" onClick={closeProductionModal}>Close</Button>
            </div>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleInitiateProductionPayment}>
            <p className="text-sm text-[#5A4A44]">
              Your ₦30,000 sample fee is deducted automatically. Funds are held in escrow until delivery is confirmed.
            </p>
            <div>
              <label className="label">Email Address</label>
              <input className="input" type="email" value={productionEmail} onChange={(e) => setProductionEmail(e.target.value)} placeholder="you@brand.com" required />
            </div>
            {productionError ? <p className="text-sm text-[#B42318]">{productionError}</p> : null}
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button type="submit" variant="accent" disabled={productionLoading} className="w-full sm:w-auto">
                {productionLoading ? <span className="inline-flex items-center gap-2"><Spinner size="sm" className="text-espresso" /><span>Initializing...</span></span> : "Continue to Paystack"}
              </Button>
              <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={closeProductionModal}>Cancel</Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Root export — switches between Info and Payment based on mode prop
// ---------------------------------------------------------------------------
export default function SampleInfoPage({ mode = "info" }) {
  if (mode === "payment") return <SamplePaymentView />;
  return <SampleInfoView />;
}
