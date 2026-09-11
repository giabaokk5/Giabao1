import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './assets/style/admin.css';

function Admin() {
  useEffect(() => {
    document.title = 'HTCD Shop - Quản trị';
  }, []);

  return (
    <>
      <main className="admin-shell">
        {/* Sidebar */}
        <aside
          className="admin-sidebar"
        >
          <div className="admin-brand">
            <span className="admin-brand-mark">HT</span>
            <span>
              <strong>HTCD SHOP</strong>
              <small>TRUNG TÂM QUẢN TRỊ</small>
            </span>
          </div>
          <nav className="admin-nav">
            <Link to="/admin" className="admin-nav-link active">
              <span>⌂</span> Tổng quan
            </Link>
            <Link to="/admin/orders" className="admin-nav-link">
              <span>◷</span> Đơn hàng
            </Link>
            <Link to="/admin/products" className="admin-nav-link">
              <span>▦</span> Sản phẩm
            </Link>
            <Link to="/admin/users" className="admin-nav-link">
              <span>♙</span> Người dùng
            </Link>
          </nav>
          <Link to="/" className="admin-back-link">← Về cửa hàng</Link>
        </aside>

        {/* Main Content */}
        <section className="admin-content">
          <header className="admin-page-header">
            <div>
              <span className="admin-eyebrow">TRUNG TÂM QUẢN TRỊ</span>
              <h1>Xin chào, quản trị viên</h1>
              <p>Theo dõi và vận hành HTCD Shop từ một nơi.</p>
            </div>
            <span className="admin-status"><i /> Hệ thống đang hoạt động</span>
          </header>

          <div className="admin-stat-grid">
            <div className="admin-stat-card">
              <span className="admin-stat-label">SẢN PHẨM</span>
              <strong>136</strong>
              <small>Trong danh mục hiện tại</small>
            </div>
            <div className="admin-stat-card accent">
              <span className="admin-stat-label">ĐƠN HÀNG HÔM NAY</span>
              <strong>24</strong>
              <small><b>+12%</b> so với hôm qua</small>
            </div>
            <div className="admin-stat-card">
              <span className="admin-stat-label">DOANH THU</span>
              <strong>$8,420</strong>
              <small><b className="positive">+8.4%</b> trong tuần này</small>
            </div>
          </div>

          <div className="admin-section-heading">
            <div>
              <span className="admin-eyebrow">QUẢN LÝ NHANH</span>
              <h2>Các khu vực vận hành</h2>
            </div>
            <span className="admin-date">Cập nhật hôm nay</span>
          </div>

          <div className="admin-module-grid">
            <Link to="/admin/products" className="admin-module-card">
              <span className="admin-module-icon">▦</span>
              <span className="admin-module-copy">
                <strong>Quản lý sản phẩm</strong>
                <small>Thêm, sửa và xóa sản phẩm trong cửa hàng.</small>
              </span>
              <span className="admin-module-arrow">→</span>
            </Link>
            <Link to="/admin/orders" className="admin-module-card">
              <span className="admin-module-icon">◷</span>
              <span className="admin-module-copy">
                <strong>Đơn hàng đã đặt</strong>
                <small>Xem khách hàng, sản phẩm và phương thức thanh toán.</small>
              </span>
              <span className="admin-module-arrow">→</span>
            </Link>
            <Link to="/admin/users" className="admin-module-card">
              <span className="admin-module-icon">♙</span>
              <span className="admin-module-copy">
                <strong>Quản lý người dùng</strong>
                <small>Kiểm soát tài khoản và quyền truy cập.</small>
              </span>
              <span className="admin-module-arrow">→</span>
            </Link>
          </div>

          <div className="admin-note">
            <span>✦</span>
            <div>
              <strong>Mẹo vận hành</strong>
              <p>Kiểm tra các sản phẩm sắp hết hàng để cập nhật kho kịp thời.</p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default Admin;
