import 'dotenv/config';
import { z } from 'zod';

/**
 * Environment for the standalone WRISTORA Admin API.
 * Deliberately separate from the storefront server's env: its own port, its own JWT/OTP
 * secrets and its own mailer/Cloudinary config. The ONLY shared value is MONGODB_URI.
 */
const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  // The admin API listens on its own port so it can run alongside the storefront server (8000).
  PORT: z.coerce.number().int().default(8001),
  // Same database as the storefront website — this is what keeps store data in sync.
  MONGODB_URI: z.string().min(1),
  // Admin-only secrets. Generate each with: node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  OTP_SECRET: z.string().min(32, 'OTP_SECRET must be at least 32 characters'),
  JWT_EXPIRES_DAYS: z.coerce.number().int().min(1).max(90).default(7),
  // Comma-separated allowed admin-panel origins (CORS + CSRF origin check).
  CLIENT_ORIGINS: z.string().default('http://localhost:5174'),
  COOKIE_SAMESITE: z.enum(['lax', 'strict', 'none']).default('lax'),
  // Leave unset to auto-detect: 1 hop in production (Vercel/Render/Nginx), 0 in dev.
  TRUST_PROXY: z.coerce.number().int().min(0).optional(),
  // Admin OTP email. Required in production.
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().default(587),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  MAIL_FROM: z.string().default('WRISTORA <no-reply@localhost>'),
  // Stock reservation window (minutes) used when opening-stock / adjustments are applied.
  STOCK_RESERVATION_MINUTES: z.coerce.number().int().min(1).max(120).default(15),
  // Default discount applied when an administrator creates a product without one.
  DEFAULT_DISCOUNT_PERCENT: z.coerce.number().min(0).max(90).default(40),
  // Seed script: creates/updates the Super Admin account in the Admin collection.
  ADMIN_NAME: z.string().optional(),
  ADMIN_EMAIL: z.string().email().optional(),
  ADMIN_PASSWORD: z.string().min(4, 'ADMIN_PASSWORD must be at least 4 characters').optional(),
  // The Super Admin's mailbox. A copy of every new-admin activation code is sent here, and the
  // second code is verified against this address.
  SUPER_ADMIN_EMAIL: z.string().trim().toLowerCase().email().default('rydosphere@gmail.com'),
  // Cloudinary (admin product-image uploads). Optional: blank values disable uploading.
  CLOUDINARY_CLOUD_NAME: z.string().trim().optional(),
  CLOUDINARY_API_KEY: z.string().trim().optional(),
  CLOUDINARY_API_SECRET: z.string().trim().optional(),
  CLOUDINARY_FOLDER: z.string().trim().default('wristora/products'),
});

const parsed = schema.safeParse(process.env);
if (!parsed.success) {
  const msg = parsed.error.issues.map((i) => `  - ${i.path.join('.')}: ${i.message}`).join('\n');
  throw new Error(`Invalid environment configuration:\n${msg}`);
}
const env = parsed.data;
const clientOrigins = env.CLIENT_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean);

// Behind Vercel/Render/Nginx the app always sits behind one proxy. In production an explicit 0
// (easy to copy from a dev .env) would make every request fail, so fall back to 1.
const TRUST_PROXY = env.NODE_ENV === 'production' ? env.TRUST_PROXY || 1 : env.TRUST_PROXY ?? 0;
// The deployed admin panel and this API are on different sites (two *.vercel.app subdomains), so
// the admin cookie must be SameSite=None there. Local dev stays same-site (lax).
const COOKIE_SAMESITE = env.NODE_ENV === 'production' && env.COOKIE_SAMESITE === 'lax' ? 'none' : env.COOKIE_SAMESITE;

if (env.NODE_ENV === 'production') {
  if (!env.SMTP_HOST) throw new Error('SMTP_HOST is required in production (admin OTP emails cannot be delivered otherwise).');
  if (COOKIE_SAMESITE === 'none' && !clientOrigins.every((o) => o.startsWith('https://'))) {
    throw new Error('COOKIE_SAMESITE=none requires HTTPS client origins.');
  }
}

export default Object.freeze({
  ...env,
  TRUST_PROXY,
  COOKIE_SAMESITE,
  isProd: env.NODE_ENV === 'production',
  clientOrigins,
});
