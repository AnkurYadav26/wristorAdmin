import mongoose from 'mongoose';
import env from './config/env.js';
import { connectDb } from './config/db.js';
import { createApp } from './app.js';

/**
 * WRISTORA Admin API entry point. Runs on its own port (ADMIN_PORT / PORT) as a fully
 * standalone process, sharing only the MongoDB database with the storefront server.
 */
await connectDb();
const app = createApp();
const server = app.listen(env.PORT, () => console.log(`WRISTORA Admin API listening on :${env.PORT} (${env.NODE_ENV})`));

async function shutdown(signal) {
  console.log(`${signal} received, shutting down`);
  server.close(async () => { await mongoose.disconnect(); process.exit(0); });
  setTimeout(() => process.exit(1), 10_000).unref();
}
['SIGINT', 'SIGTERM'].forEach((s) => process.on(s, () => shutdown(s)));
