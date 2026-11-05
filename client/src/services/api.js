const API_BASE = import.meta.env.VITE_API_BASE_URL
  ? `${import.meta.env.VITE_API_BASE_URL.replace(/\/$/, '')}/api`
  : '/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('ev_token');
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
  register: (body) =>
    fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(handleResponse),

  login: (body) =>
    fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    }).then(handleResponse),

  getMe: () =>
    fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders()
    }).then(handleResponse),

  updateProfile: (body) =>
    fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(body)
    }).then(handleResponse),

  // Chargers
  getNearbyChargers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/chargers/nearby?${query}`).then(handleResponse);
  },

  getChargerById: (id) =>
    fetch(`${API_BASE}/chargers/${id}`, {
      headers: getAuthHeaders()
    }).then(handleResponse),

  createCharger: (body) =>
    fetch(`${API_BASE}/chargers`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body)
    }).then(handleResponse),

  updateCharger: (id, body) =>
    fetch(`${API_BASE}/chargers/${id}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(body)
    }).then(handleResponse),

  deleteCharger: (id) =>
    fetch(`${API_BASE}/chargers/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    }).then(handleResponse),

  getMyChargers: () =>
    fetch(`${API_BASE}/chargers/my-listings`, {
      headers: getAuthHeaders()
    }).then(handleResponse),

  // Bookings
  checkAvailability: (chargerId, date) =>
    fetch(`${API_BASE}/bookings/check-availability?chargerId=${chargerId}&date=${date}`).then(handleResponse),

  createBooking: (body) =>
    fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body)
    }).then(handleResponse),

  getMyBookings: (status) => {
    const q = status ? `?status=${status}` : '';
    return fetch(`${API_BASE}/bookings/my-bookings${q}`, {
      headers: getAuthHeaders()
    }).then(handleResponse);
  },

  getHostBookings: (status) => {
    const q = status ? `?status=${status}` : '';
    return fetch(`${API_BASE}/bookings/host-bookings${q}`, {
      headers: getAuthHeaders()
    }).then(handleResponse);
  },

  getBookingById: (id) =>
    fetch(`${API_BASE}/bookings/${id}`, {
      headers: getAuthHeaders()
    }).then(handleResponse),

  cancelBooking: (id, reason) =>
    fetch(`${API_BASE}/bookings/${id}/cancel`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason })
    }).then(handleResponse),

  // Charging Sessions
  startSession: (body) =>
    fetch(`${API_BASE}/sessions/start`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body)
    }).then(handleResponse),

  updateTelemetry: (sessionId, body) =>
    fetch(`${API_BASE}/sessions/${sessionId}/readings`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body)
    }).then(handleResponse),

  stopSession: (sessionId, body) =>
    fetch(`${API_BASE}/sessions/${sessionId}/stop`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body)
    }).then(handleResponse),

  getSessionById: (id) =>
    fetch(`${API_BASE}/sessions/${id}`, {
      headers: getAuthHeaders()
    }).then(handleResponse),

  getActiveSession: () =>
    fetch(`${API_BASE}/sessions/active`, {
      headers: getAuthHeaders()
    }).then(handleResponse),

  getSessionHistory: (role) => {
    const q = role ? `?role=${role}` : '';
    return fetch(`${API_BASE}/sessions/history${q}`, {
      headers: getAuthHeaders()
    }).then(handleResponse);
  },

  // Payments & Earnings
  createPaymentOrder: (body) =>
    fetch(`${API_BASE}/payments/create-order`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body)
    }).then(handleResponse),

  verifyPayment: (body) =>
    fetch(`${API_BASE}/payments/verify`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body)
    }).then(handleResponse),

  getInvoice: (id) =>
    fetch(`${API_BASE}/payments/invoice/${id}`, {
      headers: getAuthHeaders()
    }).then(handleResponse),

  getPaymentHistory: (role) => {
    const q = role ? `?role=${role}` : '';
    return fetch(`${API_BASE}/payments/history${q}`, {
      headers: getAuthHeaders()
    }).then(handleResponse);
  },

  getHostEarnings: () =>
    fetch(`${API_BASE}/payments/host-earnings`, {
      headers: getAuthHeaders()
    }).then(handleResponse),

  requestPayout: (body) =>
    fetch(`${API_BASE}/payments/request-payout`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body)
    }).then(handleResponse),

  // Reviews
  submitReview: (body) =>
    fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body)
    }).then(handleResponse),

  getChargerReviews: (chargerId) =>
    fetch(`${API_BASE}/reviews/charger/${chargerId}`).then(handleResponse),

  respondToReview: (reviewId, hostResponse) =>
    fetch(`${API_BASE}/reviews/${reviewId}/response`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ hostResponse })
    }).then(handleResponse),

  // Dashboard Stats
  getDashboardStats: () =>
    fetch(`${API_BASE}/stats/dashboard`, {
      headers: getAuthHeaders()
    }).then(handleResponse)
};
