import React, { useContext } from 'react';
import { Navigate, Outlet, Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import { AuthContext, AuthProvider } from './contexts/AuthContext';
import Checkout from './contexts/Checkout';

import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './assets/style.css';

import Admin from './Admin';
import Cart from './components/Cart';
import Footer from './components/Footer';
import HatsPage from './components/HatsPage';
import Header from './components/Header';
import History from './components/History'; // Import History
import Home from './components/Home';
import JacketsPage from './components/JacketsPage';
import Login from './components/Login';
import PantsPage from './components/PantsPage';
import ProductDetail from './components/ProductDetail';
import Register from './components/Register';
import ShoesPage from './components/ShoesPage';
import Ticket from './components/Ticket';
import TshirtsPage from './components/TshirtsPage';
import ProductManagement from './components/admin/ProductManagement';
import AdminOrders from './components/admin/AdminOrders';
import AdminUsers from './components/admin/AdminUsers';

function ProtectedRoute() {
  const { isLoggedIn, isAuthLoading } = useContext(AuthContext);

  if (isAuthLoading) {
    return null;
  }

  return isLoggedIn ? <Outlet /> : <Navigate to="/login" replace />;
}

function AdminRoute() {
  const { isAdmin, isAuthLoading } = useContext(AuthContext);

  if (isAuthLoading) {
    return null;
  }

  return isAdmin ? <Outlet /> : <Navigate to="/" replace />;
}

function PublicOnlyRoute({ children }) {
  const { isLoggedIn, isAuthLoading } = useContext(AuthContext);

  if (isAuthLoading) {
    return null;
  }

  return isLoggedIn ? <Navigate to="/" replace /> : children;
}

function StoreLayout() {
  return (
    <>
      <Header />
      <Outlet />
      <Footer />
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<PublicOnlyRoute><Login /></PublicOnlyRoute>} />
          <Route path="/register" element={<PublicOnlyRoute><Register /></PublicOnlyRoute>} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/products" element={<ProductManagement />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/users" element={<AdminUsers />} />
            </Route>
            <Route element={<StoreLayout />}>
              <Route path="/" element={<Home />} />
              <Route path="/product/:id" element={<ProductDetail />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/ticket" element={<Ticket />} />
              <Route path="/history" element={<History />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/jackets" element={<JacketsPage />} />
              <Route path="/tshirts" element={<TshirtsPage />} />
              <Route path="/pants" element={<PantsPage />} />
              <Route path="/shoes" element={<ShoesPage />} />
              <Route path="/hats" element={<HatsPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
