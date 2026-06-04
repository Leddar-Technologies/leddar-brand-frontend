// import { useEffect, useMemo, useState } from "react";
// import { useRouter } from "next/router";
// import {
//   ShieldCheck, AlertCircle, FileText, User,
//   Building2, Lock, ChevronRight, CheckCircle2,
//   RefreshCw,
// } from "lucide-react";
// import PageWrapper from "../components/layout/PageWrapper";
// import Badge from "../components/ui/Badge";
// import Button from "../components/ui/Button";
// import Modal from "../components/ui/Modal";
// import Spinner from "../components/ui/Spinner";
// import { getKycStatus, verifyKycIdentity, retryKycVerification } from "../services/authService";

// export default function KycPage() {
//   const router = useRouter();
//   const [kycProfile, setKycProfile] = useState({ status: "not_started", rejectionReason: "" });
//   const [busy, setBusy]             = useState(true);
//   const [verifyModalOpen, setVerifyModalOpen] = useState(false);
//   const [idType, setIdType]         = useState("NIN");
//   const [formData, setFormData]     = useState({ idNumber: "", firstName: "", lastName: "", dob: "", companyName: "" });
//   const [verifyError, setVerifyError] = useState("");
//   const [submitting, setSubmitting] = useState(false);

//   const returnUrl = typeof router.query.returnUrl === "string" ? router.query.returnUrl : "/dashboard";

//   useEffect(() => {
//     getKycStatus()
//       .then((p) => setKycProfile(p || { status: "not_started" }))
//       .catch(() => {})
//       .finally(() => setBusy(false));
//   }, []);

//   const statusCopy = useMemo(() => ({
//     not_started: { badge: "Not Started", title: "Identity Verification Required", note: "Verify your identity to unlock payments and start placing orders.", color: "gray",   icon: Lock },
//     in_progress:  { badge: "In Progress", title: "Verification In Progress",      note: "Your verification is being processed.",                            color: "orange", icon: FileText },
//     pending_review:{ badge: "Pending",    title: "Under Review",                   note: "Our compliance team is reviewing your details. This takes 24-48 hours.", color: "blue", icon: Spinner },
//     verified:     { badge: "Verified",    title: "Identity Verified ✓",           note: "Your account is fully verified. Payments and orders are unlocked.", color: "green",  icon: ShieldCheck },
//     rejected:     { badge: "Rejected",    title: "Verification Failed",            note: kycProfile.rejectionReason || "Details did not match official records. Please retry.", color: "red", icon: AlertCircle },
//   }[kycProfile.status] || { badge: "Not Started", title: "Identity Verification", note: "Verify to unlock payments.", color: "gray", icon: Lock }), [kycProfile]);

//   const handleInput = (e) => setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

//   async function handleSubmit(e) {
//     e.preventDefault();
//     setVerifyError("");
//     setSubmitting(true);
//     try {
//       const result = await verifyKycIdentity({ idType, ...formData });
//       setKycProfile(result);
//       setVerifyModalOpen(false);
//       if (result.status === "verified") {
//         setTimeout(() => router.push(returnUrl), 800);
//       }
//     } catch (err) {
//       setVerifyError(err.message || "Verification failed. Please check your details.");
//     } finally {
//       setSubmitting(false);
//     }
//   }

//   async function handleRetry() {
//     const profile = retryKycVerification();
//     setKycProfile(profile);
//     setVerifyModalOpen(true);
//   }

//   const StatusIcon = statusCopy.icon;
//   const canVerify  = ["not_started", "rejected", "in_progress"].includes(kycProfile.status);

//   return (
//     <PageWrapper>
//       <div className="mx-auto max-w-2xl py-8 px-0">
//         {/* Header */}
//         <div className="mb-8">
//           <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8A7A72]">Account Security</p>
//           <h1 className="mt-2 text-2xl font-semibold text-ink md:text-3xl">Identity Verification</h1>
//           <p className="mt-1 text-sm text-[#5A4A44]">Required to unlock payments, deposits, and full production access.</p>
//         </div>

//         {/* Status card */}
//         <div className={`relative overflow-hidden rounded-2xl border p-6 sm:p-8 transition-all ${
//           kycProfile.status === "verified" ? "border-[#2D6A4F33] bg-[#2D6A4F08]" :
//           kycProfile.status === "rejected" ? "border-[#B4231833] bg-[#B4231808]" :
//           "border-[#E8DED5] bg-white"
//         }`}>
//           <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
//             <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
//               kycProfile.status === "verified" ? "bg-[#2D6A4F14] text-success" :
//               kycProfile.status === "rejected" ? "bg-[#B4231814] text-[#B42318]" :
//               "bg-[#FFF8EA] text-gold"
//             }`}>
//               {kycProfile.status === "pending_review"
//                 ? <Spinner className="text-[#8B6A39]" />
//                 : <StatusIcon className="h-7 w-7" />
//               }
//             </div>

