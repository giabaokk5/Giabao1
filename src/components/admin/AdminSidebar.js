import React from 'react';
import { Link } from 'react-router-dom';

function AdminSidebar({ active = 'overview' }) {
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-sticky">
        {/* Brand Header */}
        <div className="admin-brand">
          <div className="admin-brand-mark">
            <span>HT</span>
          </div>
          <div className="admin-brand-info">
            <strong>HTCD SHOP</strong>
            <span className="brand-tag">ENTERPRISE ADMIN</span>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="admin-nav-section-label">ĐIỀU HÀNH & KINH DOANH</div>
        <nav className="admin-nav">
          <Link
            to="/admin"
            className={`admin-nav-link ${active === 'overview' ? 'active' : ''}`}
          >
            <i className="fa-solid fa-chart-pie nav-icon" />
            <span>Tổng quan</span>
          </Link>

          <Link
            to="/admin/revenue"
            className={`admin-nav-link ${active === 'revenue' ? 'active' : ''}`}
          >
            <i className="fa-solid fa-chart-line nav-icon" />
            <span>Doanh thu & Lợi nhuận</span>
            <span className="nav-hot-badge">Mới</span>
          </Link>

          <Link
            to="/admin/orders"
            className={`admin-nav-link ${active === 'orders' ? 'active' : ''}`}
          >
            <i className="fa-solid fa-receipt nav-icon" />
            <span>Đơn hàng</span>
          </Link>

          <Link
            to="/admin/products"
            className={`admin-nav-link ${active === 'products' ? 'active' : ''}`}
          >
            <i className="fa-solid fa-boxes-stacked nav-icon" />
            <span>Sản phẩm</span>
          </Link>

          <Link
            to="/admin/users"
            className={`admin-nav-link ${active === 'users' ? 'active' : ''}`}
          >
            <i className="fa-solid fa-users-gear nav-icon" />
            <span>Người dùng</span>
          </Link>
        </nav>

        {/* Admin User Mini Card */}
        <div className="admin-user-profile">
          <div className="admin-avatar">
            <i className="fa-solid fa-user-shield" />
            <span className="avatar-status-dot" />
          </div>
          <div className="admin-user-meta">
            <span className="user-name">Quản trị viên</span>
            <span className="user-role">Super Admin</span>
          </div>
        </div>

        {/* Back Link */}
        <Link to="/" className="admin-back-link">
          <i className="fa-solid fa-arrow-left" />
          <span>Về trang chủ cửa hàng</span>
        </Link>
      </div>
    </aside>
  );
}

export default AdminSidebar;
