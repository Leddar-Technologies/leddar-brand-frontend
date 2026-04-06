const SESSION_KEY = "leddar_session";
const LAST_BRAND_KEY = "leddar_last_brand_name";
const LEGACY_BRAND_NAME = "Zara Couture";

function wait(ms = 500) {
  return new Promise((resolve) => setTimeout(resolve, ms));
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

    if (session.businessName === LEGACY_BRAND_NAME) {
      const migratedBrandName = getLastBrandName() || "Business";
      const migratedSession = { ...session, businessName: migratedBrandName };
      window.localStorage.setItem(SESSION_KEY, JSON.stringify(migratedSession));
      return migratedSession;
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

  const session = {
    token: "mock-leddar-token",
    email,
    businessName,
  };

  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  setLastBrandName(businessName);
  return session;
}

export function logout() {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(SESSION_KEY);
}
