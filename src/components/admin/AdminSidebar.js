import React from 'react';
import { Link } from 'react-router-dom';

function AdminSidebar({ active = 'overview' }) {
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-sticky">
        <div className="admin-brand">
          <span className="admin-brand-mark">HT</span>
          <span>
            <strong>HTCD SHOP</strong>
            <small>TRUNG TÂM QUẢN TRỊ</small>
          </span>
        </div>

        <nav className="admin-nav">
          <Link
            to="/admin"
            className={`admin-nav-link ${active === 'overview' ? 'active' : ''}`}
          >
            <span>⌂</span> Tổng quan
          </Link>

          <Link
            to="/admin/revenue"
            className={`admin-nav-link ${active === 'revenue' ? 'active' : ''}`}
          >
            <span>📈</span> Doanh thu & Lợi nhuận
          </Link>

          <Link
            to="/admin/orders"
            className={`admin-nav-link ${active === 'orders' ? 'active' : ''}`}
          >
            <span>◷</span> Đơn hàng
          </Link>

          <Link
            to="/admin/products"
            className={`admin-nav-link ${active === 'products' ? 'active' : ''}`}
          >
            <span>▦</span> Sản phẩm
          </Link>

          <Link
            to="/admin/users"
            className={`admin-nav-link ${active === 'users' ? 'active' : ''}`}
          >
            <span>♙</span> Người dùng
          </Link>
        </nav>

        <Link to="/" className="admin-back-link">
          ← Về cửa hàng
        </Link>
      </div>
    </aside>
  );
}

export default AdminSidebar;
