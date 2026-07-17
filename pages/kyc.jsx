// pages/kyc.jsx — Brand KYC
// 3-step: NIN → CAC (Business) → Business Profile
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import {
  ShieldCheck, AlertCircle, CheckCircle2, RefreshCw,
  MapPin, ChevronRight, ChevronLeft,
  Lock, FileText, Loader2, Building2, Fingerprint,
} from "lucide-react";
import PageWrapper from "../components/layout/PageWrapper";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import Spinner from "../components/ui/Spinner";
import {
  getKycStatus, verifyNIN, verifyCAC, retryKycVerification, saveBrandProfile,
} from "../services/authService";

const NG_STATES = [
  "Abia","Adamawa","Akwa Ibom","Anambra","Bauchi","Bayelsa","Benue","Borno",
  "Cross River","Delta","Ebonyi","Edo","Ekiti","Enugu","FCT Abuja","Gombe",
  "Imo","Jigawa","Kaduna","Kano","Katsina","Kebbi","Kogi","Kwara","Lagos",
  "Nasarawa","Niger","Ogun","Ondo","Osun","Oyo","Plateau","Rivers","Sokoto",
  "Taraba","Yobe","Zamfara",
];

// CAC registration number prefixes — must match the QoreID cac-basic format (RC1234, BN1234, IT1234)
const CAC_TYPES = [
  { code: "RC", label: "Limited Company",       desc: "For registered companies (Ltd, PLC, etc.)" },
  { code: "BN", label: "Business Name",         desc: "For sole proprietorships / enterprises" },
  { code: "IT", label: "Incorporated Trustees", desc: "For NGOs, associations, foundations" },
];

const STEPS = [
  { id: 1, label: "Personal ID (NIN)", icon: Fingerprint  },
  { id: 2, label: "Business (CAC)",    icon: Building2    },
  { id: 3, label: "Business Profile",  icon: MapPin       },
];