//             <div className="flex-1 text-center sm:text-left">
//               <div className="flex flex-col sm:flex-row sm:items-center gap-2">
//                 <h2 className="text-lg font-semibold text-ink">{statusCopy.title}</h2>
//                 <Badge status={statusCopy.badge} className="mx-auto sm:mx-0" />
//               </div>
//               <p className="mt-2 text-sm text-[#5A4A44] max-w-md">{statusCopy.note}</p>

//               {canVerify ? (
//                 <Button
//                   variant="accent"
//                   className="mt-5 inline-flex items-center gap-2"
//                   onClick={kycProfile.status === "rejected" ? handleRetry : () => setVerifyModalOpen(true)}
//                   disabled={busy}
//                 >
//                   {kycProfile.status === "rejected"
//                     ? <><RefreshCw className="h-4 w-4" /> Retry Verification</>
//                     : <><ShieldCheck className="h-4 w-4" /> Start Verification</>
//                   }
//                   <ChevronRight className="h-4 w-4" />
//                 </Button>
//               ) : kycProfile.status === "verified" ? (
//                 <button
//                   onClick={() => router.push(returnUrl)}
//                   className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-success hover:underline"
//                 >
//                   <CheckCircle2 className="h-4 w-4" /> Continue to dashboard
//                 </button>
//               ) : null}
//             </div>
//           </div>
//         </div>

//         {/* Benefits */}
//         <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
//           {[
//             { icon: Building2,    label: "Business Access",   desc: "Submit production and sample orders" },
//             { icon: User,         label: "Identity Trust",     desc: "Priority artisan matching" },
//             { icon: CheckCircle2, label: "Payment Unlocked",   desc: "Pay sample fee and production balance" },
//           ].map((item, i) => (
//             <div key={i} className="group rounded-xl border border-[#E8DED5] bg-white p-4 hover:border-[#C49A3C55] hover:bg-[#FFF8EF] transition-all">
//               <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FAF4E7] group-hover:bg-[#FFF0D0] transition-colors mb-3">
//                 <item.icon className="h-5 w-5 text-gold" />
//               </div>
//               <p className="text-sm font-semibold text-ink">{item.label}</p>
//               <p className="mt-0.5 text-xs text-[#7B6A62]">{item.desc}</p>
//             </div>
//           ))}
//         </div>

//         {/* Trust footer */}
//         <div className="mt-8 flex flex-col items-center gap-3">
//           <div className="flex items-center gap-2 rounded-full border border-[#E8DED5] bg-white px-4 py-2">
//             <ShieldCheck className="h-3.5 w-3.5 text-[#9B8A82]" />
//             <span className="text-[10px] font-bold uppercase tracking-widest text-[#9B8A82]">
//               Secured by QoreID · AES-256 Encrypted
//             </span>
//           </div>
//           <p className="text-center text-xs text-[#9B8A82] max-w-xs">
//             Leddar does not store your government ID number. Verification is processed instantly via <strong className="text-[#7B6A62]">QoreID</strong>.
//           </p>
//         </div>
//       </div>

//       {/* Verification Modal */}
//       <Modal open={verifyModalOpen} onClose={() => setVerifyModalOpen(false)} title="Verify Your Identity">
//         <form onSubmit={handleSubmit} className="space-y-5">
//           <p className="text-sm text-[#5A4A44]">
//             Enter your details exactly as they appear on your official ID document.
//           </p>

//           {/* ID Type selector */}
//           <div>
//             <label className="label text-xs">ID Type</label>
//             <div className="mt-1 flex rounded-xl border border-[#E6D7CB] bg-[#FAF4E7] p-1">
//               {["NIN", "CAC", "Voters Card"].map((type) => (
//                 <button key={type} type="button" onClick={() => setIdType(type)}
//                   className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
//                     idType === type ? "bg-white text-[#8B6A39] shadow-sm" : "text-[#9B8A82] hover:text-ink"
//                   }`}
//                 >
//                   {type === "Voters Card" ? "Voters" : type}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* ID Number */}
//           <div>
//             <label className="label text-xs">
//               {idType === "CAC" ? "RC Number" : `${idType} Number`}
//             </label>
//             <input name="idNumber" className="input" required
//               placeholder={idType === "CAC" ? "RC123456" : "12345678901"}
//               value={formData.idNumber} onChange={handleInput} />
//           </div>

