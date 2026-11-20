import { useEffect, useState } from 'react';
import { api } from '../api';
import { useAdminAuth } from '../context/AuthContext';
import { formatDate } from '../format';

const BLANK = { name: '', email: '', password: '' };

export default function AdminAdministrators() {
  const { isSuperAdmin } = useAdminAuth();
  const [admins, setAdmins] = useState([]);
  const [form, setForm] = useState(BLANK);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);

  // One pending activation at a time: { adminId, otp, superOtp }
  const [verify, setVerify] = useState({ adminId: '', otp: '', superOtp: '' });

  const load = async () => {
    const r = await api('GET', '/admin-auth/administrators');
    setAdmins(r.administrators || []);
  };

  useEffect(() => {
    if (!isSuperAdmin) return;
    load().catch((err) => setError(err.message));
  }, [isSuperAdmin]);

  if (!isSuperAdmin) {
    return <div className="page"><h2>403</h2><p>Super admin access required.</p></div>;
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const create = async (e) => {
    e.preventDefault();
    setError('');
    setNotice('');
    setBusy(true);
    try {
      const r = await api('POST', '/admin-auth/administrators', { body: form });
      setNotice(r.message);
      setForm(BLANK);
      setVerify({ adminId: r.administrator?.id || '', otp: '', superOtp: '' });
      await load();
    } catch (err) {
      setError(
        Array.isArray(err.details)
          ? err.details.map((d) => (d.field ? `${d.field}: ${d.message}` : d.message)).join(' · ')
          : err.message,
      );
    } finally {
      setBusy(false);
    }
  };

  const submitVerification = async (adminId) => {
    setError('');
    setNotice('');
    setBusy(true);
    try {
      const r = await api('POST', `/admin-auth/administrators/${adminId}/verify`, {
        body: { otp: verify.otp.trim(), superOtp: verify.superOtp.trim() },
      });
      setNotice(r.message || 'Administrator activated.');
      setVerify({ adminId: '', otp: '', superOtp: '' });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const resend = async (adminId) => {
    setError('');
    setNotice('');
    try {
      const r = await api('POST', `/admin-auth/administrators/${adminId}/resend-otp`);
      setNotice(r.message);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h2>Administrators</h2>
      {error && <div className="alert error">{error}</div>}
      {notice && <div className="alert ok">{notice}</div>}

      <form className="panel mb" onSubmit={create}>
        <h3>Add administrator</h3>
        <p className="muted small">
          An activation code is emailed to the new administrator and a copy to rydosphere@gmail.com.
          The account activates only after BOTH codes are verified below.
        </p>
        <div className="row wrap">
          <label style={{ flex: 2 }}>
            <span>Name *</span>
            <input value={form.name} onChange={set('name')} required minLength={2} maxLength={80} />
          </label>
          <label style={{ flex: 2 }}>
            <span>Email *</span>
            <input type="email" value={form.email} onChange={set('email')} required />
          </label>
          <label style={{ flex: 2 }}>
            <span>Temporary password *</span>
            <input type="text" value={form.password} onChange={set('password')} required minLength={8} />
            <span className="muted small">At least 8 characters, with a letter and a number.</span>
          </label>
        </div>
        <button className="btn" type="submit" disabled={busy}>{busy ? 'Creating…' : 'Create administrator'}</button>
      </form>

      <table>
        <thead>
          <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Last sign-in</th><th /></tr>
        </thead>
        <tbody>
          {admins.map((a) => (
            <tr key={a.id}>
              <td>{a.name}</td>
              <td className="small">{a.email}</td>
              <td className="small">{a.isSuperAdmin ? 'Super admin' : 'Admin'}</td>
              <td>{a.status}</td>
              <td className="small muted">{a.lastLoginAt ? formatDate(a.lastLoginAt) : '—'}</td>
              <td>
                {a.status === 'pending' ? (
                  <div className="row wrap">
                    <button className="btn secondary small" onClick={() => setVerify({ adminId: a.id, otp: '', superOtp: '' })}>
                      Activate…
                    </button>
                    <button className="btn secondary small" onClick={() => resend(a.id)}>Resend codes</button>
                  </div>
                ) : <span className="muted small">—</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {verify.adminId && (
        <div className="panel mt">
          <div className="row between">
            <h3>Activate administrator</h3>
            <button className="link-btn small" onClick={() => setVerify({ adminId: '', otp: '', superOtp: '' })}>Close</button>
          </div>
          <p className="muted small">
            Enter the code sent to the new administrator&apos;s email and the code sent to rydosphere@gmail.com.
          </p>
          <div className="row wrap">
            <label style={{ flex: 1 }}>
              <span>Code for the new administrator</span>
              <input
                value={verify.otp}
                onChange={(e) => setVerify((v) => ({ ...v, otp: e.target.value }))}
                inputMode="numeric" maxLength={6} placeholder="000000"
              />
            </label>
            <label style={{ flex: 1 }}>
              <span>Code sent to rydosphere@gmail.com</span>
              <input
                value={verify.superOtp}
                onChange={(e) => setVerify((v) => ({ ...v, superOtp: e.target.value }))}
                inputMode="numeric" maxLength={6} placeholder="000000"
              />
            </label>
          </div>
          <div className="row">
            <button className="btn" onClick={() => submitVerification(verify.adminId)} disabled={busy || !verify.otp || !verify.superOtp}>
              {busy ? 'Verifying…' : 'Verify & activate'}
            </button>
            <button className="btn secondary" onClick={() => resend(verify.adminId)} disabled={busy}>Resend codes</button>
          </div>
        </div>
      )}
    </div>
  );
}
