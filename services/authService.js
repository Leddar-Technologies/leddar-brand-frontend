const SESSION_KEY = "leddar_session";

function wait(ms = 500) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function getSession() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function login({ email, password }) {
  // Replace with POST /auth/login when backend is ready.
  await wait();

  if (!email || !password) {
    throw new Error("Email and password are required.");
  }

  const session = {
    token: "mock-leddar-token",
    email,
    businessName: "Zara Couture",
  };

  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function logout() {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.removeItem(SESSION_KEY);
}
