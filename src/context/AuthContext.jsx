import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api } from '../api';

/**
 * Administrator authentication only. This talks to /api/admin-auth/* and never touches the
 * storefront customer session (a completely separate cookie and account collection).
 */
const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await api('GET', '/admin-auth/me');
      setAdmin(data.admin);
      return data.admin;
    } catch {
      setAdmin(null);
      return null;
    }
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      await refresh();
      if (alive) setLoading(false);
    })();
    return () => { alive = false; };
  }, [refresh]);

  // Step 1: email + password. Returns { otpRequired, email } — the code is emailed to the admin.
  const login = useCallback(async (email, password) => {
    const data = await api('POST', '/admin-auth/login', { body: { email, password } });
    return data;
  }, []);

  // Step 2: exchange the emailed code for an admin session.
  const verifyLogin = useCallback(async (email, otp) => {
    const data = await api('POST', '/admin-auth/verify-login', { body: { email, otp } });
    setAdmin(data.admin);
    return data.admin;
  }, []);

  const logout = useCallback(async () => {
    try { await api('POST', '/admin-auth/logout'); } catch { /* already logged out */ }
    setAdmin(null);
  }, []);

  const value = {
    admin, loading, refresh, login, verifyLogin, logout, setAdmin,
    isSuperAdmin: admin?.role === 'super_admin',
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export const useAdminAuth = () => useContext(AdminAuthContext);
