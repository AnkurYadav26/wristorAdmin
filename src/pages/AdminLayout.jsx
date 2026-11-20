import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AuthContext';
import { STOREFRONT_URL } from '../store';

export default function AdminLayout() {
  const { admin, isSuperAdmin, logout } = useAdminAuth();
  const navigate = useNavigate();

  const onLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="admin-root">
      <header className="admin-topbar">
        <div className="admin-topbar-inner">
          <Link to="/admin" className="admin-brand">
            WRISTORA <span>Admin</span>
          </Link>
          <div className="admin-topbar-actions">
            {admin?.name && <span className="admin-user">{admin.name}</span>}
            <a className="admin-store-link" href={STOREFRONT_URL} target="_blank" rel="noreferrer">View store ↗</a>
            <button type="button" className="admin-logout" onClick={onLogout}>Logout</button>
          </div>
        </div>
      </header>

      <div className="admin-shell">
        <aside className="admin-nav">
          <NavLink to="/admin" end>Dashboard</NavLink>
          <NavLink to="/admin/orders">Orders</NavLink>
          <NavLink to="/admin/products">Products</NavLink>
          <NavLink to="/admin/categories">Categories</NavLink>
          <NavLink to="/admin/inventory">Inventory</NavLink>
          <NavLink to="/admin/purchase-orders">Purchase orders</NavLink>
          <NavLink to="/admin/suppliers">Suppliers</NavLink>
          <NavLink to="/admin/coupons">Coupons</NavLink>
          {isSuperAdmin && <NavLink to="/admin/administrators">Administrators</NavLink>}
          <NavLink to="/admin/account">My account &amp; password</NavLink>
        </aside>
        <section className="admin-main">
          <Outlet />
        </section>
      </div>
    </div>
  );
}
