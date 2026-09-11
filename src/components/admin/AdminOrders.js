import React from 'react';
import { Link } from 'react-router-dom';
import '../../assets/style/admin.css';

function AdminOrders() {
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');

  return (
    <main className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-brand">
          <span className="admin-brand-mark">HT</span>
          <span><strong>HTCD SHOP</strong><small>TRUNG TÂM QUẢN TRỊ</small></span>
        </div>
        <nav className="admin-nav">
          <Link to="/admin" className="admin-nav-link"><span>⌂</span> Tổng quan</Link>
          <Link to="/admin/products" className="admin-nav-link"><span>▦</span> Sản phẩm</Link>
          <Link to="/admin/orders" className="admin-nav-link active"><span>◷</span> Đơn hàng</Link>
          <Link to="/admin/users" className="admin-nav-link"><span>♙</span> Người dùng</Link>
        </nav>
        <Link to="/" className="admin-back-link">← Về cửa hàng</Link>
      </aside>

      <section className="admin-content">
        <header className="admin-page-header">
          <div>
            <span className="admin-eyebrow">BÁN HÀNG</span>
            <h1>Đơn hàng đã đặt</h1>
            <p>Theo dõi khách hàng, sản phẩm và phương thức thanh toán.</p>
          </div>
          <span className="admin-status"><i /> {orders.length} đơn hàng</span>
        </header>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr><th>Mã đơn</th><th>Khách hàng</th><th>Sản phẩm</th><th>Tổng tiền</th><th>Thanh toán</th><th>Ngày đặt</th></tr>
            </thead>
            <tbody>
              {orders.length > 0 ? orders.map((order) => (
                <tr key={order.id}>
                  <td><strong>#{String(order.id).slice(-8)}</strong></td>
                  <td>{order.customer || 'Khách hàng'}</td>
                  <td>{order.items?.map((item) => `${item.name} x${item.quantity}`).join(', ') || 'Không có sản phẩm'}</td>
                  <td>${order.total}</td>
                  <td>{order.paymentMethod || 'Chưa chọn'}</td>
                  <td>{order.date}</td>
                </tr>
              )) : (
                <tr><td colSpan="6">Chưa có đơn hàng nào được đặt.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

export default AdminOrders;
