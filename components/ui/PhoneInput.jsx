import { useState } from "react";
import { Phone, CheckCircle, AlertCircle } from "lucide-react";

/**
 * Normalises any Nigerian phone input to +2348XXXXXXXXX format.
 *
 * Accepted inputs:
 *   08141955755   → +2348141955755  (local 11-digit)
 *   2348141955755 → +2348141955755  (intl without +)
 *  +2348141955755 → +2348141955755  (already correct)
 */
export function normalizePhone(raw) {
  if (!raw) return "";
  const digits = raw.replace(/\D/g, ""); // strip everything except digits

  if (digits.startsWith("234")) {
    return "+" + digits;           // 234... → +234...
  }
  if (digits.startsWith("0")) {
    return "+234" + digits.slice(1); // 08... → +2348...
  }
  // already has + and starts with country code, or unknown — prepend + to whatever digits we have
  if (raw.startsWith("+")) {
    return "+" + digits;
  }
  return "+" + digits;
}

/**
 * Validates the normalised value.
 * Nigerian number: +234 + 10 digits = 14 chars total.
 * Other international: + + 7–15 digits.
 */
export function validatePhone(normalised) {
  if (!normalised) return false;
  if (normalised.startsWith("+234")) {
    // Must be exactly +234 followed by 10 digits
    return /^\+234\d{10}$/.test(normalised);
  }
  // General international
  return /^\+\d{7,15}$/.test(normalised);
}

export function getPhoneError(value) {
  if (!value) return "Phone number is required";
  const norm = normalizePhone(value);
  if (norm.startsWith("+234")) {
    const digits = norm.slice(4); // digits after +234
    if (digits.length < 10) return `Incomplete — ${10 - digits.length} more digit(s) needed`;
    if (digits.length > 10) return "Too many digits for a Nigerian number";
  }
  if (!validatePhone(norm)) return "Enter a valid number, e.g. 08012345678 or +2348012345678";
  return null;
}

export default function PhoneInput({
  label = "WhatsApp/Phone *",
  value = "",
  onChange,
  error,
  name = "phone",
  className = "",
}) {
  const [touched, setTouched] = useState(false);

  const norm = normalizePhone(value);
  const isValid = value ? validatePhone(norm) : null;
  const phoneError = touched && value ? getPhoneError(value) : null;
  const showError = !!(phoneError || (touched && error));
  const showSuccess = touched && isValid && !phoneError;

  function handleChange(e) {
    // Allow digits, +, spaces, dashes — strip everything else
    const raw = e.target.value.replace(/[^\d+\s\-]/g, "");
    onChange({ target: { name, value: raw } });
  }

  function handleBlur() {
    setTouched(true);
    if (value) {
      // Auto-normalise on blur
      const normalised = normalizePhone(value);
      onChange({ target: { name, value: normalised } });
    }
  }

  return (
    <div className={`w-full ${className}`}>
      {label && (
        <label className="mb-1 block text-xs font-semibold text-[#3C2F2A]">
          {label}
        </label>
      )}

      <div className="relative flex items-stretch">
        {/* Prefix badge */}
        <div className="flex items-center gap-1.5 rounded-l-lg border border-r-0 border-[#D7CBC1] bg-[#F4EEE9] px-3 select-none">
          <Phone size={14} className="text-[#8B6355]" />
          <span className="text-sm font-bold text-[#5A2F22]">🇳🇬</span>
        </div>

        <input
          type="tel"
          name={name}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="08012345678 or +2348012345678"
          className={`w-full rounded-r-lg border px-4 py-3 pr-10 outline-none transition-colors focus:ring-1 ${
            showError
              ? "border-red-400 bg-red-50 focus:border-red-400 focus:ring-red-200"
              : showSuccess
              ? "border-[#2D6A4F] bg-[#F0FAF4] focus:border-[#2D6A4F] focus:ring-[#2D6A4F33]"
              : value
              ? "border-leather bg-[#FDF5EE] focus:border-leather focus:ring-leather"
              : "border-[#D7CBC1] bg-white focus:border-leather focus:ring-leather"
          }`}
        />

        {/* Status icon */}
        {touched && value && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isValid && !phoneError ? (
              <CheckCircle size={16} className="text-[#2D6A4F]" />
            ) : (
              <AlertCircle size={16} className="text-red-400" />
            )}
          </div>
        )}
      </div>

      {/* Hint or error */}
      {phoneError ? (
        <p className="mt-1 text-[10px] font-medium text-red-500">{phoneError}</p>
      ) : error ? (
        <p className="mt-1 text-[10px] font-medium text-red-500">{error}</p>
      ) : (
        <p className="mt-1 text-[10px] text-[#A39289]">
          e.g. 08012345678 or +2348012345678
        </p>
      )}
    </div>
  );
}
