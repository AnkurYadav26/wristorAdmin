/**
 * Base URL of the customer storefront, used by the "View store" links.
 * Points at the local storefront dev server in development and the deployed site in production.
 */
export const STOREFRONT_URL = (
  import.meta.env.VITE_STOREFRONT_URL ||
  (import.meta.env.PROD ? 'https://wristro-dev-igkp.vercel.app' : 'http://localhost:5173')
).replace(/\/+$/, '');