//           {/* CAC fields */}
//           {idType === "CAC" ? (
//             <div>
//               <label className="label text-xs">Company Name</label>
//               <input name="companyName" className="input" required
//                 placeholder="Exact registered company name"
//                 value={formData.companyName} onChange={handleInput} />
//             </div>
//           ) : (
//             <>
//               <div className="grid grid-cols-2 gap-3">
//                 <div>
//                   <label className="label text-xs">First Name</label>
//                   <input name="firstName" className="input" required placeholder="John"
//                     value={formData.firstName} onChange={handleInput} />
//                 </div>
//                 <div>
//                   <label className="label text-xs">Last Name</label>
//                   <input name="lastName" className="input" required placeholder="Doe"
//                     value={formData.lastName} onChange={handleInput} />
//                 </div>
//               </div>
//               <div>
//                 <label className="label text-xs">Date of Birth</label>
//                 <input name="dob" type="date" className="input" required
//                   value={formData.dob} onChange={handleInput} />
//               </div>
//             </>
//           )}

//           {verifyError ? (
//             <div className="flex items-start gap-2 rounded-xl border border-[#FEE2E2] bg-[#FFF5F5] p-3 text-xs text-[#B42318]">
//               <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
//               <span>{verifyError}</span>
//             </div>
//           ) : null}

//           <div className="flex flex-col gap-2 pt-1">
//             <Button type="submit" variant="accent" className="w-full" disabled={submitting}>
//               {submitting
//                 ? <span className="inline-flex items-center gap-2"><Spinner size="sm" className="text-espresso" /><span>Verifying...</span></span>
//                 : "Submit Verification"
//               }
//             </Button>
//             <button type="button" onClick={() => setVerifyModalOpen(false)}
//               className="text-xs font-medium text-[#9B8A82] hover:text-ink py-1 transition-colors">
//               Cancel
//             </button>
//           </div>
//         </form>
//       </Modal>
//     </PageWrapper>
//   );
// }

// pages/kyc.jsx — Brand app
// Supports: NIN | Voter's Card | CAC
// All fields sent to backend with lowercase names (firstname/lastname) matching controller
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import {
  ShieldCheck, AlertCircle, FileText, User,
  Building2, Lock, ChevronRight, CheckCircle2, RefreshCw,
} from "lucide-react";
import PageWrapper from "../components/layout/PageWrapper";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import Spinner from "../components/ui/Spinner";
import { getKycStatus, verifyKycIdentity, retryKycVerification } from "../services/authService";

// ID types available for brands
const ID_TYPES = ["NIN", "Voters Card", "CAC"];

