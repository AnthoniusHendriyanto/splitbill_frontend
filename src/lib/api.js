import { API } from '../config/api';
import useAuthStore from '../store/useAuthStore';

const authBase = `${API.base}/api/v1/auth`;
const billsBase = `${API.base}/api/v1/bills`;
const ocrBase = `${API.base}/api/v1/ocr`;

async function refreshAccessToken() {
  const refreshToken = useAuthStore.getState().refreshToken;
  if (!refreshToken) return false;

  try {
    const res = await fetch(`${authBase}/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!res.ok) return false;

    const data = await res.json();
    useAuthStore.getState().setTokens(data.access_token, data.refresh_token);
    return true;
  } catch {
    return false;
  }
}

async function request(path, options = {}) {
  const accessToken = useAuthStore.getState().accessToken;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    ...options.headers,
  };

  // For FormData (OCR), don't set Content-Type (browser sets boundary)
  const isFormData = options.body instanceof FormData;
  if (isFormData) {
    delete headers['Content-Type'];
  }

  const res = await fetch(`${API.base}${path}`, {
    ...options,
    headers,
  });

  // Token expired - try refresh
  if (res.status === 401) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      // Retry with new token
      const newToken = useAuthStore.getState().accessToken;
      const retryHeaders = {
        ...headers,
        Authorization: `Bearer ${newToken}`,
      };
      
      const retryRes = await fetch(`${API.base}${path}`, {
        ...options,
        headers: retryHeaders,
      });
      
      if (!retryRes.ok) {
        const err = await retryRes.json().catch(() => ({}));
        throw new Error(err?.error?.message || `HTTP ${retryRes.status}`);
      }
      
      return retryRes.status === 204 ? null : retryRes.json();
    }
    
    // Refresh failed - logout
    useAuthStore.getState().logout();
    throw new Error('Session expired. Please login again.');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `HTTP ${res.status}`);
  }

  return res.status === 204 ? null : res.json();
}

export const api = {
  // Auth
  login: (email, password) => 
    request('/api/v1/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  register: (name, email, password) => 
    request('/api/v1/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    }),

  logout: async (refreshToken) => {
    try {
      await request('/api/v1/auth/logout', {
        method: 'POST',
        body: JSON.stringify({ refresh_token: refreshToken }),
      });
    } catch {
      // Ignore logout errors
    }
  },

  // Bills
  getBills: (page = 1, limit = 20, fromDate = '', toDate = '') => {
    const params = new URLSearchParams({ page, limit });
    if (fromDate) params.append('from_date', fromDate);
    if (toDate) params.append('to_date', toDate);
    return request(`/api/v1/bills?${params}`);
  },

  getBill: (id) => request(`/api/v1/bills/${id}`),

  createBill: (billData) => 
    request('/api/v1/bills', {
      method: 'POST',
      body: JSON.stringify(billData),
    }),

  deleteBill: (id) => 
    request(`/api/v1/bills/${id}`, { method: 'DELETE' }),

  // OCR
  processOCR: async (file) => {
    const accessToken = useAuthStore.getState().accessToken;
    const formData = new FormData();
    formData.append('image', file);

    const res = await fetch(ocrBase, {
      method: 'POST',
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
      body: formData,
    });

    if (res.status === 401) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        const newToken = useAuthStore.getState().accessToken;
        const retryRes = await fetch(ocrBase, {
          method: 'POST',
          headers: { Authorization: `Bearer ${newToken}` },
          body: formData,
        });
        if (!retryRes.ok) {
          const err = await retryRes.json().catch(() => ({}));
          throw new Error(err?.error?.message || `HTTP ${retryRes.status}`);
        }
        return retryRes.json();
      }
      useAuthStore.getState().logout();
      throw new Error('Session expired. Please login again.');
    }

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.error?.message || `HTTP ${res.status}`);
    }

    return res.json();
  },

  // User
  getMe: () => request('/api/v1/users/me'),
  
  updateMe: (data) => request('/api/v1/users/me', {
    method: 'PUT',
    body: JSON.stringify(data),
  }),

  // Premium
  subscribeToPremium: (priceId) => request('/api/v1/premium/subscribe', {
    method: 'POST',
    body: JSON.stringify({ price_id: priceId }),
  }),

  // Payments
  getPayments: (billId) => request(`/api/v1/payments/${billId}`),
  settlePayment: (billId, paymentId, amount) => request(`/api/v1/payments/${billId}/settle`, {
    method: 'POST',
    body: JSON.stringify({ payment_id: paymentId, amount_paid: amount }),
  }),
};