const SESSION_KEY     = 'leddar_session';
const LAST_BRAND_KEY  = 'leddar_last_brand_name';
const KYC_PROFILE_KEY = 'leddar_kyc_profile';

beforeEach(() => {
  localStorage.clear();
  global.fetch = jest.fn();
  delete window.location;
  window.location = { href: '' };
});

import {
  getSession,
  login,
  logout,
  getLastBrandName,
  setLastBrandName,
  startKycVerification,
  retryKycVerification,
} from '../../services/authService';

// ─── getSession ──────────────────────────────────────────────────────────────

describe('getSession', () => {
  test('returns null when nothing stored', () => {
    expect(getSession()).toBeNull();
  });

  test('returns null for invalid JSON', () => {
    localStorage.setItem(SESSION_KEY, 'not-json{{{');
    expect(getSession()).toBeNull();
  });

  test('returns null when token is missing', () => {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ email: 'x@x.com' }));
    expect(getSession()).toBeNull();
  });

  test('returns session when valid', () => {
    const session = { token: 'tok', refreshToken: 'ref', email: 'b@b.com', role: 'BRAND' };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    const result = getSession();
    expect(result.token).toBe('tok');
    expect(result.email).toBe('b@b.com');
  });

  test('syncs kycStatus from KYC profile', () => {
    localStorage.setItem(KYC_PROFILE_KEY, JSON.stringify({ status: 'verified' }));
    localStorage.setItem(SESSION_KEY, JSON.stringify({ token: 'tok', kycStatus: 'not_started' }));
    const result = getSession();
    expect(result.kycStatus).toBe('verified');
  });
});

// ─── login ───────────────────────────────────────────────────────────────────

describe('login', () => {
  test('throws on non-ok response', async () => {
    fetch.mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Awaiting admin approval' }),
    });
    await expect(login({ email: 'b@b.com', password: 'pass', role: 'BRAND' }))
      .rejects.toThrow('Awaiting admin approval');
  });

  test('stores session and returns it on success', async () => {
    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        data: {
          token: 'access-tok',
          refreshToken: 'refresh-tok',
          user: {
            email: 'b@b.com',
            role: 'BRAND',
            brand: { businessName: 'Cool Brand' },
          },
        },
      }),
    });
    const session = await login({ email: 'b@b.com', password: 'pass', role: 'BRAND' });
    expect(session.token).toBe('access-tok');
    expect(session.businessName).toBe('Cool Brand');
    const stored = JSON.parse(localStorage.getItem(SESSION_KEY));
    expect(stored.token).toBe('access-tok');
  });
});

// ─── logout ──────────────────────────────────────────────────────────────────

describe('logout', () => {
  test('clears session and redirects to /login', () => {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ token: 'tok' }));
    logout();
    expect(localStorage.getItem(SESSION_KEY)).toBeNull();
    expect(window.location.href).toBe('/login');
  });
});

// ─── setLastBrandName / getLastBrandName ─────────────────────────────────────

describe('brand name helpers', () => {
  test('stores and retrieves brand name', () => {
    setLastBrandName('Acme Leathers');
    expect(getLastBrandName()).toBe('Acme Leathers');
  });

  test('trims whitespace when storing', () => {
    setLastBrandName('  Acme  ');
    expect(getLastBrandName()).toBe('Acme');
  });

  test('returns empty string when nothing stored', () => {
    expect(getLastBrandName()).toBe('');
  });

  test('ignores empty string', () => {
    setLastBrandName('Old Name');
    setLastBrandName('');
    expect(getLastBrandName()).toBe('Old Name'); // not overwritten
  });
});

// ─── KYC helpers ─────────────────────────────────────────────────────────────

describe('startKycVerification', () => {
  test('sets KYC status to in_progress', () => {
    const result = startKycVerification();
    expect(result.status).toBe('in_progress');
    const stored = JSON.parse(localStorage.getItem(KYC_PROFILE_KEY));
    expect(stored.status).toBe('in_progress');
  });

  test('preserves existing profile fields', () => {
    localStorage.setItem(KYC_PROFILE_KEY, JSON.stringify({ status: 'not_started', rejectionReason: 'docs blurry' }));
    const result = startKycVerification();
    expect(result.status).toBe('in_progress');
  });
});

describe('retryKycVerification', () => {
  test('resets KYC status to not_started', () => {
    localStorage.setItem(KYC_PROFILE_KEY, JSON.stringify({ status: 'verified' }));
    const result = retryKycVerification();
    expect(result.status).toBe('not_started');
    expect(result.rejectionReason).toBe('');
  });
});
