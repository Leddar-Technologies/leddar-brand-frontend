jest.mock('axios');
jest.mock('../../services/authService', () => ({
  getSession: jest.fn(() => ({ token: 'mock-token' })),
}));

import axios from 'axios';
import {
  initializeSamplePayment,
  initializeProductionPayment,
  getBrandOrders,
  getBrandQuotes,
  submitSampleReview,
} from '../../services/paymentService';

// ─── initializeSamplePayment ─────────────────────────────────────────────────

describe('initializeSamplePayment', () => {
  test('throws if productType is missing', async () => {
    await expect(
      initializeSamplePayment({ email: 'b@b.com', quoteIntent: { quantity: 100 } })
    ).rejects.toThrow('Quote details are missing');
  });

  test('throws if quantity is missing', async () => {
    await expect(
      initializeSamplePayment({ email: 'b@b.com', quoteIntent: { productType: 'bags' } })
    ).rejects.toThrow('Quote details are missing');
  });

  test('throws if quoteIntent is null', async () => {
    await expect(
      initializeSamplePayment({ email: 'b@b.com', quoteIntent: null })
    ).rejects.toThrow('Quote details are missing');
  });

  test('calls correct endpoint with auth header', async () => {
    const responseData = { reference: 'REF-123', authorizationUrl: 'https://pay.stack', amount: 30000 };
    axios.post.mockResolvedValue({ data: { data: responseData } });

    const result = await initializeSamplePayment({
      email: 'b@b.com',
      quoteIntent: { productType: 'bags', quantity: 100 },
      fileIds: [],
    });

    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/payments/initialize-sample'),
      expect.objectContaining({ email: 'b@b.com' }),
      expect.objectContaining({ headers: expect.objectContaining({ Authorization: 'Bearer mock-token' }) })
    );
    expect(result).toEqual(responseData);
  });
});

// ─── initializeProductionPayment ─────────────────────────────────────────────

describe('initializeProductionPayment', () => {
  test('throws if neither orderId nor quoteId provided', async () => {
    await expect(
      initializeProductionPayment({ email: 'b@b.com' })
    ).rejects.toThrow('Either orderId or quoteId is required');
  });

  test('sends orderId when provided', async () => {
    axios.post.mockResolvedValue({ data: { data: {} } });
    await initializeProductionPayment({ email: 'b@b.com', orderId: 'o1' });
    expect(axios.post).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ orderId: 'o1' }),
      expect.any(Object)
    );
  });

  test('sends quoteId when no orderId', async () => {
    axios.post.mockResolvedValue({ data: { data: {} } });
    await initializeProductionPayment({ email: 'b@b.com', quoteId: 'q1' });
    const callArgs = axios.post.mock.calls[0][1];
    expect(callArgs).toHaveProperty('quoteId', 'q1');
    expect(callArgs).not.toHaveProperty('orderId');
  });
});

// ─── getBrandOrders ──────────────────────────────────────────────────────────

describe('getBrandOrders', () => {
  test('returns orders array', async () => {
    const orders = [{ id: 'o1', status: 'FLAT_FEE_PAID' }];
    axios.get.mockResolvedValue({ data: { data: orders } });
    const result = await getBrandOrders();
    expect(result).toEqual(orders);
  });

  test('calls with auth header', async () => {
    axios.get.mockResolvedValue({ data: { data: [] } });
    await getBrandOrders();
    expect(axios.get).toHaveBeenCalledWith(
      expect.stringContaining('/brands/orders'),
      expect.objectContaining({ headers: { Authorization: 'Bearer mock-token' } })
    );
  });
});

// ─── submitSampleReview ──────────────────────────────────────────────────────

describe('submitSampleReview', () => {
  test('posts decision and feedback to correct endpoint', async () => {
    axios.post.mockResolvedValue({ data: { data: { reviewed: true } } });
    const result = await submitSampleReview({ orderId: 'o1', decision: 'APPROVED', feedback: 'Great!' });
    expect(axios.post).toHaveBeenCalledWith(
      expect.stringContaining('/brands/orders/o1/review'),
      { decision: 'APPROVED', feedback: 'Great!' },
      expect.any(Object)
    );
    expect(result).toEqual({ reviewed: true });
  });
});
