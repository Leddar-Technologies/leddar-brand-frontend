import api from "./api";

const SESSION_KEY      = "leddar_session";
const LAST_BRAND_KEY   = "leddar_last_brand_name";
const KYC_PROFILE_KEY  = "leddar_kyc_profile";
const DEFAULT_KYC_STATUS = "not_started";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.myleddar.com/api/v1";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

// Decode JWT payload without verifying signature (client-side only)
function decodeTokenPayload(token) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

// Returns seconds until token expires (negative = already expired)
function tokenSecondsLeft(token) {
  const payload = decodeTokenPayload(token);
  if (!payload?.exp) return -1;
  return payload.exp - Math.floor(Date.now() / 1000);
}

// ---------------------------------------------------------------------------
// Session
// ---------------------------------------------------------------------------

// Merges new tokens into the existing session without disturbing the other
// fields (email, kycStatus, etc). Used by api.js's response interceptor after
// a reactive refresh.
export function updateSessionTokens(token, refreshToken) {
  const session = getSession();
  if (!session) return;
  writeSession({ ...session, token, refreshToken });
}

export function getSession() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    if (!raw || raw === "null" || raw === "undefined") return null;
    const session = JSON.parse(raw);
    if (!session || !session.token) return null;

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

// ---------------------------------------------------------------------------
// Login
// ---------------------------------------------------------------------------

export async function login({ email, password, role }) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, role }),
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.message || result.error || "Login failed");

  const { token, refreshToken, user } = result.data;
  const kycProfile = readKycProfile();

  const session = {
    token,
    refreshToken,
    email: user.email,
    businessName: user.brand?.businessName || "Business",
    role: user.role,
    kycStatus: kycProfile.status,
    kycRejectionReason: kycProfile.rejectionReason || "",
  };

  writeSession(session);
  if (user.brand?.businessName) setLastBrandName(user.brand.businessName);
  return session;
}

// ---------------------------------------------------------------------------
// Resend verification email
// ---------------------------------------------------------------------------

export async function resendVerification(email) {
  const response = await fetch(`${API_URL}/auth/resend-verification`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });

  const result = await response.json();
  if (!response.ok) throw new Error(result.error || result.message || "Failed to resend verification email");
  return result.message;
}

// ---------------------------------------------------------------------------
// Refresh token
// ---------------------------------------------------------------------------

let _refreshing = false; // prevent concurrent refreshes

export async function refreshAccessToken() {
  if (typeof window === "undefined") return null;
  if (_refreshing) return null;

  const session = getSession();
  if (!session?.refreshToken) {
    logout();
    return null;
  }

  _refreshing = true;
  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: session.refreshToken }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.warn("[Auth] Refresh failed — logging out");
      logout();
      return null;
    }

    const { token, refreshToken } = result.data;

    // Update session with new tokens
    const updated = { ...session, token, refreshToken };
    writeSession(updated);
    console.log("[Auth] Token refreshed successfully");
    return token;
  } catch (err) {
    console.error("[Auth] Token refresh error:", err.message);
    return null;
  } finally {
    _refreshing = false;
  }
}

// ---------------------------------------------------------------------------
// Auto-refresh: checks every 60 seconds, refreshes if < 2 min left
// Call startTokenRefreshInterval() once on app mount
// ---------------------------------------------------------------------------

let _refreshInterval = null;

export function startTokenRefreshInterval() {
  if (typeof window === "undefined") return;
  if (_refreshInterval) return; // already running

  _refreshInterval = setInterval(async () => {
    const session = getSession();
    if (!session?.token) return;

    const secsLeft = tokenSecondsLeft(session.token);
    console.log(`[Auth] Token check — ${secsLeft}s remaining`);

    // Refresh if less than 2 minutes (120s) left
    if (secsLeft < 120) {
      await refreshAccessToken();
    }
  }, 60 * 1000); // every 60 seconds

  console.log("[Auth] Token refresh interval started");
}

export function stopTokenRefreshInterval() {
  if (_refreshInterval) {
    clearInterval(_refreshInterval);
    _refreshInterval = null;
  }
}

// ---------------------------------------------------------------------------
// Logout
// ---------------------------------------------------------------------------

