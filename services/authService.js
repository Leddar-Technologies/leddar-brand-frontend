import axios from "axios";

const SESSION_KEY = "leddar_session";
const LAST_BRAND_KEY = "leddar_last_brand_name";
const KYC_PROFILE_KEY = "leddar_kyc_profile";
const DEFAULT_KYC_STATUS = "not_started";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

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
    if (!raw || raw === "null" || raw === "undefined") return null;

    const session = JSON.parse(raw);
    if (!session || !session.token) return null;

    const kycProfile = readKycProfile();
    // Sync session with local KYC profile if they differ
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

export async function login({ email, password, role }) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, role }),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.message || result.error || "Login failed");
  }

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
    window.location.href = "/login";
  }
}

// --- KYC Management ---

/**
 * Transitions the local KYC state to 'in_progress'
 */
export function startKycVerification() {
  const profile = readKycProfile();
  const nextProfile = {
    ...profile,
    status: "in_progress",
    updatedAt: new Date().toISOString(),
  };
  writeKycProfile(nextProfile);
  return nextProfile;
}

/**
 * Resets the local KYC state to 'not_started' to allow a retry
 */
export function retryKycVerification() {
  const profile = {
    status: "not_started",
    rejectionReason: "",
    updatedAt: new Date().toISOString(),
  };
  writeKycProfile(profile);
  return profile;
}

// --- MOCK: verifyKycIdentity ---
// Replace this function with the real axios call when the API is ready.
//
// Mock behaviour (controlled by the last digit of idNumber):
//   ends in "0"  → rejected  (e.g. "123450")
//   ends in "9"  → pending   (e.g. "123459")
//   anything else → verified
export const verifyKycIdentity = async (formPayload) => {
  await new Promise((r) => setTimeout(r, 800)); // simulate network

  const { idNumber } = formPayload;
  const last = String(idNumber).slice(-1);

  let status = "verified";
  let rejectionReason = "";

  if (last === "0") {
    status = "rejected";
    rejectionReason = "ID number could not be matched in the registry.";
  } else if (last === "9") {
    status = "pending";
  }

  const normalizedProfile = {
    status,
    rejectionReason,
    updatedAt: new Date().toISOString(),
  };

  writeKycProfile(normalizedProfile);
  return normalizedProfile;
};

// --- MOCK: getKycStatus ---
// Replace this function with the real axios call when the API is ready.
export const getKycStatus = async () => {
  await new Promise((r) => setTimeout(r, 300)); // simulate network
  return readKycProfile();
};

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