export default function KycPage() {
  const router = useRouter();
  const [kycProfile, setKycProfile] = useState({ status: "not_started", rejectionReason: "" });
  const [busy, setBusy]             = useState(true);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [idType, setIdType]         = useState("NIN");
  const [formData, setFormData]     = useState({
    idNumber:    "",
    firstname:   "",   // lowercase — matches what backend controller reads
    lastname:    "",   // lowercase — matches what backend controller reads
    dob:         "",
    companyName: "",
  });
  const [verifyError, setVerifyError] = useState("");
  const [submitting, setSubmitting]   = useState(false);

  const returnUrl = typeof router.query.returnUrl === "string"
    ? router.query.returnUrl
    : "/dashboard";

  // Load real KYC status from backend on mount
  useEffect(() => {
    getKycStatus()
      .then((p) => setKycProfile(p || { status: "not_started" }))
      .catch(() => {})
      .finally(() => setBusy(false));
  }, []);

  const statusCopy = useMemo(() => ({
    not_started:    { badge: "Not Started",    title: "Identity Verification Required", note: "Verify your identity to unlock payments and start placing orders.",               icon: Lock },
    in_progress:    { badge: "In Progress",    title: "Verification In Progress",       note: "Your verification is being processed.",                                           icon: FileText },
    pending_review: { badge: "Pending",        title: "Under Review",                   note: "Our compliance team is reviewing your details. This usually takes 24–48 hours.", icon: Spinner },
    verified:       { badge: "Verified",       title: "Identity Verified ✓",            note: "Your account is fully verified. Payments and orders are unlocked.",               icon: ShieldCheck },
    rejected:       { badge: "Rejected",       title: "Verification Failed",            note: kycProfile.rejectionReason || "Details did not match official records. Please retry.", icon: AlertCircle },
  }[kycProfile.status] || { badge: "Not Started", title: "Identity Verification", note: "Verify to unlock payments.", icon: Lock }), [kycProfile]);

  const handleInput = (e) => setFormData((p) => ({ ...p, [e.target.name]: e.target.value }));

  async function handleSubmit(e) {
    e.preventDefault();
    setVerifyError("");
    setSubmitting(true);

    // Debug: log what we're sending
    console.log("╔══════════════════════════════════════╗");
    console.log("║      KYC Form Submission Debug       ║");
    console.log("╠══════════════════════════════════════╣");
    console.log("║ idType     :", idType);
    console.log("║ idNumber   :", formData.idNumber);
    console.log("║ firstname  :", formData.firstname);
    console.log("║ lastname   :", formData.lastname);
    console.log("║ dob        :", formData.dob);
    console.log("║ companyName:", formData.companyName);
    console.log("╚══════════════════════════════════════╝");

    try {
      // authService.verifyKycIdentity maps these to the right backend fields
      const result = await verifyKycIdentity({
        idType,
        idNumber:    formData.idNumber,
        firstName:   formData.firstname,   // authService sends as firstname to backend
        lastName:    formData.lastname,    // authService sends as lastname to backend
        dob:         formData.dob,
        companyName: formData.companyName,
      });

      console.log("[KYC Page] Result:", result);

      setKycProfile(result);
      setVerifyModalOpen(false);

      if (result.status === "verified") {
        setTimeout(() => router.push(returnUrl), 800);
      }
    } catch (err) {
      console.error("[KYC Page] Error:", err.response?.data || err.message);
      setVerifyError(
        err.response?.data?.message || err.message || "Verification failed. Please check your details.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function handleRetry() {
    const profile = retryKycVerification();
    setKycProfile(profile);
    setFormData({ idNumber: "", firstname: "", lastname: "", dob: "", companyName: "" });
    setVerifyError("");
    setVerifyModalOpen(true);
  }

  const StatusIcon = statusCopy.icon;
  const canVerify  = ["not_started", "rejected", "in_progress"].includes(kycProfile.status);

  // Field labels per ID type
  const idNumberLabel = { NIN: "NIN (11 digits)", "Voters Card": "Voter ID Number (VIN)", CAC: "RC / BN Number" };
  const idNumberPlaceholder = { NIN: "e.g. 12345678901", "Voters Card": "e.g. 9AF1F0A1C91", CAC: "e.g. RC123456" };

  return (
    <PageWrapper>
      <div className="mx-auto max-w-2xl py-8">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#8A7A72]">Account Security</p>
          <h1 className="mt-2 text-2xl font-semibold text-ink md:text-3xl">Identity Verification</h1>
          <p className="mt-1 text-sm text-[#5A4A44]">
            Required to unlock payments, deposits, and full production access.
          </p>
        </div>

        {/* Status card */}
        <div className={`relative overflow-hidden rounded-2xl border p-6 sm:p-8 transition-all ${
          kycProfile.status === "verified" ? "border-[#2D6A4F33] bg-[#2D6A4F08]" :
          kycProfile.status === "rejected" ? "border-[#B4231833] bg-[#B4231808]" :
          "border-[#E8DED5] bg-white"
        }`}>
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
            <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${
              kycProfile.status === "verified" ? "bg-[#2D6A4F14] text-success" :
              kycProfile.status === "rejected" ? "bg-[#B4231814] text-[#B42318]" :
              "bg-[#FFF8EA] text-gold"
            }`}>
              {kycProfile.status === "pending_review"
                ? <Spinner className="text-[#8B6A39]" />
                : <StatusIcon className="h-7 w-7" />
              }
            </div>

            <div className="flex-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <h2 className="text-lg font-semibold text-ink">{statusCopy.title}</h2>
                <Badge status={statusCopy.badge} className="mx-auto sm:mx-0" />
              </div>
              <p className="mt-2 text-sm text-[#5A4A44] max-w-md">{statusCopy.note}</p>

              {kycProfile.idType ? (
                <p className="mt-2 text-xs text-[#9B8A82]">
                  Verified via: {kycProfile.provider || "QoreID"} · {kycProfile.idType}
                </p>
              ) : null}

              {canVerify ? (
                <Button
                  variant="accent"
                  className="mt-5 inline-flex items-center gap-2"
                  onClick={kycProfile.status === "rejected" ? handleRetry : () => setVerifyModalOpen(true)}
                  disabled={busy}
                >
                  {kycProfile.status === "rejected"
                    ? <><RefreshCw className="h-4 w-4" /> Retry Verification</>
                    : <><ShieldCheck className="h-4 w-4" /> Start Verification</>
                  }
                  <ChevronRight className="h-4 w-4" />
                </Button>
              ) : kycProfile.status === "verified" ? (
                <button onClick={() => router.push(returnUrl)}
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-success hover:underline">
                  <CheckCircle2 className="h-4 w-4" /> Continue
                </button>
              ) : null}
            </div>
          </div>
        </div>

        {/* Benefits */}
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { icon: Building2,    label: "Business Access",  desc: "Submit production and sample orders" },
            { icon: User,         label: "Identity Trust",    desc: "Priority artisan matching" },
            { icon: CheckCircle2, label: "Payment Unlocked",  desc: "Pay sample fee and production balance" },
          ].map((item, i) => (
            <div key={i} className="group rounded-xl border border-[#E8DED5] bg-white p-4 hover:border-[#C49A3C55] hover:bg-[#FFF8EF] transition-all">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FAF4E7] group-hover:bg-[#FFF0D0] transition-colors mb-3">
                <item.icon className="h-5 w-5 text-gold" />
              </div>
              <p className="text-sm font-semibold text-ink">{item.label}</p>
              <p className="mt-0.5 text-xs text-[#7B6A62]">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Trust footer */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 rounded-full border border-[#E8DED5] bg-white px-4 py-2">
            <ShieldCheck className="h-3.5 w-3.5 text-[#9B8A82]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#9B8A82]">
              Secured by QoreID · AES-256 Encrypted
            </span>
          </div>
          <p className="text-center text-xs text-[#9B8A82] max-w-xs">
            Leddar does not store your government ID number. Verification is processed instantly via{" "}
            <strong className="text-[#7B6A62]">QoreID</strong>.
          </p>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Verification Modal                                                   */}
      {/* ------------------------------------------------------------------ */}
      <Modal open={verifyModalOpen} onClose={() => setVerifyModalOpen(false)} title="Verify Your Identity">
        <form onSubmit={handleSubmit} className="space-y-5">
          <p className="text-sm text-[#5A4A44]">
            Enter your details exactly as they appear on your official document.
          </p>

          {/* ID Type selector */}
          <div>
            <label className="label text-xs">ID Type</label>
            <div className="mt-1 flex rounded-xl border border-[#E6D7CB] bg-[#FAF4E7] p-1">
              {ID_TYPES.map((type) => (
                <button key={type} type="button"
                  onClick={() => { setIdType(type); setFormData({ idNumber: "", firstname: "", lastname: "", dob: "", companyName: "" }); setVerifyError(""); }}
                  className={`flex-1 rounded-lg py-2 text-xs font-semibold transition-all ${
                    idType === type ? "bg-white text-[#8B6A39] shadow-sm" : "text-[#9B8A82] hover:text-ink"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* ID Number */}
          <div>
            <label className="label text-xs">{idNumberLabel[idType]}</label>
            <input name="idNumber" className="input" required
              placeholder={idNumberPlaceholder[idType]}
              value={formData.idNumber} onChange={handleInput} />
          </div>

          {/* CAC fields */}
          {idType === "CAC" ? (
            <div>
              <label className="label text-xs">Registered Company Name</label>
              <input name="companyName" className="input" required
                placeholder="Exact name as registered with CAC"
                value={formData.companyName} onChange={handleInput} />
            </div>
          ) : (
            /* NIN + Voter's Card fields */
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label text-xs">First Name</label>
                  <input name="firstname" className="input" required placeholder="John"
                    value={formData.firstname} onChange={handleInput} />
                </div>
                <div>
                  <label className="label text-xs">Last Name</label>
                  <input name="lastname" className="input" required placeholder="Doe"
                    value={formData.lastname} onChange={handleInput} />
                </div>
              </div>
              {/* DOB required for NIN */}
              {idType === "NIN" ? (
                <div>
                  <label className="label text-xs">Date of Birth</label>
                  <input name="dob" type="date" className="input" required
                    value={formData.dob} onChange={handleInput} />
                </div>
              ) : null}
            </>
          )}

          {verifyError ? (
            <div className="flex items-start gap-2 rounded-xl border border-[#FEE2E2] bg-[#FFF5F5] p-3 text-xs text-[#B42318]">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{verifyError}</span>
            </div>
          ) : null}

          <div className="flex flex-col gap-2 pt-1">
            <Button type="submit" variant="accent" className="w-full" disabled={submitting}>
              {submitting
                ? <span className="inline-flex items-center gap-2"><Spinner size="sm" className="text-espresso" /><span>Verifying with QoreID...</span></span>
                : "Submit Verification"
              }
            </Button>
            <button type="button" onClick={() => setVerifyModalOpen(false)}
              className="text-xs font-medium text-[#9B8A82] hover:text-ink py-1 transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </PageWrapper>
  );
}
