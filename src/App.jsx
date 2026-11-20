import { Routes, Route, Navigate } from 'react-router-dom';
import { useAdminAuth } from './context/AuthContext';
import AdminLogin from './pages/AdminLogin';
import AdminLayout from './pages/AdminLayout';
import AdminDashboard from './pages/AdminDashboard';
import AdminCategories from './pages/AdminCategories';
import AdminProducts from './pages/AdminProducts';
import AdminProductForm from './pages/AdminProductForm';
import AdminCoupons from './pages/AdminCoupons';
import AdminSuppliers from './pages/AdminSuppliers';
import AdminPurchaseOrders from './pages/AdminPurchaseOrders';
import AdminInventory from './pages/AdminInventory';
import AdminOrders from './pages/AdminOrders';
import AdminAccount from './pages/AdminAccount';
import AdminAdministrators from './pages/AdminAdministrators';

function RequireAdmin({ children }) {
  const { admin, loading } = useAdminAuth();
  if (loading) return <div className="page muted">Loading…</div>;
  if (!admin) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AdminLogin />} />
      <Route path="/" element={<Navigate to="/admin" replace />} />

      <Route
        path="/admin"
        element={
          <RequireAdmin>
            <AdminLayout />
          </RequireAdmin>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="products/new" element={<AdminProductForm />} />
        <Route path="products/:id" element={<AdminProductForm />} />
        <Route path="coupons" element={<AdminCoupons />} />
        <Route path="suppliers" element={<AdminSuppliers />} />
        <Route path="purchase-orders" element={<AdminPurchaseOrders />} />
        <Route path="inventory" element={<AdminInventory />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="administrators" element={<AdminAdministrators />} />
        <Route path="account" element={<AdminAccount />} />
      </Route>

      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
