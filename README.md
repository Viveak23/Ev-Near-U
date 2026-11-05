# EvNearU — Peer-to-Peer EV Charger Sharing Platform

A production-grade, full-stack marketplace connecting EV charger owners (Hosts) with electric vehicle drivers (Seekers) across India. Built with clean EV-tech design aesthetics, real-time power telemetry, geospatial search, strict conflict prevention, itemized formula billing, and seamless payments.

---

## ⚡ Key Highlights & Architecture

- **Unified Dual-Role Accounts**: Any user can seamlessly act as both **Charger Host** and **EV Driver** under the same account without permanent lock-in. A one-click toggle in the navigation bar lets users switch operational modes effortlessly.
- **Geospatial Discovery & Interactive Map**: Leaflet.js map with custom-styled AC/DC charger pins, user GPS location pin, search radius filters, and power rating indicators.
- **Privacy Protected Address Shielding**: Unconfirmed seekers only see approximate neighborhood / city pins. Exact street address, landmark, and host contact numbers are unlocked strictly upon confirmed reservations.
- **Conflict Prevention Engine**: Server-side transactional validation stops overlapping time slot bookings and prevents hosts from booking their own stations.
- **Real-Time Telemetry & Live Stopwatch**: Live charging dashboard tracking battery State of Charge (SOC %), output power (kW), energy delivered (kWh), elapsed time, and real-time running bill accumulator. Supports both simulated telemetry and manual meter override.
- **Exact Billing Formula**:
  $$\text{Energy Charge} = \text{Energy Consumed (kWh)} \times \text{Price per kWh}$$
  $$\text{Time Charge} = \text{Billable Duration (hours)} \times \text{Price per Hour (if enabled)}$$
  $$\text{Subtotal} = \text{Energy Charge} + \text{Time Charge}$$
  $$\text{Platform Fee} = \text{Subtotal} \times 5\%$$
  $$\text{GST Tax} = (\text{Subtotal} + \text{Platform Fee}) \times 18\%$$
  $$\text{Final Amount} = \text{Subtotal} + \text{Platform Fee} + \text{Taxes} - \text{Discounts}$$
- **Payment & Tax Invoicing**: Multi-channel checkout supporting Razorpay simulation, dynamic UPI QR codes with instant verification, and card processing. Generates printable/downloadable official GST tax receipts.
- **Host Financial Ledger**: Gross revenue tracking, platform commission deduction (10%), net host payout calculation, and instant withdrawal / payout requests (NEFT/UPI).
- **Verified Reviews**: 5-star rating system strictly gated to drivers who completed verified, paid sessions on that charger.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router v6, Lucide Icons, Leaflet & React-Leaflet, Socket.io-client |
| **Backend** | Node.js, Express.js (ES Modules), Mongoose, Socket.io, Morgan, Bcrypt.js, JSON Web Tokens (JWT) |
| **Database** | MongoDB 8.0 with `2dsphere` geospatial indexing |
| **Payments** | Razorpay Sandbox integration, UPI 2.0 QR simulation, signed webhook verification |

---

## 🚀 Quick Start & Installation

### Prerequisites
- Node.js (v18+)
- MongoDB (running locally or MongoDB Atlas URI)

### 1. Install Dependencies
```bash
# In server directory
cd server
npm install

# In client directory
cd ../client
npm install
```

### 2. Configure Environment Variables
Copy `server/.env.example` to `server/.env`:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/ev_near_u
JWT_SECRET=super_secret_ev_near_u_jwt_key_2026_secure
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
RAZORPAY_KEY_ID=rzp_test_sample_key_evnearu
RAZORPAY_KEY_SECRET=sample_secret_key_evnearu
PLATFORM_FEE_PERCENT=5
HOST_COMMISSION_PERCENT=10
TAX_GST_PERCENT=18
```

### 3. Seed Demo Data
Pre-populates verified hosts, drivers, chargers in Bengaluru, bookings, and completed sessions:
```bash
cd server
npm run seed
```

### 4. Run Development Servers
```bash
# Terminal 1: Backend API & Telemetry (Port 5000)
cd server
npm run dev

# Terminal 2: Frontend Web App (Port 5173)
cd client
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## 👥 Pre-Configured Demo Accounts

| Role | Email | Password | Pre-configured Assets |
|---|---|---|---|
| **Charger Host** | `rajesh.host@evnearu.com` | `Password123!` | 2 Active Chargers (11 kW AC, 7.4 kW AC), earnings ledger, bank payout details |
| **EV Driver / Seeker** | `vikram.seeker@evnearu.com` | `Password123!` | Hyundai Ioniq 5, Ather 450X, upcoming reservation, completed invoices |

*You can also click the 1-Click Demo Account buttons directly on the Login screen!*

---

## 🔌 API Endpoints Summary

### Authentication (`/api/auth`)
- `POST /register`: Create a new user with vehicle preferences
- `POST /login`: Authenticate with email or mobile
- `GET /me`: Fetch authenticated user profile
- `PUT /profile`: Update profile, vehicle garage, and payout bank details

### Chargers (`/api/chargers`)
- `GET /nearby`: Geospatial distance search with power, connector, price filters
- `GET /my-listings`: Fetch chargers owned by authenticated host
- `POST /`: Create a new charger listing
- `GET /:id`: Get single charger specs (exact address if authorized)
- `PUT /:id`: Update charger pricing, schedule, or status
- `DELETE /:id`: Remove listing after verifying no active bookings

### Bookings (`/api/bookings`)
- `POST /`: Reserve an available charging slot with server-side conflict checks
- `GET /check-availability`: Inspect booked slots for a date
- `GET /my-bookings`: Fetch driver's reservations
- `GET /host-bookings`: Fetch incoming bookings on host's chargers
- `PUT /:id/cancel`: Cancel a booking with reason

### Charging Sessions (`/api/sessions`)
- `POST /start`: Initiate charging session from confirmed booking
- `GET /active`: Retrieve user's current live session
- `POST /:id/readings`: Live telemetry update (power, kWh, SOC)
- `POST /:id/stop`: Stop charging and compute final formula bill
- `GET /history`: Charging history and logs

### Payments & Invoicing (`/api/payments`)
- `POST /create-order`: Create payment order
- `POST /verify`: Verify signature, mark session paid, compute host cut
- `GET /invoice/:id`: Generate printable GST tax invoice
- `GET /host-earnings`: Host gross revenue, commission, and net ledger
- `POST /request-payout`: Request transfer to host's bank or UPI

### Reviews (`/api/reviews`)
- `POST /`: Submit 5-star review for completed session
- `GET /charger/:chargerId`: Fetch verified community reviews
- `PUT /:id/response`: Host reply to a review
