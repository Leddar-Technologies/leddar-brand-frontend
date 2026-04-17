const SESSION_KEY = "leddar_session";
const LAST_BRAND_KEY = "leddar_last_brand_name";
const KYC_PROFILE_KEY = "leddar_kyc_profile";
const DEFAULT_KYC_STATUS = "not_started";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// --- Helper Functions ---

function readKycProfile() {
  if (typeof window === "undefined")
    return { status: DEFAULT_KYC_STATUS, rejectionReason: "" };
  try {
    const raw = window.localStorage.getItem(KYC_PROFILE_KEY);
    if (!raw) return { status: DEFAULT_KYC_STATUS, rejectionReason: "" };
    const parsed = JSON.parse(raw);
    return {
      status: parsed?.status || DEFAULT_KYC_STATUS,
      rejectionReason: parsed?.rejectionReason || "",
      updatedAt: parsed?.updatedAt || null,
    };
  } catch {
    return { status: DEFAULT_KYC_STATUS, rejectionReason: "" };
  }
}

function writeKycProfile(nextProfile) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KYC_PROFILE_KEY, JSON.stringify(nextProfile));
  }
}

function writeSession(nextSession) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
  }
}

// --- Exported Auth Functions ---

export function getSession() {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    // Strict check: handles actual null, or strings "null"/"undefined"
    if (!raw || raw === "null" || raw === "undefined") return null;

    const session = JSON.parse(raw);
    if (!session || !session.token) return null;

    // Sync KYC status from local profile into session if they differ
    const kycProfile = readKycProfile();
    if (session.kycStatus !== kycProfile.status) {
      session.kycStatus = kycProfile.status;
      session.kycRejectionReason = kycProfile.rejectionReason || "";
      writeSession(session);
    }

    return session;
  } catch (err) {
    console.error("Session parse error:", err);
    return null;
  }
}

export async function login({ email, password }) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const result = await response.json();

  if (!response.ok) {
    // This will catch the 403 "Awaiting admin approval" or 401 "Invalid credentials"
    throw new Error(result.error || "Login failed");
  }

  // result.data should contain user and token from your backend controller
  const { token, user } = result.data;
  const kycProfile = readKycProfile();

  const session = {
    token,
    email: user.email,
    businessName: user.brand?.businessName || "Business",
    role: user.role,
    kycStatus: kycProfile.status,
    kycRejectionReason: kycProfile.rejectionReason || "",
  };

  writeSession(session);

  if (user.brand?.businessName) {
    setLastBrandName(user.brand.businessName);
  }

  return session;
}

export function logout() {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(SESSION_KEY);
    // Optional: window.localStorage.removeItem(KYC_PROFILE_KEY);
    window.location.href = "/login";
  }
}

// --- KYC Management ---

export function setKycState(status, rejectionReason = "") {
  const nextProfile = {
    status,
    rejectionReason,
    updatedAt: new Date().toISOString(),
  };

  writeKycProfile(nextProfile);

  // Sync into active session
  const session = getSession();
  if (session) {
    session.kycStatus = status;
    session.kycRejectionReason = rejectionReason;
    writeSession(session);
  }
  return nextProfile;
}

export function getKycProfile() {
  return readKycProfile();
}
export function getKycStatus() {
  return readKycProfile().status;
}
export function startKycVerification() {
  return setKycState("in_progress");
}
export function markKycPendingReview() {
  return setKycState("pending_review");
}
export function markKycVerified() {
  return setKycState("verified");
}
export function markKycRejected(reason) {
  return setKycState("rejected", String(reason || "").trim());
}
export function retryKycVerification() {
  return setKycState("not_started", "");
}
export function resetKycProfile() {
  if (typeof window !== "undefined")
    window.localStorage.removeItem(KYC_PROFILE_KEY);
}

// --- Brand Meta ---

export function getLastBrandName() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(LAST_BRAND_KEY) || "";
}

export function setLastBrandName(brandName) {
  if (typeof window !== "undefined" && brandName) {
    window.localStorage.setItem(LAST_BRAND_KEY, String(brandName).trim());
  }
}
