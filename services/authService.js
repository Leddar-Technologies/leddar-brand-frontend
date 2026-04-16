const SESSION_KEY = "leddar_session";
const LAST_BRAND_KEY = "leddar_last_brand_name";
const KYC_PROFILE_KEY = "leddar_kyc_profile";
const LEGACY_BRAND_NAME = "Zara Couture";
const DEFAULT_KYC_STATUS = "not_started";

function wait(ms = 500) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readKycProfile() {
  if (typeof window === "undefined") {
    return { status: DEFAULT_KYC_STATUS, rejectionReason: "" };
  }

  try {
    const raw = window.localStorage.getItem(KYC_PROFILE_KEY);
    if (!raw) {
      return { status: DEFAULT_KYC_STATUS, rejectionReason: "" };
    }
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
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(KYC_PROFILE_KEY, JSON.stringify(nextProfile));
}

function writeSession(nextSession) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession));
}

function updateSessionKycFields(kycProfile) {
  const session = getSession();
  if (!session || typeof window === "undefined") {
    return;
  }

  const nextSession = {
    ...session,
    kycStatus: kycProfile.status,
    kycRejectionReason: kycProfile.rejectionReason || "",
  };
  writeSession(nextSession);
}

function setKycState(status, rejectionReason = "") {
  const nextProfile = {
    status,
    rejectionReason,
    updatedAt: new Date().toISOString(),
  };

  writeKycProfile(nextProfile);
  updateSessionKycFields(nextProfile);
  return nextProfile;
}

function clearKycState() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(KYC_PROFILE_KEY);

  const session = getSession();
  if (!session) {
    return;
  }

  const nextSession = {
    ...session,
    kycStatus: DEFAULT_KYC_STATUS,
    kycRejectionReason: "",
  };

  writeSession(nextSession);
}

export function getSession() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    const session = raw ? JSON.parse(raw) : null;
    if (!session) {
      return null;
    }

    const kycProfile = readKycProfile();

    if (session.businessName === LEGACY_BRAND_NAME) {
      const migratedBrandName = getLastBrandName() || "Business";
      const migratedSession = {
        ...session,
        businessName: migratedBrandName,
        kycStatus: kycProfile.status,
        kycRejectionReason: kycProfile.rejectionReason || "",
      };
      writeSession(migratedSession);
      return migratedSession;
    }

    if (!session.kycStatus || session.kycStatus !== kycProfile.status) {
      const syncedSession = {
        ...session,
        kycStatus: kycProfile.status,
        kycRejectionReason: kycProfile.rejectionReason || "",
      };
      writeSession(syncedSession);
      return syncedSession;
    }

    return session;
  } catch {
    return null;
  }
}

export function getLastBrandName() {
  if (typeof window === "undefined") {
    return "";
  }

  const stored = window.localStorage.getItem(LAST_BRAND_KEY) || "";
  return stored === LEGACY_BRAND_NAME ? "" : stored;
}

export function setLastBrandName(brandName) {
  if (typeof window === "undefined") {
    return;
  }

  const cleaned = String(brandName || "").trim();
  if (!cleaned) {
    return;
  }

  window.localStorage.setItem(LAST_BRAND_KEY, cleaned);
}

export async function login({ email, password }) {
  // Replace with POST /auth/login when backend is ready.
  await wait();

  if (!email || !password) {
    throw new Error("Email and password are required.");
  }

  const lastBrandName = getLastBrandName();
  const businessName = lastBrandName || "Business";
  const kycProfile = readKycProfile();

  const session = {
    token: "mock-leddar-token",
    email,
    businessName,
    kycStatus: kycProfile.status,
    kycRejectionReason: kycProfile.rejectionReason || "",
  };

  writeSession(session);
  setLastBrandName(businessName);
  return session;
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

export async function verifyKycIdentity({ idType, idNumber }) {
  // Replace with POST /kyc/verify (VerifyMe integration) when backend is ready.
  await wait(900);

  const normalizedType = String(idType || "").trim();
  const normalizedNumber = String(idNumber || "").replace(/\s+/g, "");

  if (!normalizedType || !normalizedNumber) {
    throw new Error("ID type and ID number are required.");
  }

  if (normalizedNumber.length < 6) {
    throw new Error("Please enter a valid ID number.");
  }

  // Mock successful provider verification.
  return setKycState("verified", "");
}

export function logout() {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(SESSION_KEY);
}

export function resetKycProfile() {
  clearKycState();
}