// Maps a per-type status string ("verified"/"rejected"/null) → display config
const typeStatusCfg = (s) => {
  if (s === "verified") return { label: "Verified ✓", cls: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  if (s === "rejected") return { label: "Failed",     cls: "bg-red-50    text-red-700    border-red-200"     };
  return                       { label: "Pending",    cls: "bg-[#FFF8EA] text-[#8B6A39] border-[#E8DED5]"  };
};

export default function KycPage() {
  const router = useRouter();
  const [kycProfile, setKycProfile] = useState({ status: "not_started", ninStatus: "not_started", cacStatus: "not_started" });
  const [busy, setBusy]             = useState(true);
  const [modalOpen, setModalOpen]   = useState(false);
  const [step, setStep]             = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [stepError, setStepError]   = useState("");

  // Step 1 — NIN
  const [nin, setNin]           = useState("");
  const [firstName, setFirst]   = useState("");
  const [lastName,  setLast]    = useState("");
  const [dob,       setDob]     = useState("");

  // Step 2 — CAC
  const [businessType,    setBusinessType]    = useState("");   // "RC" | "BN" | "IT"
  const [regNumberDigits, setRegNumberDigits]  = useState("");  // just the digits, prefix added on submit
  const [companyName,  setCompanyName]  = useState("");

  // Step 3 — Business Profile
  const [state,       setState]       = useState("");
  const [workAddress, setWorkAddress] = useState("");

  const returnUrl = typeof router.query.returnUrl === "string"
    ? router.query.returnUrl : "/dashboard";

  useEffect(() => {
    getKycStatus()
      .then((p) => setKycProfile(p || { status: "not_started", ninStatus: "not_started", cacStatus: "not_started" }))
      .catch(() => {})
      .finally(() => setBusy(false));
  }, []);

  const isVerified   = kycProfile.status === "verified";
  const ninVerified  = kycProfile.ninStatus === "verified";
  const cacVerified  = kycProfile.cacStatus === "verified";

  // Where to resume the modal — skip already-verified steps
  function getResumeStep() {
    if (!ninVerified) return 1;
    if (!cacVerified) return 2;
    return 3;
  }

  function openModal() {
    setStep(getResumeStep());
    setStepError("");
    setNin(""); setFirst(""); setLast(""); setDob("");
    setBusinessType(""); setRegNumberDigits(""); setCompanyName("");
    setState(""); setWorkAddress("");
    setModalOpen(true);
  }

  function handleRetry() {
    retryKycVerification();
    setKycProfile({ status: "not_started", ninStatus: "not_started", cacStatus: "not_started" });
    openModal();
  }

  // ── Step 1: NIN ──────────────────────────────────────────────────────────────
  async function handleStep1(e) {
    e.preventDefault();
    setStepError("");
    setSubmitting(true);
    try {
      const ninStatus = await verifyNIN({ nin: nin.trim(), firstName: firstName.trim(), lastName: lastName.trim(), dob });
      setKycProfile((p) => ({ ...p, ninStatus }));
      if (ninStatus === "verified") {
        setStep(2);
      } else {
        setStepError("NIN could not be verified. Please check your details and try again.");
      }
    } catch (err) {
      setStepError(err.message || "Verification failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Step 2: CAC ──────────────────────────────────────────────────────────────
  async function handleStep2(e) {
    e.preventDefault();
    setStepError("");
    if (!businessType) { setStepError("Please select your business type."); return; }
    if (!regNumberDigits.trim()) { setStepError("Please enter your registration number."); return; }
    setSubmitting(true);
    try {
      const rcNumber = `${businessType}${regNumberDigits.trim()}`;
      const cacStatus = await verifyCAC({ rcNumber, companyName: companyName.trim() });
      setKycProfile((p) => ({ ...p, cacStatus }));
      if (cacStatus === "verified") {
        setStep(3);
      } else {
        setStepError("Business could not be verified. Please check your RC number and company name.");
      }
    } catch (err) {
      setStepError(err.message || "Verification failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Step 3: Business Profile ──────────────────────────────────────────────────
  async function handleStep3(e) {
    e.preventDefault();
    setStepError("");
    if (!state)              { setStepError("Please select your state."); return; }
    if (!workAddress.trim()) { setStepError("Please enter your work address."); return; }
    setSubmitting(true);
    try {
      await saveBrandProfile({ state, workAddress });
      setModalOpen(false);
      setKycProfile((p) => ({ ...p, status: "verified" }));
      setTimeout(() => router.push(returnUrl), 800);
    } catch (err) {
      setStepError(err.message || "Failed to save profile.");
    } finally {
      setSubmitting(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  const overallBorder = isVerified
    ? "border-emerald-200 bg-emerald-50/40"
    : kycProfile.status === "rejected"
    ? "border-red-200 bg-red-50/40"
    : "border-[#E8DED5] bg-white";

  return (
    <PageWrapper>
      <div className="mx-auto max-w-2xl py-8 space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8A7A72]">Account Setup</p>
          <h1 className="mt-2 text-2xl font-semibold text-ink md:text-3xl">Identity & Business Verification</h1>
          <p className="mt-1 text-sm text-[#5A4A44]">
            Complete all 3 steps to unlock orders and payments on your account.
          </p>
        </div>

        {/* ── Overall status card ── */}
        <div className={`rounded-2xl border p-6 sm:p-8 ${overallBorder}`}>
          <div className="flex flex-col sm:flex-row items-start gap-5">
            <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
              isVerified ? "bg-emerald-50 text-emerald-600" : "bg-[#FFF8EA] text-[#8B6A39]"
            }`}>
              {isVerified ? <CheckCircle2 className="h-7 w-7" /> : <ShieldCheck className="h-7 w-7" />}
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-semibold text-ink">
                {isVerified ? "Account Fully Verified ✓" : "Complete Your Verification"}
              </h2>
              <p className="mt-1 text-sm text-[#5A4A44]">
                {isVerified
                  ? "Your identity and business are verified. Orders and payments are unlocked."
                  : "All 3 checks are required before you can place an order."}
              </p>

              {/* Per-step status pills */}
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  { label: "NIN",     status: kycProfile.ninStatus },
                  { label: "CAC",     status: kycProfile.cacStatus },
                  { label: "Profile", status: isVerified ? "verified" : "not_started" },
                ].map(({ label, status }) => {
                  const cfg = typeStatusCfg(status);
                  return (
                    <span key={label} className={`rounded-full border px-3 py-1 text-xs font-semibold ${cfg.cls}`}>
                      {label}: {cfg.label}
                    </span>
                  );
                })}
              </div>

              {!isVerified && (
                <Button variant="accent" className="mt-5 inline-flex items-center gap-2"
                  onClick={kycProfile.ninStatus === "rejected" || kycProfile.cacStatus === "rejected" ? handleRetry : openModal}
                  disabled={busy}>
                  {kycProfile.ninStatus === "rejected" || kycProfile.cacStatus === "rejected"
                    ? <><RefreshCw className="h-4 w-4" /> Retry Failed Step</>
                    : <><ShieldCheck className="h-4 w-4" /> {ninVerified && cacVerified ? "Complete Profile" : ninVerified ? "Continue (CAC)" : "Start Verification"}</>
                  }
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}
              {isVerified && (
                <button onClick={() => router.push(returnUrl)}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:underline">
                  <CheckCircle2 className="h-4 w-4" /> Continue to dashboard
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Trust footer */}
        <div className="flex justify-center">
          <div className="flex items-center gap-2 rounded-full border border-[#E8DED5] bg-white px-4 py-2">
            <ShieldCheck className="h-3.5 w-3.5 text-[#9B8A82]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#9B8A82]">
              Secured by QoreID · AES-256 Encrypted
            </span>
          </div>
        </div>
      </div>

      {/* ── 3-Step Modal ── */}
      <Modal open={modalOpen} onClose={() => { if (!submitting) setModalOpen(false); }}
        title={`Step ${step} of 3 — ${STEPS[step - 1]?.label}`}>
        <div className="space-y-5">

          {/* Progress bar */}
          <div className="flex items-center gap-2">
            {STEPS.map((s, i) => {
              const Icon     = s.icon;
              const done     = (s.id === 1 && ninVerified) || (s.id === 2 && cacVerified);
              const active   = step === s.id;
              return (
                <div key={s.id} className="flex flex-1 items-center gap-2">
                  <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-colors ${
                    done   ? "bg-emerald-500 text-white"
                    : active ? "bg-leather text-white"
                    : "bg-[#F0EDE8] text-[#9B8A82]"
                  }`}>
                    {done ? <CheckCircle2 className="h-4 w-4" /> : s.id}
                  </div>
                  <span className={`hidden sm:inline text-xs font-medium ${active || done ? "text-ink" : "text-[#9B8A82]"}`}>
                    {s.label}
                  </span>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 ${done ? "bg-emerald-400" : "bg-[#E8DED5]"}`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* ── STEP 1: NIN ── */}
          {step === 1 && (
            <form onSubmit={handleStep1} className="space-y-4">
              <p className="text-sm text-[#5A4A44]">
                Enter your personal NIN details exactly as they appear on your ID card.
              </p>
              <div>
                <label className="label text-xs">NIN (11 digits) <span className="text-red-500">*</span></label>
                <input className="input" required placeholder="e.g. 12345678901"
                  value={nin} onChange={(e) => setNin(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs">First Name <span className="text-red-500">*</span></label>
                  <input className="input" required placeholder="As on your ID"
                    value={firstName} onChange={(e) => setFirst(e.target.value)} />
                </div>
                <div>
                  <label className="label text-xs">Last Name <span className="text-red-500">*</span></label>
                  <input className="input" required placeholder="As on your ID"
                    value={lastName} onChange={(e) => setLast(e.target.value)} />
                </div>
              </div>
              {stepError && <ErrorBox msg={stepError} />}
              <Button type="submit" variant="accent" className="w-full" disabled={submitting}>
                {submitting
                  ? <LoadingText text="Verifying NIN with QoreID..." />
                  : <span className="flex items-center justify-center gap-2">Verify NIN <ChevronRight className="h-4 w-4" /></span>
                }
              </Button>
            </form>
          )}

          {/* ── STEP 2: CAC ── */}
          {step === 2 && (
            <form onSubmit={handleStep2} className="space-y-4">
              <p className="text-sm text-[#5A4A44]">
                Verify your business registration with the Corporate Affairs Commission (CAC).
              </p>
              <div>
                <label className="label text-xs">Business Type <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-3 gap-2">
                  {CAC_TYPES.map((t) => (
                    <button key={t.code} type="button"
                      onClick={() => setBusinessType(t.code)}
                      className={`rounded-lg border px-2 py-2.5 text-center transition ${
                        businessType === t.code
                          ? "border-leather bg-[#FFF8EA] text-ink"
                          : "border-[#D7CBC1] bg-white text-[#5A4A44] hover:border-[#C49A3C]"
                      }`}>
                      <span className="block text-sm font-bold">{t.code}</span>
                      <span className="block text-[10px] leading-tight mt-0.5">{t.label}</span>
                    </button>
                  ))}
                </div>
                {businessType && (
                  <p className="mt-1.5 text-xs text-[#8A7A72]">
                    {CAC_TYPES.find((t) => t.code === businessType)?.desc}
                  </p>
                )}
              </div>
              <div>
                <label className="label text-xs">Registration Number <span className="text-red-500">*</span></label>
                <div className="relative">
                  {businessType && (
                    <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#8A7A72]">
                      {businessType}
                    </span>
                  )}
                  <input className="input" required disabled={!businessType}
                    style={businessType ? { paddingLeft: "2.75rem" } : undefined}
                    placeholder={businessType ? "123456" : "Select a business type above first"}
                    value={regNumberDigits}
                    onChange={(e) => setRegNumberDigits(e.target.value.replace(/[^0-9]/g, ""))} />
                </div>
                <p className="mt-1.5 text-xs text-[#8A7A72]">
                  We'll add the <span className="font-semibold">{businessType || "RC/BN/IT"}</span> prefix for you — just type the numbers.
                </p>
              </div>
              <div>
                <label className="label text-xs">Registered Company Name <span className="text-red-500">*</span></label>
                <input className="input" required placeholder="Exact name as registered with CAC"
                  value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
              </div>
              {stepError && <ErrorBox msg={stepError} />}
              <div className="flex gap-3">
                <button type="button"
                  onClick={() => { setStep(1); setStepError(""); }}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 hover:text-gray-800">
                  <ChevronLeft className="h-4 w-4" /> Back
                </button>
                <Button type="submit" variant="accent" className="flex-1" disabled={submitting || !businessType}>
                  {submitting
                    ? <LoadingText text="Verifying with CAC..." />
                    : <span className="flex items-center justify-center gap-2">Verify Business <ChevronRight className="h-4 w-4" /></span>
                  }
                </Button>
              </div>
            </form>
          )}

          {/* ── STEP 3: Business Profile ── */}
          {step === 3 && (
            <form onSubmit={handleStep3} className="space-y-4">
              <p className="text-sm text-[#5A4A44]">
                Tell us where your business is based.
              </p>
              <div>
                <label className="label text-xs">State <span className="text-red-500">*</span></label>
                <select className="input" required value={state} onChange={(e) => setState(e.target.value)}>
                  <option value="">Select state</option>
                  {NG_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="label text-xs">Work / Office Address <span className="text-red-500">*</span></label>
                <textarea className="input min-h-20 resize-none" required
                  placeholder="e.g. 12 Broad Street, Lagos Island, Lagos"
                  value={workAddress} onChange={(e) => setWorkAddress(e.target.value)} />
              </div>
              {stepError && <ErrorBox msg={stepError} />}
              <div className="flex gap-3">
                <button type="button"
                  onClick={() => { setStep(2); setStepError(""); }}
                  className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 hover:text-gray-800">
                  <ChevronLeft className="h-4 w-4" /> Back
                </button>
                <Button type="submit" variant="accent" className="flex-1" disabled={submitting}>
                  {submitting
                    ? <LoadingText text="Saving..." />
                    : <span className="flex items-center justify-center gap-2">Complete Setup <CheckCircle2 className="h-4 w-4" /></span>
                  }
                </Button>
              </div>
            </form>
          )}

        </div>
      </Modal>
    </PageWrapper>
  );
}

function ErrorBox({ msg }) {
  return (
    <div className="flex items-start gap-2 rounded-xl border border-[#FEE2E2] bg-[#FFF5F5] p-3 text-xs text-[#B42318]">
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /><span>{msg}</span>
    </div>
  );
}

function LoadingText({ text }) {
  return (
    <span className="flex items-center justify-center gap-2">
      <Loader2 className="h-4 w-4 animate-spin" />{text}
    </span>
  );
}
