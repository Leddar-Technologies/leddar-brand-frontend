// pages/order-tracker.jsx — Brand app
// Tracks sample orders (video review, corrections) and production orders (dispatch → delivery)
import { useEffect, useState, useCallback } from "react";
import {
  CheckCircle2, Circle, Package, Video, ThumbsUp, AlertTriangle,
  RefreshCw, ChevronDown, ChevronUp, Loader2, Clock, Truck, Star,
  PlayCircle,
} from "lucide-react";
import PageWrapper from "../components/layout/PageWrapper";
import Spinner from "../components/ui/Spinner";
import {
  getBrandOrders,
  approveSample,
  requestCorrection,
  confirmReceipt,
  presignBrandFile,
} from "../services/paymentService";
import { formatNaira } from "../utils/pricing";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------
const MAX_CORRECTIONS = 2;

const SAMPLE_STEPS = [
  {
    key: "SAMPLE_IN_PROGRESS",
    label: "Sample Started",
    sublabel: "Artisan is crafting your sample",
    icon: Clock,
    color: "amber",
  },
  {
    key: "VIDEO_UPLOADED",
    label: "Video Uploaded",
    sublabel: "Sample video ready for review",
    icon: Video,
    color: "blue",
  },
  {
    key: "SAMPLE_APPROVED",
    label: "Approved",
    sublabel: "You approved the sample",
    icon: ThumbsUp,
    color: "emerald",
  },
  {
    key: "SAMPLE_COMPLETED",
    label: "Completed",
    sublabel: "Sample confirmed by Leddar",
    icon: Star,
    color: "emerald",
  },
];

