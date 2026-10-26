const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const path = require('path');
const https = require('https');
const http = require('http');
const connectDB = require('./config/db');

dotenv.config();

connectDB();

const app = express();

// ─── Proxy / client IP trust ───────────────────────────────────────────────
// Render (and most PaaS/load-balancer setups) place the app behind a reverse
// proxy that injects `X-Forwarded-For` / `X-Forwarded-Proto`. Express does not
// trust those headers by default, which makes `request.ip` resolve to the
// proxy's IP and makes express-rate-limit throw ERR_ERL_UNEXPECTED_X_FORWARDED_FOR.
//
// The value must be a HOP COUNT, never `true`:
//   * `false` (default) -> rate limiter rejects every request that has XFF.
//   * `true`            -> rate limiter throws ERR_ERL_PERMISSIVE_TRUST_PROXY.
//   * `1`               -> trust exactly one hop (Render's edge). Correct here.
const parseTrustProxy = (value) => {
  if (value === undefined || value === null || value === '') return 1;
  if (value === 'true') return 1;
  if (value === 'false') return false;
  const hops = Number(value);
  return Number.isNaN(hops) ? 1 : hops;
};

app.set('trust proxy', parseTrustProxy(process.env.TRUST_PROXY));

// Security headers
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));

// CORS Configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174',
  process.env.FRONTEND_URL || '',
  process.env.RENDER_EXTERNAL_URL || '',
  ...(process.env.ALLOWED_ORIGINS || '').split(','),
]
  .filter((origin) => typeof origin === 'string' && origin.trim() !== '')
  .map((origin) => origin.trim().replace(/\/$/, ''));

app.use(
  cors({
    origin: (origin, callback) => {
      const normalizedOrigin = origin
        ? origin.replace(/\/$/, '')
        : '';

      const isDev = process.env.NODE_ENV !== 'production';
      const isLocalhost = isDev && (
        /^http:\/\/localhost(:\d+)?$/.test(normalizedOrigin) ||
        /^http:\/\/127\.0\.0\.1(:\d+)?$/.test(normalizedOrigin)
      );
      const isRender = normalizedOrigin.endsWith('.onrender.com');

      if (!origin || allowedOrigins.includes(normalizedOrigin) || isLocalhost || isRender) {
        return callback(null, true);
      }

      console.error('Blocked by CORS:', origin);
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  })
);

// Request logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
}

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Global rate limiter — 100 req / 15 min per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api', limiter);

// Stricter limiter for auth routes — 10 req / 15 min
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many login attempts, please try again later.' },
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Static uploads
app.use('/uploads', express.static(process.env.UPLOAD_DIR || path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/expenses', require('./routes/expenseRoutes'));
app.use('/api/approvals', require('./routes/approvalRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// Health check (supports both /api/health and /health)
app.get(['/api/health', '/health'], (req, res) => {
  const databaseReady = mongoose.connection.readyState === 1;
  res.status(200).json({
    status: 'OK',
    message: databaseReady ? 'KharchaKart API is ready' : 'Database connection pending',
    database: databaseReady ? 'connected' : 'connecting',
    env: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

if (process.env.NODE_ENV === 'production') {
  const frontendBuildPath = path.join(__dirname, '../frontend/dist');
  app.use(express.static(frontendBuildPath));
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path === '/api' || req.path.startsWith('/api/') || req.path.startsWith('/uploads/')) {
      return next();
    }
    res.sendFile(path.join(frontendBuildPath, 'index.html'), (error) => {
      if (error) next(error);
    });
  });
}

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: `Route ${req.originalUrl} not found` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack);
  res.status(err.status || 500).json({
    error: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : err.message,
  });
});

// Keep-alive self-ping on Render (prevents 15-minute idle spin-down in free tier)
let keepAliveTimer = null;
const initKeepAlive = () => {
  const isProduction = process.env.NODE_ENV === 'production';
  const forceEnable = process.env.ENABLE_KEEP_ALIVE === 'true';
  if (!isProduction && !forceEnable) return;

  const baseUrl = (process.env.RENDER_EXTERNAL_URL || process.env.PING_URL || 'https://kharchakart.onrender.com').replace(/\/$/, '');
  const targetUrl = `${baseUrl}/health`;
  const INTERVAL_MS = 10 * 60 * 1000; // 10 minutes (Render spins down at 15 minutes)

  console.log(`⏱️ Keep-alive scheduled: auto-pinging ${targetUrl} every 10 minutes`);

  keepAliveTimer = setInterval(() => {
    const client = targetUrl.startsWith('https') ? https : http;
    client
      .get(targetUrl, (res) => {
        console.log(`[Keep-Alive] Self-ping to ${targetUrl} - HTTP ${res.statusCode}`);
      })
      .on('error', (err) => {
        console.warn(`[Keep-Alive] Ping warning: ${err.message}`);
      });
  }, INTERVAL_MS);
};

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`✅ Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  initKeepAlive();
});

// Graceful shutdown
const shutdown = (signal) => {
  console.log(`\n${signal} received. Shutting down gracefully...`);
  if (keepAliveTimer) {
    clearInterval(keepAliveTimer);
    keepAliveTimer = null;
  }
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

module.exports = app;
