// Production API Service connected to live backend
const API_BASE = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')}/api`
  : '/api';

// Current active token provider function or stored token
let currentTokenProvider = null;

export const setTokenProvider = (provider) => {
  currentTokenProvider = provider;
};

const getAuthHeaders = async () => {
  let token = null;
  if (currentTokenProvider && typeof currentTokenProvider === 'function') {
    try {
      token = await currentTokenProvider();
    } catch {
      token = null;
    }
  }

  if (!token) {
    token = localStorage.getItem('ev_token');
  }

  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const errorMsg = data.message || `Request failed with status ${response.status}`;
    throw new Error(errorMsg);
  }
  return data;
};

export const api = {
  // Auth
  register: async (body) => {
    const headers = await getAuthHeaders();
    return fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    }).then(handleResponse);
  },

  syncUser: async (body = {}) => {
    const headers = await getAuthHeaders();
    return fetch(`${API_BASE}/auth/sync`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    }).then(handleResponse);
  },

  login: async (body) => {
    const headers = await getAuthHeaders();
    return fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    }).then(handleResponse);
  },

  getMe: async () => {
    const headers = await getAuthHeaders();
    return fetch(`${API_BASE}/auth/me`, {
      headers
    }).then(handleResponse);
  },

  updateProfile: async (body) => {
    const headers = await getAuthHeaders();
    return fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body)
    }).then(handleResponse);
  },

  // Chargers
  getNearbyChargers: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/chargers/nearby?${query}`).then(handleResponse);
  },

  getChargerById: async (id) => {
    const headers = await getAuthHeaders();
    return fetch(`${API_BASE}/chargers/${id}`, {
      headers
    }).then(handleResponse);
  },

  createCharger: async (body) => {
    const headers = await getAuthHeaders();
    return fetch(`${API_BASE}/chargers`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    }).then(handleResponse);
  },

  updateCharger: async (id, body) => {
    const headers = await getAuthHeaders();
    return fetch(`${API_BASE}/chargers/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body)
    }).then(handleResponse);
  },

  deleteCharger: async (id) => {
    const headers = await getAuthHeaders();
    return fetch(`${API_BASE}/chargers/${id}`, {
      method: 'DELETE',
      headers
    }).then(handleResponse);
  },

  getMyChargers: async () => {
    const headers = await getAuthHeaders();
    return fetch(`${API_BASE}/chargers/my-listings`, {
      headers
    }).then(handleResponse);
  },

  // Bookings
  checkAvailability: async (chargerId, date) => {
    return fetch(
      `${API_BASE}/bookings/check-availability?chargerId=${encodeURIComponent(chargerId)}&date=${encodeURIComponent(date)}`
    ).then(handleResponse);
  },

  createBooking: async (body) => {
    const headers = await getAuthHeaders();
    return fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    }).then(handleResponse);
  },

  getMyBookings: async (status) => {
    const headers = await getAuthHeaders();
    const q = status ? `?status=${encodeURIComponent(status)}` : '';
    return fetch(`${API_BASE}/bookings/my-bookings${q}`, {
      headers
    }).then(handleResponse);
  },

  getHostBookings: async (status) => {
    const headers = await getAuthHeaders();
    const q = status ? `?status=${encodeURIComponent(status)}` : '';
    return fetch(`${API_BASE}/bookings/host-bookings${q}`, {
      headers
    }).then(handleResponse);
  },

  getBookingById: async (id) => {
    const headers = await getAuthHeaders();
    return fetch(`${API_BASE}/bookings/${id}`, {
      headers
    }).then(handleResponse);
  },

  cancelBooking: async (id, reason) => {
    const headers = await getAuthHeaders();
    return fetch(`${API_BASE}/bookings/${id}/cancel`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ reason })
    }).then(handleResponse);
  },

  // Charging Sessions
  startSession: async (body) => {
    const headers = await getAuthHeaders();
    return fetch(`${API_BASE}/sessions/start`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    }).then(handleResponse);
  },

  updateTelemetry: async (sessionId, body) => {
    const headers = await getAuthHeaders();
    return fetch(`${API_BASE}/sessions/${sessionId}/readings`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    }).then(handleResponse);
  },

  stopSession: async (sessionId, body) => {
    const headers = await getAuthHeaders();
    return fetch(`${API_BASE}/sessions/${sessionId}/stop`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    }).then(handleResponse);
  },

  getSessionById: async (id) => {
    const headers = await getAuthHeaders();
    return fetch(`${API_BASE}/sessions/${id}`, {
      headers
    }).then(handleResponse);
  },

  getActiveSession: async () => {
    const headers = await getAuthHeaders();
    return fetch(`${API_BASE}/sessions/active`, {
      headers
    }).then(handleResponse);
  },

  getSessionHistory: async (role) => {
    const headers = await getAuthHeaders();
    const q = role ? `?role=${encodeURIComponent(role)}` : '';
    return fetch(`${API_BASE}/sessions/history${q}`, {
      headers
    }).then(handleResponse);
  },

  // Payments & Earnings
  createPaymentOrder: async (body) => {
    const headers = await getAuthHeaders();
    return fetch(`${API_BASE}/payments/create-order`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    }).then(handleResponse);
  },

  verifyPayment: async (body) => {
    const headers = await getAuthHeaders();
    return fetch(`${API_BASE}/payments/verify`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    }).then(handleResponse);
  },

  getInvoice: async (id) => {
    const headers = await getAuthHeaders();
    return fetch(`${API_BASE}/payments/invoice/${id}`, {
      headers
    }).then(handleResponse);
  },

  getPaymentHistory: async (role) => {
    const headers = await getAuthHeaders();
    const q = role ? `?role=${encodeURIComponent(role)}` : '';
    return fetch(`${API_BASE}/payments/history${q}`, {
      headers
    }).then(handleResponse);
  },

  getHostEarnings: async () => {
    const headers = await getAuthHeaders();
    return fetch(`${API_BASE}/payments/host-earnings`, {
      headers
    }).then(handleResponse);
  },

  requestPayout: async (body) => {
    const headers = await getAuthHeaders();
    return fetch(`${API_BASE}/payments/request-payout`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    }).then(handleResponse);
  },

  // Reviews
  submitReview: async (body) => {
    const headers = await getAuthHeaders();
    return fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    }).then(handleResponse);
  },

  getChargerReviews: async (chargerId) => {
    return fetch(`${API_BASE}/reviews/charger/${encodeURIComponent(chargerId)}`).then(handleResponse);
  },

  respondToReview: async (reviewId, hostResponse) => {
    const headers = await getAuthHeaders();
    return fetch(`${API_BASE}/reviews/${reviewId}/response`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ hostResponse })
    }).then(handleResponse);
  },

  // Dashboard Stats
  getDashboardStats: async () => {
    const headers = await getAuthHeaders();
    return fetch(`${API_BASE}/stats/dashboard`, {
      headers
    }).then(handleResponse);
  }
};
