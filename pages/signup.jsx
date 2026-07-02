import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import {
  Users,
  Award,
  ArrowRight,
  Zap,
  Eye,
  EyeOff,
  Check,
  ChevronDown,
} from "lucide-react";
import Spinner from "../components/ui/Spinner";
import PhoneInput, { validatePhone, normalizePhone } from "../components/ui/PhoneInput";
import {
  submitAccessRequest,
  resetState,
} from "../store/slices/accessRequestSlice";
import {
  retryKycVerification,
  setLastBrandName,
} from "../services/authService";

const PRODUCT_TYPES = [
  { label: "Bags", value: "BAGS" },
  { label: "Wallets", value: "WALLETS" },
  { label: "Footwear", value: "FOOTWEAR" },
  { label: "Belts", value: "BELTS" },
  { label: "Apparel", value: "APPAREL" },
  { label: "Other", value: "OTHER" },
];

export default function Signup() {
  const router = useRouter();
  const dispatch = useDispatch();

  const { loading, error, success } = useSelector(
    (state) => state.accessRequest,
  );

  const [responseMessage, setResponseMessage] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    businessName: "",
    productType: [],
    estimatedQuantity: "",
    contactName: "",
    email: "",
    phone: "",
    password: "",
  });

  useEffect(() => {
    if (success) {
      try {
        retryKycVerification();
        setLastBrandName(formData.businessName);

        router.push({
          pathname: "/signup-confirmation",
          query: {
            contactName: formData.contactName,
            businessName: formData.businessName,
            email: formData.email,
          },
        });
        dispatch(resetState());
      } catch (e) {
        console.error("Error in success callback:", e);
      }
    }
  }, [success, dispatch, router, formData]);

  function updateField(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (responseMessage) setResponseMessage("");
  }

  const toggleProductType = (typeValue) => {
    setFormData((prev) => {
      const isAlreadySelected = prev.productType.includes(typeValue);
      const updatedTypes = isAlreadySelected
        ? prev.productType.filter((t) => t !== typeValue)
        : [...prev.productType, typeValue];
      return { ...prev, productType: updatedTypes };
    });
    if (responseMessage) setResponseMessage("");
  };

  const [volumeOpen, setVolumeOpen] = useState(false);
  const volumeRef = useRef(null);

  const VOLUME_OPTIONS = [
    { label: "1–50 units", value: "1-50" },
    { label: "51–200 units", value: "51-200" },
    { label: "201+ units", value: "201+" },
  ];

  useEffect(() => {
    function handleClickOutside(e) {
      if (volumeRef.current && !volumeRef.current.contains(e.target)) {
        setVolumeOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();

    if (formData.productType.length === 0) {
      setResponseMessage("Please select at least one product type.");
      return;
    }

    const normalizedPhone = normalizePhone(formData.phone);
    if (!validatePhone(normalizedPhone)) {
      setResponseMessage("Please enter a valid phone number, e.g. +2348141955755");
      return;
    }

    if (!acceptTerms) {
      setResponseMessage("Please accept the Terms & Conditions to continue.");
      return;
    }

    const payload = {
      email: formData.email,
      password: formData.password,
      businessName: formData.businessName,
      productType: formData.productType,
      contactName: formData.contactName,
      whatsapp: formData.phone,
      brandEstimatedQty: formData.estimatedQuantity,
      acceptedTerms: acceptTerms,
    };

    dispatch(submitAccessRequest(payload));
  }

  return (
    <div className="min-h-screen bg-atmosphere">
      <header className="border-b border-[#E8DED5] bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Image
            src="/leddar-logo.svg"
            alt="Leddar"
            width={140}
            height={40}
            className="h-10 w-auto"
            priority
          />
        </div>
      </header>

      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-ink lg:text-6xl">
              Reliable Production <span className="text-gold">Starts Here</span>
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="bg-white p-4 rounded-xl border border-[#E8DED5] shadow-sm">
                <Users className="text-gold mb-2" />
                <h4 className="font-bold text-xs uppercase">Artisans</h4>
                <p className="text-[10px] text-[#6A5B54]">Vetted quality</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-[#E8DED5] shadow-sm">
                <Award className="text-gold mb-2" />
                <h4 className="font-bold text-xs uppercase">Quality</h4>
                <p className="text-[10px] text-[#6A5B54]">Consistent checks</p>
              </div>
              <div className="bg-white p-4 rounded-xl border border-[#E8DED5] shadow-sm">
                <Zap className="text-gold mb-2" />
                <h4 className="font-bold text-xs uppercase">Scaling</h4>
                <p className="text-[10px] text-[#6A5B54]">Growth ready</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E8DED5] bg-white p-8 shadow-xl">
            <h3 className="text-2xl font-bold text-ink mb-6">
              Brand Registration
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-semibold text-[#3C2F2A]">
                  Business Name *
                </label>
                <input
                  type="text"
                  name="businessName"
                  required
                  value={formData.businessName}
                  onChange={updateField}
                  className={`w-full rounded-lg border px-4 py-3 outline-none transition-colors focus:border-leather focus:ring-1 focus:ring-leather ${formData.businessName ? "border-leather bg-[#FDF5EE]" : "border-[#D7CBC1] bg-white"}`}
                  placeholder="e.g. Heritage Leather"
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-[#3C2F2A]">
                  Product Types (Select all that apply) *
                </label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {PRODUCT_TYPES.map((t) => {
                    const isSelected = formData.productType.includes(t.value);
                    return (
                      <button
                        key={t.value}
                        type="button"
                        onClick={() => toggleProductType(t.value)}
                        className={`flex items-center justify-between rounded-lg border px-3 py-2.5 text-[11px] font-bold transition-all ${
                          isSelected
                            ? "border-leather bg-leather text-white shadow-sm"
                            : "border-[#D7CBC1] bg-white text-[#5A4A44] hover:border-gold"
                        }`}
                      >
                        {t.label}
                        {isSelected && <Check size={12} strokeWidth={3} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-[#3C2F2A]">
                  Monthly Volume *
                </label>
                <div ref={volumeRef} className="relative">
                  {/* Trigger */}
                  <button
                    type="button"
                    onClick={() => setVolumeOpen((o) => !o)}
                    className={`w-full flex items-center justify-between rounded-lg border px-4 py-3 text-sm transition-all ${
                      formData.estimatedQuantity
                        ? "border-leather bg-[#FDF5EE] text-ink"
                        : "border-[#D7CBC1] bg-white text-[#A39289]"
                    } ${volumeOpen ? "ring-1 ring-leather border-leather" : ""}`}
                  >
                    <span>
                      {VOLUME_OPTIONS.find(o => o.value === formData.estimatedQuantity)?.label || "Select range"}
                    </span>
                    <ChevronDown
                      size={16}
                      className={`text-[#8B6355] transition-transform duration-200 ${volumeOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  {/* Dropdown panel */}
                  {volumeOpen && (
                    <div className="absolute z-50 mt-1 w-full rounded-xl border border-[#E8DED5] bg-white shadow-xl overflow-hidden">
                      {VOLUME_OPTIONS.map((opt, i) => {
                        const isSelected = formData.estimatedQuantity === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({ ...prev, estimatedQuantity: opt.value }));
                              setVolumeOpen(false);
                            }}
                            className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors ${
                              isSelected
                                ? "bg-leather text-white font-semibold"
                                : "text-[#3C2F2A] hover:bg-[#FDF5EE] hover:text-leather"
                            } ${i !== 0 ? "border-t border-[#F0E8E0]" : ""}`}
                          >
                            <span>{opt.label}</span>
                            {isSelected && <Check size={14} strokeWidth={3} />}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-[#3C2F2A]">
                  Official Email *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={updateField}
                  className={`w-full rounded-lg border px-4 py-3 outline-none transition-colors focus:border-leather focus:ring-1 focus:ring-leather ${formData.email ? "border-leather bg-[#FDF5EE]" : "border-[#D7CBC1] bg-white"}`}
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-semibold text-[#3C2F2A]">
                  Password *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    value={formData.password}
                    onChange={updateField}
                    className={`w-full rounded-lg border px-4 py-3 pr-12 outline-none transition-colors focus:border-leather focus:ring-1 focus:ring-leather ${formData.password ? "border-leather bg-[#FDF5EE]" : "border-[#D7CBC1] bg-white"}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7F7068]"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-[#3C2F2A]">
                    Contact Name *
                  </label>
                  <input
                    type="text"
                    name="contactName"
                    required
                    value={formData.contactName}
                    onChange={updateField}
                    className={`w-full rounded-lg border px-4 py-3 outline-none transition-colors focus:border-leather focus:ring-1 focus:ring-leather ${formData.contactName ? "border-leather bg-[#FDF5EE]" : "border-[#D7CBC1] bg-white"}`}
                  />
                </div>
                <PhoneInput
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>

              <div className="rounded-lg border border-[#E8DED5] bg-[#FAFAF8] p-4">
                <label className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="mt-1 h-5 w-5 cursor-pointer rounded border-[#D7CBC1] accent-leather"
                  />
                  <span className="text-sm text-[#5A4A44]">
                    I agree to the{" "}
                    <Link
                      href="/terms-and-conditions"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-leather hover:underline"
                    >
                      Terms & Conditions
                    </Link>{" "}
                    and{" "}
                    <Link
                      href="/privacy-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-leather hover:underline"
                    >
                      Privacy Policy
                    </Link>
                    . *
                  </span>
                </label>
              </div>

              {(error || responseMessage) && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-xs p-3 rounded-lg text-center font-medium">
                  {typeof error === "string"
                    ? error
                    : responseMessage || "Submission failed. Please try again."}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-leather py-4 rounded-lg text-white font-bold hover:bg-[#5A2F22] disabled:opacity-50 transition-all shadow-md active:scale-[0.98]"
              >
                {loading ? (
                  <Spinner size="sm" />
                ) : (
                  <>
                    <span className="uppercase tracking-widest text-sm">
                      Request Access
                    </span>{" "}
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="mt-5 rounded-xl border border-[#E8DED5] bg-[#FAF7F4] p-4 text-center sm:p-5">
              <p className="text-sm text-[#5A4A44]">Already using LEDDAR?</p>
              <Link
                href="/login"
                className="mt-3 inline-flex w-full items-center justify-center rounded-lg border border-[#D7CBC1] bg-white px-4 py-2.5 text-sm font-semibold text-ink transition hover:border-gold hover:text-gold sm:w-auto sm:min-w-[180px]"
              >
                Go to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
