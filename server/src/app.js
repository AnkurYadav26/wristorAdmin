import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import mongoose from 'mongoose';
import env from './config/env.js';
import { sanitizeInput, originCheck, apiLimiter } from './middleware/security.js';
import { notFound, errorHandler } from './middleware/errors.js';
import adminAuthRoutes from './routes/adminAuth.js';
import adminRoutes from './routes/admin/index.js';

/**
 * WRISTORA Admin API — a standalone backend that serves ONLY the admin panel
 * (administrator auth + store management). It is completely independent of the
 * storefront server: its own port, own env, own secrets. The only thing it shares
 * with the storefront is the MongoDB database, so any change an administrator makes
 * here (products, categories, prices, stock, coupons, orders) shows up on the
 * customer website immediately.
 */
export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', env.TRUST_PROXY);

  // The admin panel is a separate origin (Vite dev server / Vercel project), so allow
  // cross-origin reads; otherwise CORP: same-origin blocks the browser fetch.
  app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
  app.use(cors({
    origin: env.clientOrigins,
    credentials: true,
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Idempotency-Key'],
  }));
  // Admin image uploads arrive as base64 data URLs, so this path gets a much larger body limit.
  app.use('/api/admin/uploads', express.json({ limit: '36mb' }));
  app.use(express.json({ limit: '100kb' }));
  app.use(cookieParser());
  app.use(sanitizeInput);

  app.get('/api/health', (_req, res) => res.json({ ok: true, service: 'wristora-admin', db: mongoose.connection.readyState === 1 }));

  app.use('/api', apiLimiter, originCheck);
  app.use('/api/admin-auth', adminAuthRoutes); // administrator auth (own cookie + Admin collection)
  app.use('/api/admin', adminRoutes);          // store management over the shared database

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
