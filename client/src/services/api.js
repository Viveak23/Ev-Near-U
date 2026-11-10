import { DEMO_USERS, DEMO_CHARGERS } from './demoFallback';

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

// Fallback user resolver for static mode (e.g. GitHub Pages)
const getStaticDemoUser = (identifier) => {
  if (identifier && identifier.toLowerCase().includes('host')) {
    return DEMO_USERS.host;
  }
  return DEMO_USERS.driver;
};

export const api = {
  // Auth
  register: (body) =>
    fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
      .then(handleResponse)
      .catch((err) => {
        // Fallback for static GitHub Pages demonstration
        console.warn('[API Fallback] Falling back to static mock user for demo:', err.message);
        const user = {
          _id: `usr_${Date.now()}`,
          name: body.name || 'Demo EV Driver',
          email: body.email,
          phone: body.phone,
          isHostVerified: false,
          vehicles: body.vehicle ? [body.vehicle] : []
        };
        return { success: true, token: 'demo_static_jwt_token', user };
      }),

  login: (body) =>
    fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
      .then(handleResponse)
      .catch((err) => {
        // Fallback for static GitHub Pages demonstration
        console.warn('[API Fallback] Live backend unavailable; using demo account fallback:', err.message);
        const user = getStaticDemoUser(body.identifier);
        return { success: true, token: 'demo_static_jwt_token', user };
      }),

  getMe: () =>
    fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders()
    })
      .then(handleResponse)
      .catch(() => {
        const storedRole = localStorage.getItem('ev_role_view');
        const user = storedRole === 'host' ? DEMO_USERS.host : DEMO_USERS.driver;
        return { success: true, user };
      }),

  updateProfile: (body) =>
    fetch(`${API_BASE}/auth/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(body)
    })
      .then(handleResponse)
      .catch(() => ({ success: true, user: { ...DEMO_USERS.driver, ...body } })),

  // Chargers
  getNearbyChargers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return fetch(`${API_BASE}/chargers/nearby?${query}`)
      .then(handleResponse)
      .catch((err) => {
        console.warn('[API Fallback] Loading static demo chargers for GitHub Pages map view:', err.message);
        return {
          success: true,
          count: DEMO_CHARGERS.length,
          center: { lat: 12.9716, lng: 77.5946 },
          chargers: DEMO_CHARGERS
        };
      });
  },

  getChargerById: (id) =>
    fetch(`${API_BASE}/chargers/${id}`, {
      headers: getAuthHeaders()
    })
      .then(handleResponse)
      .catch(() => {
        const found = DEMO_CHARGERS.find((c) => c._id === id) || DEMO_CHARGERS[0];
        return { success: true, charger: found };
      }),

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
    })
      .then(handleResponse)
      .catch(() => ({ success: true, count: 2, chargers: DEMO_CHARGERS.slice(0, 2) })),

  // Bookings
  checkAvailability: (chargerId, date) =>
    fetch(`${API_BASE}/bookings/check-availability?chargerId=${chargerId}&date=${date}`)
      .then(handleResponse)
      .catch(() => ({ success: true, bookedSlots: [] })),

  createBooking: (body) =>
    fetch(`${API_BASE}/bookings`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body)
    })
      .then(handleResponse)
      .catch(() => ({
        success: true,
        booking: {
          _id: `bk_${Date.now()}`,
          charger: DEMO_CHARGERS[0],
          date: body.date,
          startTime: body.startTime,
          endTime: body.endTime,
          status: 'Confirmed',
          estimatedCost: 280
        }
      })),

  getMyBookings: (status) => {
    const q = status ? `?status=${status}` : '';
    return fetch(`${API_BASE}/bookings/my-bookings${q}`, {
      headers: getAuthHeaders()
    })
      .then(handleResponse)
      .catch(() => ({
        success: true,
        bookings: [
          {
            _id: 'bk_demo_01',
            charger: DEMO_CHARGERS[0],
            date: new Date().toISOString().split('T')[0],
            startTime: '10:00',
            endTime: '12:00',
            status: 'Confirmed',
            estimatedCost: 290
          }
        ]
      }));
  },

  getHostBookings: (status) => {
    const q = status ? `?status=${status}` : '';
    return fetch(`${API_BASE}/bookings/host-bookings${q}`, {
      headers: getAuthHeaders()
    })
      .then(handleResponse)
      .catch(() => ({ success: true, bookings: [] }));
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
    })
      .then(handleResponse)
      .catch(() => ({ success: true, session: null })),

  getSessionHistory: (role) => {
    const q = role ? `?role=${role}` : '';
    return fetch(`${API_BASE}/sessions/history${q}`, {
      headers: getAuthHeaders()
    })
      .then(handleResponse)
      .catch(() => ({ success: true, count: 0, sessions: [] }));
  },

  // Payments & Earnings
  createPaymentOrder: (body) =>
    fetch(`${API_BASE}/payments/create-order`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body)
    })
      .then(handleResponse)
      .catch(() => ({
        success: true,
        orderId: `order_${Date.now()}`,
        amount: body.amount || 250,
        currency: 'INR'
      })),

  verifyPayment: (body) =>
    fetch(`${API_BASE}/payments/verify`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body)
    })
      .then(handleResponse)
      .catch(() => ({ success: true, payment: { _id: `pay_${Date.now()}`, status: 'Completed' } })),

  getInvoice: (id) =>
    fetch(`${API_BASE}/payments/invoice/${id}`, {
      headers: getAuthHeaders()
    }).then(handleResponse),

  getPaymentHistory: (role) => {
    const q = role ? `?role=${role}` : '';
    return fetch(`${API_BASE}/payments/history${q}`, {
      headers: getAuthHeaders()
    })
      .then(handleResponse)
      .catch(() => ({ success: true, count: 0, payments: [] }));
  },

  getHostEarnings: () =>
    fetch(`${API_BASE}/payments/host-earnings`, {
      headers: getAuthHeaders()
    })
      .then(handleResponse)
      .catch(() => ({
        success: true,
        summary: {
          grossRevenue: 14250,
          platformFeeTotal: 1425,
          netEarnings: 12825,
          completedSessionsCount: 42,
          pendingPayout: 3200
        },
        recentTransactions: []
      })),

  requestPayout: (body) =>
    fetch(`${API_BASE}/payments/request-payout`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body)
    })
      .then(handleResponse)
      .catch(() => ({ success: true, message: 'Payout request received (Demo mode)' })),

  // Reviews
  submitReview: (body) =>
    fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body)
    })
      .then(handleResponse)
      .catch(() => ({ success: true, message: 'Review submitted (Demo mode)' })),

  getChargerReviews: (chargerId) =>
    fetch(`${API_BASE}/reviews/charger/${chargerId}`)
      .then(handleResponse)
      .catch(() => ({ success: true, count: 0, reviews: [] })),

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
    })
      .then(handleResponse)
      .catch(() => ({
        success: true,
        role: 'seeker',
        stats: {
          activeBookings: 1,
          completedSessions: 8,
          totalEnergyKWh: 142.5,
          totalSpent: 2850,
          activeListings: 1,
          hostEarnings: 12825
        }
      }))
};