const PROD_STEPS = [
  {
    key: "BALANCE_PAID",
    label: "Payment Confirmed",
    sublabel: "Production payment received",
    icon: CheckCircle2,
    color: "emerald",
  },
  {
    key: "IN_PRODUCTION",
    label: "In Production",
    sublabel: "Your order is being crafted",
    icon: Clock,
    color: "amber",
  },
  {
    key: "PENDING_DELIVERY",
    label: "Ready for Dispatch",
    sublabel: "Awaiting courier pickup",
    icon: Package,
    color: "purple",
  },
  {
    key: "SHIPPED",
    label: "Dispatched",
    sublabel: "On its way to you",
    icon: Truck,
    color: "blue",
  },
  {
    key: "DELIVERED",
    label: "Delivered",
    sublabel: "Order received",
    icon: Star,
    color: "emerald",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function getSampleActiveStep(orderStatus, jobStatus) {
  if (orderStatus === "SAMPLE_COMPLETED") return 3;
  if (orderStatus === "SAMPLE_APPROVED" || jobStatus === "sample_approved") return 2;
  if (jobStatus === "video_uploaded" || jobStatus === "correction_requested") return 1;
  return 0;
}

function getProdActiveStep(orderStatus, jobStatus) {
  if (orderStatus === "DELIVERED")                                            return 4;
  if (orderStatus === "SHIPPED"        || jobStatus === "dispatched")         return 3;
  if (orderStatus === "PENDING_DELIVERY" || jobStatus === "pending_delivery") return 2;
  // IN_PRODUCTION is the only reliable signal that payment was confirmed (set by webhook).
  // Do NOT include jobStatus "in_progress" — a job can be assigned/started before the brand pays.
  if (orderStatus === "IN_PRODUCTION")                                         return 1;
  if (orderStatus === "BALANCE_PAID")                                         return 0;
  return -1; // not yet paid — no step active
}

const COLOR_MAP = {
  amber:   { ring: "ring-amber-400",   bg: "bg-amber-400",   text: "text-amber-600",   light: "bg-amber-50",   border: "border-amber-200",   line: "bg-amber-300" },
  blue:    { ring: "ring-blue-400",    bg: "bg-blue-500",    text: "text-blue-600",    light: "bg-blue-50",    border: "border-blue-200",    line: "bg-blue-300" },
  emerald: { ring: "ring-emerald-400", bg: "bg-emerald-500", text: "text-emerald-600", light: "bg-emerald-50", border: "border-emerald-200", line: "bg-emerald-400" },
  purple:  { ring: "ring-purple-400",  bg: "bg-purple-500",  text: "text-purple-600",  light: "bg-purple-50",  border: "border-purple-200",  line: "bg-purple-300" },
  gold:    { ring: "ring-[#C9A84C]",   bg: "bg-[#C9A84C]",   text: "text-[#9A7B2E]",  light: "bg-[#FFF8EA]",  border: "border-[#E8D89A]",   line: "bg-[#E8C96A]" },
};

// ---------------------------------------------------------------------------
// StepTimeline — beautiful vertical timeline (mobile-first, horizontal on lg+)
// ---------------------------------------------------------------------------
function StepTimeline({ steps, activeStep }) {
  return (
    <>
      {/* ── Vertical timeline (default / mobile) ── */}
      <div className="flex flex-col gap-0 lg:hidden">
        {steps.map((step, index) => {
          const completed = index < activeStep;
          const active    = index === activeStep;
          const pending   = index > activeStep;
          const isLast    = index === steps.length - 1;
          const c         = completed ? COLOR_MAP.emerald : active ? COLOR_MAP[step.color] : COLOR_MAP.gold;
          const Icon      = step.icon;

          return (
            <div key={step.key} className="flex gap-3">
              {/* Icon column */}
              <div className="flex flex-col items-center">
                <div className={`relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                  completed
                    ? "bg-emerald-500 shadow-md shadow-emerald-200"
                    : active
                    ? `${c.bg} shadow-md ring-4 ring-offset-1 ${c.ring}/40`
                    : "border-2 border-[#E8DED5] bg-white"
                }`}>
                  {completed ? (
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  ) : active ? (
                    <>
                      <Icon className="h-4 w-4 text-white" />
                      {/* pulse ring */}
                      <span className={`absolute inset-0 animate-ping rounded-full opacity-20 ${c.bg}`} />
                    </>
                  ) : (
                    <Icon className="h-3.5 w-3.5 text-[#C5B5AB]" />
                  )}
                </div>
                {!isLast && (
                  <div className={`mt-1 w-0.5 flex-1 min-h-[24px] rounded-full transition-colors ${
                    completed ? "bg-emerald-300" : "bg-[#EDE5DC]"
                  }`} />
                )}
              </div>

              {/* Content */}
              <div className={`pb-5 ${isLast ? "pb-0" : ""}`}>
                <p className={`text-sm font-semibold leading-tight ${
                  completed ? "text-emerald-700" : active ? c.text : "text-[#9B8A82]"
                }`}>
                  {step.label}
                </p>
                <p className={`mt-0.5 text-[11px] leading-snug ${
                  active ? "text-ink" : "text-[#B0A098]"
                }`}>
                  {step.sublabel}
                </p>
                {active && (
                  <span className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${c.light} ${c.text}`}>
                    Current
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Horizontal timeline (lg+) ── */}
      <div className="hidden lg:flex items-start gap-0">
        {steps.map((step, index) => {
          const completed = index < activeStep;
          const active    = index === activeStep;
          const isLast    = index === steps.length - 1;
          const c         = completed ? COLOR_MAP.emerald : active ? COLOR_MAP[step.color] : COLOR_MAP.gold;
          const Icon      = step.icon;

          return (
            <div key={step.key} className="flex flex-1 flex-col items-center">
              {/* Dot + connector row */}
              <div className="flex w-full items-center">
                {/* Left connector */}
                {index > 0 && (
                  <div className={`h-0.5 flex-1 transition-colors ${
                    index <= activeStep ? "bg-emerald-400" : "bg-[#EDE5DC]"
                  }`} />
                )}

                {/* Dot */}
                <div className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-all duration-300 ${
                  completed
                    ? "bg-emerald-500 shadow-md shadow-emerald-200"
                    : active
                    ? `${c.bg} shadow-lg ring-4 ring-offset-2 ${c.ring}/50`
                    : "border-2 border-[#E8DED5] bg-white"
                }`}>
                  {completed ? (
                    <CheckCircle2 className="h-5 w-5 text-white" />
                  ) : active ? (
                    <>
                      <Icon className="h-5 w-5 text-white" />
                      <span className={`absolute inset-0 animate-ping rounded-full opacity-20 ${c.bg}`} />
                    </>
                  ) : (
                    <Icon className="h-4 w-4 text-[#C5B5AB]" />
                  )}
                </div>

                {/* Right connector */}
                {!isLast && (
                  <div className={`h-0.5 flex-1 transition-colors ${
                    completed ? "bg-emerald-400" : "bg-[#EDE5DC]"
                  }`} />
                )}
              </div>

              {/* Labels */}
              <div className="mt-2.5 px-1 text-center">
                <p className={`text-xs font-semibold leading-tight ${
                  completed ? "text-emerald-700" : active ? c.text : "text-[#9B8A82]"
                }`}>
                  {step.label}
                </p>
                <p className={`mt-0.5 text-[10px] leading-snug ${
                  active ? "text-[#5A4D47]" : "text-[#B0A098]"
                }`}>
                  {step.sublabel}
                </p>
                {active && (
                  <span className={`mt-1 inline-block rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${c.light} ${c.text}`}>
                    Now
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// SampleOrderCard
// ---------------------------------------------------------------------------
function SampleOrderCard({ order, linkedProduction, onRefresh }) {
  const [expanded, setExpanded]         = useState(true);
  const [corrNote, setCorrNote]         = useState("");
  const [submitting, setSubmitting]     = useState(false);
  const [actionErr, setActionErr]       = useState("");
  const [showNoteBox, setShowNoteBox]   = useState(false);
  const [signedVideoUrl, setSignedVideoUrl] = useState(null);
  const [videoLoading, setVideoLoading] = useState(false);

  const job = order.jobs?.find((j) => j.type === "SAMPLE");
  const jobStatus = job?.status?.toLowerCase() || "";

  // Legacy PATH A data: production job may be attached directly to the sample order
  // (old bug set resolvedOrderId to the sample order's ID, creating a PRODUCTION job on it).
  // For new flow this is null — production is on the separate linkedProduction order.
  const productionJob = order.jobs?.find((j) => j.type === "PRODUCTION");

  // Sample is effectively done when:
  //   - status is SAMPLE_COMPLETED (normal flow), OR
  //   - a production job exists on this order (legacy PATH A: sample order got IN_PRODUCTION status)
  const sampleIsDone = order.status === "SAMPLE_COMPLETED" || !!productionJob;

  const videoVisible = job?.brandVideoVisible && job?.video?.url;
  const correctionCount = job?.correctionCount ?? 0;
  const correctionNote  = job?.correctionNote  ?? "";
  // When sample is done, always show step 3 (completed)
  const activeStep = sampleIsDone ? 3 : getSampleActiveStep(order.status, jobStatus);
  const productType = order.quote?.productType?.[0] || "Leather Product";

  const canReview = !sampleIsDone
    && videoVisible
    && !["sample_approved","sample_completed"].includes(jobStatus)
    && order.status !== "SAMPLE_COMPLETED";

  // Presign video when card is expanded and video is visible
  useEffect(() => {
    if (!expanded || !videoVisible || !job?.video?.url) {
      setSignedVideoUrl(null);
      return;
    }
    setVideoLoading(true);
    setSignedVideoUrl(null);
    presignBrandFile(job.video.url)
      .then((url) => setSignedVideoUrl(url))
      .catch(() => setSignedVideoUrl(job.video.url)) // fallback to raw URL
      .finally(() => setVideoLoading(false));
  }, [expanded, videoVisible, job?.video?.url]);

  async function handleApprove() {
    if (!job) return;
    setSubmitting(true); setActionErr("");
    try {
      await approveSample(job.id);
      onRefresh();
    } catch (e) {
      setActionErr(e?.response?.data?.message || e.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleRequestCorrection() {
    if (!job || !corrNote.trim()) {
      setActionErr("Please enter feedback for the artisan.");
      return;
    }
    setSubmitting(true); setActionErr("");
    try {
      await requestCorrection(job.id, corrNote.trim());
      setCorrNote(""); setShowNoteBox(false);
      onRefresh();
    } catch (e) {
      setActionErr(e?.response?.data?.message || e.message);
    } finally {
      setSubmitting(false);
    }
  }

  const statusMeta = (() => {
    // sampleIsDone covers SAMPLE_COMPLETED (normal) and legacy IN_PRODUCTION-on-sample-order
    if (sampleIsDone)                                                            return { label: "Completed",            cls: "bg-emerald-50 text-emerald-700" };
    if (jobStatus === "correction_requested")                                    return { label: `Correction (${correctionCount}/${MAX_CORRECTIONS})`, cls: "bg-amber-50 text-amber-700" };
    if (jobStatus === "video_uploaded")                                          return { label: "Awaiting Review",      cls: "bg-blue-50 text-blue-700" };
    if (jobStatus === "sample_approved" || order.status === "SAMPLE_APPROVED")  return { label: "Approved",             cls: "bg-emerald-50 text-emerald-700" };
    if (order.status === "FLAT_FEE_PAID")                                        return { label: "Setting Up",          cls: "bg-purple-50 text-purple-700" };
    return { label: "In Progress", cls: "bg-[#FFF8EA] text-[#9A7B2E]" };
  })();

  return (
    <div className="rounded-2xl border border-[#E8DED5] bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-[#FDFAF6] transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-amber-50 text-amber-600 shadow-sm">
            <Video size={17} />
          </span>
          <div>
            <p className="font-semibold text-ink text-sm">{productType}</p>
            <p className="text-xs text-[#7B6A62]">
              Sample · {new Date(order.createdAt).toLocaleDateString("en-NG")}
              {order.flatFeePaid ? ` · ${formatNaira(order.flatFeePaid)} paid` : ""}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="font-mono text-[10px] font-semibold text-[#C49A3C] bg-[#FFF8EA] border border-[#E8D89A] rounded px-1.5 py-0.5">
                #{order.ref}
              </span>
              {order.quote?.ref && (
                <span className="font-mono text-[10px] font-semibold text-[#6A5B54] bg-[#F4EFEA] border border-[#E8DED5] rounded px-1.5 py-0.5">
                  [{order.quote.ref}]
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusMeta.cls}`}>
            {statusMeta.label}
          </span>
          {expanded
            ? <ChevronUp size={16} className="text-[#9B8A82]" />
            : <ChevronDown size={16} className="text-[#9B8A82]" />
          }
        </div>
      </button>

      {expanded && (
        <div className="border-t border-[#F0E9E2] px-5 pb-6 pt-5 space-y-5">
          {/* Timeline */}
          <StepTimeline steps={SAMPLE_STEPS} activeStep={activeStep} />

          {/* Correction feedback */}
          {jobStatus === "correction_requested" && correctionNote && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3.5">
              <p className="text-[11px] font-bold text-amber-700 uppercase tracking-wide mb-1.5">
                Your Feedback · Revision {correctionCount}/{MAX_CORRECTIONS}
              </p>
              <p className="text-xs text-amber-900 leading-relaxed">{correctionNote}</p>
            </div>
          )}

          {/* Video player */}
          {videoVisible ? (
            <div className="rounded-xl overflow-hidden bg-black shadow-md">
              {videoLoading ? (
                <div className="flex h-48 items-center justify-center gap-2 text-white/60 text-sm">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading video…
                </div>
              ) : signedVideoUrl ? (
                <video
                  key={signedVideoUrl}
                  src={signedVideoUrl}
                  controls
                  className="w-full max-h-72 object-contain"
                  preload="metadata"
                />
              ) : (
                <div className="flex h-48 flex-col items-center justify-center gap-2 text-white/60 text-sm">
                  <PlayCircle className="h-8 w-8 opacity-40" />
                  Video unavailable
                </div>
              )}
            </div>
          ) : (
            jobStatus === "video_uploaded" && !job?.brandVideoVisible && (
              <div className="rounded-xl border border-[#E8DED5] bg-[#FDFAF6] px-4 py-3 text-center">
                <p className="text-xs text-[#7B6A62]">
                  Video is being reviewed by the Leddar team before being shared with you.
                </p>
              </div>
            )
          )}

          {/* Review actions */}
          {canReview && (
            <div className="space-y-3 pt-1">
              {correctionCount >= MAX_CORRECTIONS && (
                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-xs text-red-700">
                  Maximum corrections reached ({MAX_CORRECTIONS}). You can only approve at this point.
                </div>
              )}

              {actionErr && <p className="text-xs text-red-600">{actionErr}</p>}

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleApprove}
                  disabled={submitting}
                  className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 transition-colors shadow-sm"
                >
                  <ThumbsUp size={15} />
                  {submitting ? "Approving…" : "Approve Sample"}
                </button>

                {correctionCount < MAX_CORRECTIONS && (
                  <button
                    onClick={() => setShowNoteBox((v) => !v)}
                    disabled={submitting}
                    className="flex items-center gap-1.5 rounded-xl border border-amber-400 bg-amber-50 px-4 py-2.5 text-sm font-semibold text-amber-700 hover:bg-amber-100 disabled:opacity-60 transition-colors"
                  >
                    <AlertTriangle size={15} />
                    Request Correction ({correctionCount}/{MAX_CORRECTIONS})
                  </button>
                )}
              </div>

              {showNoteBox && (
                <div className="space-y-2 pt-1">
                  <textarea
                    rows={3}
                    value={corrNote}
                    onChange={(e) => setCorrNote(e.target.value)}
                    placeholder="Describe what needs to be corrected…"
                    className="w-full rounded-xl border border-[#E8DED5] bg-[#FDFAF6] px-3 py-2 text-sm text-ink placeholder-[#9B8A82] focus:border-gold focus:outline-none focus:ring-1 focus:ring-gold/30"
                  />
                  <button
                    onClick={handleRequestCorrection}
                    disabled={submitting || !corrNote.trim()}
                    className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-600 disabled:opacity-60 transition-colors"
                  >
                    {submitting ? "Sending…" : "Send Correction Request"}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Completed / approved banners */}
          {/* Only show the "setting up" nudge when sample is done but no production progress yet */}
          {sampleIsDone && !linkedProduction && !productionJob && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center">
              <p className="text-sm font-semibold text-emerald-700">Sample approved and completed ✓</p>
              <p className="mt-0.5 text-xs text-emerald-600">Your production order is being set up.</p>
            </div>
          )}
          {jobStatus === "sample_approved" && !sampleIsDone && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center">
              <p className="text-sm font-semibold text-emerald-700">Sample approved ✓</p>
              <p className="mt-0.5 text-xs text-emerald-600">Waiting for Leddar to confirm and set up production.</p>
            </div>
          )}

          {/* ── Production continuation ── */}
          {/* Shows when sample is done AND production exists:
              - linkedProduction: new flow (separate PRODUCTION order via quoteId)
              - productionJob: legacy PATH A (production job attached to the sample order) */}
          {sampleIsDone && (linkedProduction || productionJob) && (() => {
            const prodOrder = linkedProduction || order;
            const brandHasPaid = ["IN_PRODUCTION","PENDING_DELIVERY","SHIPPED","DELIVERED"].includes(prodOrder.status);
            if (!brandHasPaid) return (
              <div className="mt-4 rounded-xl border border-[#E8DED5] bg-[#FFF8EF] px-4 py-3 text-sm text-[#8B6A39]">
                Your sample has been confirmed. Once you pay the production balance from <strong>My Quotes</strong>, production will begin here.
              </div>
            );
            return (
              <ProductionInlineSection
                productionOrder={prodOrder}
                onRefresh={onRefresh}
              />
            );
          })()}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ProductionInlineSection
// Embedded inside SampleOrderCard once the sample is COMPLETED.
// Shows the production pipeline as a seamless continuation of the journey.
// ---------------------------------------------------------------------------
function ProductionInlineSection({ productionOrder, onRefresh }) {
  const [submitting, setSubmitting] = useState(false);
  const [actionErr, setActionErr]   = useState("");

  const job       = productionOrder.jobs?.find((j) => j.type === "PRODUCTION");
  const jobStatus = job?.status?.toLowerCase() || "";
  const activeStep = getProdActiveStep(productionOrder.status, jobStatus);
  const canConfirm = jobStatus === "dispatched";

  async function handleConfirmReceipt() {
    if (!job) return;
    setSubmitting(true); setActionErr("");
    try {
      await confirmReceipt(job.id);
      onRefresh();
    } catch (e) {
      setActionErr(e?.response?.data?.message || e.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mt-4 border-t-2 border-dashed border-[#E8DED5] pt-5 space-y-4">
      {/* Section header */}
      <div className="flex items-center gap-2">
        <div className="h-px flex-1 bg-[#EDE5DC]" />
        <span className="flex items-center gap-1.5 rounded-full bg-[#FFF8EA] px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-[#9A7B2E]">
          <Package size={11} />
          Production Progress
        </span>
        <div className="h-px flex-1 bg-[#EDE5DC]" />
      </div>

      {/* Production pipeline */}
      <StepTimeline steps={PROD_STEPS} activeStep={activeStep} />

      {actionErr && <p className="text-xs text-red-600">{actionErr}</p>}

      {/* Confirm receipt */}
      {canConfirm && (
        <button
          onClick={handleConfirmReceipt}
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 transition-colors shadow-sm"
        >
          <CheckCircle2 size={16} />
          {submitting ? "Confirming…" : "Confirm Receipt"}
        </button>
      )}

      {productionOrder.status === "DELIVERED" && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center">
          <p className="text-sm font-semibold text-emerald-700">Order delivered ✓</p>
          <p className="mt-0.5 text-xs text-emerald-600">Thank you for your order!</p>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// ProductionOrderCard
// ---------------------------------------------------------------------------
function ProductionOrderCard({ order, onRefresh }) {
  const [expanded, setExpanded]     = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [actionErr, setActionErr]   = useState("");

  const job = order.jobs?.find((j) => j.type === "PRODUCTION");
  const jobStatus = job?.status?.toLowerCase() || "";

  const activeStep = getProdActiveStep(order.status, jobStatus);
  const productType = order.quote?.productType?.[0] || "Leather Product";
  const canConfirm  = jobStatus === "dispatched";

  async function handleConfirmReceipt() {
    if (!job) return;
    setSubmitting(true); setActionErr("");
    try {
      await confirmReceipt(job.id);
      onRefresh();
    } catch (e) {
      setActionErr(e?.response?.data?.message || e.message);
    } finally {
      setSubmitting(false);
    }
  }

  const statusMeta = (() => {
    if (order.status === "DELIVERED")                                                       return { label: "Delivered",            cls: "bg-emerald-50 text-emerald-700" };
    if (jobStatus === "dispatched" || order.status === "SHIPPED")                           return { label: "Dispatched",           cls: "bg-blue-50 text-blue-700" };
    if (jobStatus === "pending_delivery" || order.status === "PENDING_DELIVERY")            return { label: "Ready for Dispatch",   cls: "bg-purple-50 text-purple-700" };
    if (order.status === "BALANCE_PAID")                                                    return { label: "Setting Up",           cls: "bg-purple-50 text-purple-700" };
    return { label: "In Production", cls: "bg-[#FFF8EA] text-[#9A7B2E]" };
  })();

  return (
    <div className="rounded-2xl border border-[#E8DED5] bg-white shadow-sm overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-[#FDFAF6] transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-blue-50 text-blue-600 shadow-sm">
            <Package size={17} />
          </span>
          <div>
            <p className="font-semibold text-ink text-sm">{productType}</p>
            <p className="text-xs text-[#7B6A62]">
              Production · {new Date(order.createdAt).toLocaleDateString("en-NG")}
              {order.totalAmount ? ` · ${formatNaira(order.totalAmount)}` : ""}
            </p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="font-mono text-[10px] font-semibold text-[#C49A3C] bg-[#FFF8EA] border border-[#E8D89A] rounded px-1.5 py-0.5">
                #{order.ref}
              </span>
              {order.quote?.ref && (
                <span className="font-mono text-[10px] font-semibold text-[#6A5B54] bg-[#F4EFEA] border border-[#E8DED5] rounded px-1.5 py-0.5">
                  [{order.quote.ref}]
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${statusMeta.cls}`}>
            {statusMeta.label}
          </span>
          {expanded
            ? <ChevronUp size={16} className="text-[#9B8A82]" />
            : <ChevronDown size={16} className="text-[#9B8A82]" />
          }
        </div>
      </button>

      {expanded && (
        <div className="border-t border-[#F0E9E2] px-5 pb-6 pt-5 space-y-5">
          <StepTimeline steps={PROD_STEPS} activeStep={activeStep} />

          {actionErr && <p className="text-xs text-red-600">{actionErr}</p>}

          {canConfirm && (
            <button
              onClick={handleConfirmReceipt}
              disabled={submitting}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 transition-colors shadow-sm"
            >
              <CheckCircle2 size={16} />
              {submitting ? "Confirming…" : "Confirm Receipt"}
            </button>
          )}

          {order.status === "DELIVERED" && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-center">
              <p className="text-sm font-semibold text-emerald-700">Order delivered ✓</p>
              <p className="mt-0.5 text-xs text-emerald-600">Thank you for your order!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------
export default function OrderTrackerPage() {
  const [sample, setSample]         = useState([]);
  const [production, setProduction] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState("");

  const load = useCallback(() => {
    setLoading(true);
    getBrandOrders()
      .then((data) => {
        setSample(data.sample || []);
        setProduction(data.production || []);
        setError("");
      })
      .catch((err) => setError(err.message || "Failed to load orders."))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const hasContent = sample.length > 0 || production.length > 0;

  return (
    <PageWrapper>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="page-title">Order Tracker</h1>
          <p className="page-subtitle mt-1">Review samples, request corrections, and track delivery.</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="mt-1 rounded-xl border border-[#E8DED5] bg-white p-2 text-[#6A5B54] hover:bg-[#FDFAF6] transition-colors"
          title="Refresh"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {loading ? (
        <div className="mt-10 flex justify-center"><Spinner size="lg" className="text-gold" /></div>
      ) : error ? (
        <p className="mt-6 text-sm text-[#B42318]">{error}</p>
      ) : !hasContent ? (
        <div className="mt-10 rounded-xl border border-[#E8DED5] bg-white p-10 text-center">
          <Package className="mx-auto h-10 w-10 text-[#DCCFBE]" />
          <p className="mt-3 text-sm font-semibold text-ink">No active orders</p>
          <p className="mt-1 text-xs text-[#7B6A62]">
            Your sample and production orders will appear here once payment is confirmed.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-8">
          {(() => {
            // Map each production order to its sample counterpart by quoteId
            // so we can embed production progress inside the completed sample card.
            const prodByQuoteId = {};
            production.forEach((p) => { if (p.quoteId) prodByQuoteId[p.quoteId] = p; });

            // Production orders NOT linked to any sample (standalone direct orders)
            const linkedQuoteIds = new Set(sample.map((s) => s.quoteId).filter(Boolean));
            const standaloneProduction = production.filter(
              (p) => !p.quoteId || !linkedQuoteIds.has(p.quoteId),
            );

            return (
              <>
                {sample.length > 0 && (
                  <section>
                    <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#9B8A82]">
                      Sample Orders
                    </h2>
                    <div className="space-y-4">
                      {sample.map((order) => (
                        <SampleOrderCard
                          key={order.id}
                          order={order}
                          linkedProduction={order.quoteId ? (prodByQuoteId[order.quoteId] ?? null) : null}
                          onRefresh={load}
                        />
                      ))}
                    </div>
                  </section>
                )}

                {standaloneProduction.length > 0 && (
                  <section>
                    <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-[#9B8A82]">
                      Production Orders
                    </h2>
                    <div className="space-y-4">
                      {standaloneProduction.map((order) => (
                        <ProductionOrderCard key={order.id} order={order} onRefresh={load} />
                      ))}
                    </div>
                  </section>
                )}
              </>
            );
          })()}
        </div>
      )}
    </PageWrapper>
  );
}
