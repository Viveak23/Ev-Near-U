import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { connectDB } from './config/db.js';
import { initTelemetrySocket } from './sockets/telemetrySocket.js';
// Seed utility (optional manual maintenance)
import { notFound, errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/authRoutes.js';
import chargerRoutes from './routes/chargerRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import sessionRoutes from './routes/sessionRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import statsRoutes from './routes/statsRoutes.js';


dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});
initTelemetrySocket(io);

// Middleware
const allowedOrigin = process.env.CLIENT_URL || '*';
app.use(cors({ origin: allowedOrigin, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Health check endpoints (both /health and /api/health)
const healthHandler = (req, res) => {
  res.json({
    status: 'ok',
    app: 'EvNearU Backend API',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
};
app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/chargers', chargerRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/stats', statsRoutes);

// Static frontend serving if client/dist exists (unified deployment mode)
const clientDistPath = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(clientDistPath)) {
  console.log(`[Server] Serving production frontend build from: ${clientDistPath}`);
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/socket.io') || req.path.startsWith('/health')) {
      return next();
    }
    res.sendFile(path.resolve(clientDistPath, 'index.html'));
  });
}

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();

    server.listen(PORT, '0.0.0.0', () => {
      console.log(`[Server] EvNearU backend server running on port ${PORT}`);
      console.log(`[Server] Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error(`[Server] Failed to start server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
