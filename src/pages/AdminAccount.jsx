import ChangePasswordForm from '../components/ChangePasswordForm';
import { useAdminAuth } from '../context/AuthContext';

export default function AdminAccount() {
  const { admin } = useAdminAuth();

  return (
    <div>
      <h2>My account</h2>

      <div className="panel mb">
        <h3>Profile</h3>
        <p><strong>{admin?.name}</strong></p>
        <p className="muted small">
          {admin?.email} · {admin?.isSuperAdmin ? 'super admin' : 'admin'}
          {admin?.emailVerified ? ' · email verified' : ''}
        </p>
      </div>

      <ChangePasswordForm />
    </div>
  );
}
