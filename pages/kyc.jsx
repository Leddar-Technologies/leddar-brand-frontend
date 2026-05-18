import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  CircleCheckBig,
  ShieldCheck,
  AlertCircle,
  FileText,
  User,
  Building2,
  Lock,
  ChevronRight,
} from "lucide-react";
import PageWrapper from "../components/layout/PageWrapper";
import Badge from "../components/ui/Badge";
import Button from "../components/ui/Button";
import Modal from "../components/ui/Modal";
import Spinner from "../components/ui/Spinner";
import { getKycStatus, verifyKycIdentity } from "../services/authService";

export default function KycPage() {
  const router = useRouter();
  const [kycProfile, setKycProfile] = useState({
    status: "not_started",
    rejectionReason: "",
    firstname: "",
    lastname: "",
    businessName: "",
  });

  const [busy, setBusy] = useState(true);
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [idType, setIdType] = useState("NIN");
  const [formData, setFormData] = useState({
    idNumber: "",
    firstName: "",
    lastName: "",
    dob: "",
    companyType: "Limited Company",
  });
  const [verifyError, setVerifyError] = useState("");

  const returnUrl =
    typeof router.query.returnUrl === "string"
      ? router.query.returnUrl
      : "/dashboard";

  useEffect(() => {
    async function loadStatus() {
      try {
        const profile = await getKycStatus();
        setKycProfile(profile);
      } catch (error) {
        console.error("Failed to load KYC status:", error);
      } finally {
        setBusy(false);
      }
    }
    loadStatus();
  }, []);

  const statusCopy = useMemo(() => {
    const configs = {
      in_progress: {
        badge: "In Progress",
        title: "Action Required",
        note: "Please complete the identity verification form.",
        color: "orange",
        icon: FileText,
      },
      pending_review: {
        badge: "Pending",
        title: "Review in Progress",
        note: "Our compliance team is verifying your details.",
        color: "blue",
        icon: Spinner,
      },
      verified: {
        badge: "Verified",
        title: "Identity Verified",
        note: "Your account is fully unlocked. You can now process payments.",
        color: "green",
        icon: ShieldCheck,
      },
      rejected: {
        badge: "Rejected",
        title: "Verification Failed",
        note:
          kycProfile.rejectionReason ||
          "Details provided did not match official records.",
        color: "red",
        icon: AlertCircle,
      },
      default: {
        badge: "Not Started",
        title: "Identity Verification",
        note: "Verify your identity to unlock deposits and professional features.",
        color: "gray",
        icon: Lock,
      },
    };
    return configs[kycProfile.status] || configs.default;
  }, [kycProfile]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  async function handleSubmitVerification(event) {
    event.preventDefault();
    setVerifyError("");
    setBusy(true);
    try {
      const verifiedProfile = await verifyKycIdentity({ idType, ...formData });
      setKycProfile(verifiedProfile);
      setVerifyModalOpen(false);
      if (verifiedProfile.status === "verified") router.push(returnUrl);
    } catch (err) {
      setVerifyError(
        err.message || "Identity mismatch. Please check your details.",
      );
    } finally {
      setBusy(false);
    }
  }

  const StatusIcon = statusCopy.icon;

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto py-12 px-4">
        {/* Progress Header (Optional Visual) */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Account Security
          </h1>
          <p className="text-slate-500 mt-2">
            Manage your verification status and account limits
          </p>
        </div>

        {/* Status Card */}
        <div
          className={`relative overflow-hidden rounded-3xl border p-8 transition-all duration-300 shadow-xl shadow-slate-200/50 ${
            kycProfile.status === "verified"
              ? "bg-white border-green-200"
              : "bg-white border-slate-100"
          }`}
        >
          {/* Subtle Background Pattern/Gradient */}
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-slate-50 rounded-full blur-3xl opacity-50" />

          <div className="relative flex flex-col md:flex-row items-center md:items-start gap-6 text-center md:text-left">
            <div
              className={`flex-shrink-0 p-4 rounded-2xl shadow-inner ${
                kycProfile.status === "verified"
                  ? "bg-green-100 text-green-600"
                  : "bg-slate-100 text-slate-400"
              }`}
            >
              <StatusIcon
                size={32}
                strokeWidth={2.5}
                className={
                  kycProfile.status === "pending_review" ? "animate-spin" : ""
                }
              />
            </div>

            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                <h2 className="text-xl font-bold text-slate-900 leading-tight">
                  {statusCopy.title}
                </h2>
                <Badge
                  status={statusCopy.badge}
                  className="w-fit mx-auto md:mx-0"
                />
              </div>
              <p className="text-slate-500 mt-2 text-sm md:text-base max-w-md">
                {statusCopy.note}
              </p>

              {(kycProfile.status === "not_started" ||
                kycProfile.status === "rejected" ||
                kycProfile.status === "in_progress") && (
                <Button
                  variant="accent"
                  className="mt-6 px-8 py-3 rounded-xl font-bold transition-transform active:scale-95 flex items-center gap-2"
                  onClick={() => setVerifyModalOpen(true)}
                  disabled={busy}
                >
                  {kycProfile.status === "rejected"
                    ? "Retry Verification"
                    : "Start Verification"}
                  <ChevronRight size={18} />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              icon: Building2,
              label: "Business Wallet",
              desc: "Local & Int'l deposits",
              color: "blue",
            },
            {
              icon: User,
              label: "Identity Trust",
              desc: "Priority processing",
              color: "purple",
            },
            {
              icon: CircleCheckBig,
              label: "Zero Limits",
              desc: "Full withdrawal access",
              color: "green",
            },
          ].map((item, i) => (
            <div
              key={i}
              className="group p-5 rounded-2xl bg-white border border-slate-100 hover:border-accent/30 hover:shadow-lg hover:shadow-slate-200/50 transition-all"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center mb-4 group-hover:bg-accent/5 transition-colors">
                <item.icon
                  size={20}
                  className="text-slate-400 group-hover:text-accent"
                />
              </div>
              <p className="font-bold text-sm text-slate-900">{item.label}</p>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
            <ShieldCheck size={14} className="text-slate-400" />
            <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
              Secure AES-256 Encryption
            </span>
          </div>
          <p className="text-center text-xs text-slate-400 max-w-xs">
            Identity verification is secured by{" "}
            <strong className="text-slate-600">VerifyMe</strong>. Leddar does
            not store sensitive government ID numbers.
          </p>
        </div>
      </div>

      <Modal
        open={verifyModalOpen}
        onClose={() => setVerifyModalOpen(false)}
        className="max-w-md"
      >
        <div className="p-2">
          <h3 className="text-xl font-bold text-slate-900">Identity Details</h3>
          <p className="text-sm text-slate-500 mb-6">
            Ensure your details match your official documents.
          </p>

          <form onSubmit={handleSubmitVerification} className="space-y-6">
            {/* ID Type Selector - More Modern */}
            <div>
              <label className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-3 block">
                Select ID Type
              </label>
              <div className="flex p-1 bg-slate-100 rounded-xl">
                {["NIN", "CAC", "Voters Card"].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setIdType(type)}
                    className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                      idType === type
                        ? "bg-white text-accent shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    {type === "Voters Card" ? "Voters" : type}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="relative">
                <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                  {idType === "CAC" ? "RC Number" : `${idType} Number`}
                </label>
                <input
                  name="idNumber"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all outline-none text-sm font-medium"
                  required
                  placeholder={`e.g. ${idType === "CAC" ? "RC123456" : "12345678901"}`}
                  value={formData.idNumber}
                  onChange={handleInputChange}
                />
              </div>

              {idType === "CAC" ? (
                <div>
                  <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                    Company Type
                  </label>
                  <select
                    name="companyType"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all outline-none text-sm font-medium appearance-none"
                    value={formData.companyType}
                    onChange={handleInputChange}
                  >
                    <option>Limited Company</option>
                    <option>Business Name</option>
                    <option>Incorporated Trustee</option>
                  </select>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                        First Name
                      </label>
                      <input
                        name="firstName"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all outline-none text-sm font-medium"
                        required
                        placeholder="John"
                        value={formData.firstName}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                        Last Name
                      </label>
                      <input
                        name="lastName"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all outline-none text-sm font-medium"
                        required
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 mb-1.5 block">
                      Date of Birth
                    </label>
                    <input
                      name="dob"
                      type="date"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-accent focus:ring-4 focus:ring-accent/10 transition-all outline-none text-sm font-medium"
                      required
                      value={formData.dob}
                      onChange={handleInputChange}
                    />
                  </div>
                </>
              )}
            </div>

            {verifyError && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-100 flex items-start gap-3 text-red-600 text-xs animate-in fade-in slide-in-from-top-1">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <p className="leading-relaxed font-medium">{verifyError}</p>
              </div>
            )}

            <div className="flex flex-col gap-3 pt-2">
              <Button
                type="submit"
                variant="accent"
                className="w-full py-4 rounded-xl font-bold shadow-lg shadow-accent/20"
                disabled={busy}
              >
                {busy ? <Spinner size="sm" /> : "Submit Verification"}
              </Button>
              <button
                type="button"
                className="text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors py-2"
                onClick={() => setVerifyModalOpen(false)}
              >
                Cancel & Return
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </PageWrapper>
  );
}