export function logout() {
  stopTokenRefreshInterval();
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(SESSION_KEY);
    window.location.href = "/login";
  }
}

// ---------------------------------------------------------------------------
// KYC
// ---------------------------------------------------------------------------

export function startKycVerification() {
  const profile = readKycProfile();
  const nextProfile = { ...profile, status: "in_progress", updatedAt: new Date().toISOString() };
  writeKycProfile(nextProfile);
  return nextProfile;
}

export function retryKycVerification() {
  const profile = { status: "not_started", rejectionReason: "", updatedAt: new Date().toISOString() };
  writeKycProfile(profile);
  return profile;
}

export const verifyKycIdentity = async (formPayload) => {
  const { idType, idNumber, firstName, lastName, dob, companyName } = formPayload;

  let result;
  try {
    const response = await api.post("/brands/verify-kyc", {
      idType,
      idNumber,
      firstname:   firstName,
      lastname:    lastName,
      dob,
      companyName,
    });
    result = response.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Verification failed.");
  }

  // Map backend status to frontend status key
  const statusMap = { VERIFIED: "verified", FAILED: "rejected", PENDING: "pending_review" };
  const status    = statusMap[result.data?.status] || "rejected";

  const normalizedProfile = {
    status,
    idType:    result.data?.idType   || null,
    provider:  result.data?.provider || null,
    updatedAt: new Date().toISOString(),
  };

  writeKycProfile(normalizedProfile);
  return normalizedProfile;
};

export const getKycStatus = async () => {
  const session = getSession();
  if (!session?.token) return readKycProfile();

  try {
    const response = await api.get("/brands/kyc/status");
    const result   = response.data;
    const profile  = {
      status:     result.data?.status     || "not_started",
      ninStatus:  result.data?.ninStatus  || "not_started",
      cacStatus:  result.data?.cacStatus  || "not_started",
      provider:   result.data?.provider   || null,
      updatedAt:  new Date().toISOString(),
    };
    writeKycProfile(profile);
    return profile;
  } catch {
    return readKycProfile();
  }
};

// Step 1 — verify NIN
export const verifyNIN = async ({ nin, firstName, lastName, dob }) => {
  try {
    const response = await api.post("/brands/kyc/verify-nin", { nin, firstName, lastName, dob });
    return response.data.data?.ninStatus === "VERIFIED" ? "verified" : "rejected";
  } catch (err) {
    throw new Error(err.response?.data?.message || "NIN verification failed.");
  }
};

// Step 2 — verify CAC
export const verifyCAC = async ({ rcNumber, companyName }) => {
  try {
    const response = await api.post("/brands/kyc/verify-cac", { rcNumber, companyName });
    return response.data.data?.cacStatus === "VERIFIED" ? "verified" : "rejected";
  } catch (err) {
    throw new Error(err.response?.data?.message || "CAC verification failed.");
  }
};

// ---------------------------------------------------------------------------
// Brand profile (state + work address)
// ---------------------------------------------------------------------------
export const saveBrandProfile = async ({ state, workAddress }) => {
  try {
    const response = await api.patch("/brands/profile", { state, workAddress });
    return response.data.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Failed to save profile.");
  }
};

// ---------------------------------------------------------------------------
// Brand bank details
// ---------------------------------------------------------------------------
export const saveBrandBankDetails = async ({ bankName, bankCode, accountName, accountNumber }) => {
  try {
    const response = await api.put("/brands/bank-details", { bankName, bankCode, accountName, accountNumber });
    return response.data.data;
  } catch (err) {
    throw new Error(err.response?.data?.message || "Failed to save bank details.");
  }
};

// ---------------------------------------------------------------------------
// Fetch Paystack bank list
// ---------------------------------------------------------------------------
export const fetchBanks = async () => {
  try {
    const response = await api.get("/brands/banks");
    return response.data.data || [];
  } catch {
    return [];
  }
};

// ---------------------------------------------------------------------------
// Brand Meta
// ---------------------------------------------------------------------------

export function getLastBrandName() {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(LAST_BRAND_KEY) || "";
}

export function setLastBrandName(brandName) {
  if (typeof window !== "undefined" && brandName) {
    window.localStorage.setItem(LAST_BRAND_KEY, String(brandName).trim());
  }
}
