import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../assets/style/admin.css';
import api from '../../services/api';

function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await api.admin.getUsers();
        if (data && (data.users || data.loginHistory)) {
          const combined = data.loginHistory && data.loginHistory.length > 0
            ? data.loginHistory
            : data.users || [];
          setUsers(combined);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Could not fetch users from API, falling back to local storage:', err.message);
      }

      // Fallback
      const storedHistory = JSON.parse(localStorage.getItem('loginHistory') || '[]');
      const currentUser = JSON.parse(localStorage.getItem('user') || 'null');
      const fallbackList = storedHistory.length > 0
        ? storedHistory
        : currentUser
          ? [{ ...currentUser, lastLogin: new Date().toISOString() }]
          : [];
      setUsers(fallbackList);
      setIsLoading(false);
    };

    fetchUsers();
  }, []);

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
          <Link to="/admin/orders" className="admin-nav-link"><span>◷</span> Đơn hàng</Link>
          <Link to="/admin/users" className="admin-nav-link active"><span>♙</span> Người dùng</Link>
        </nav>
        <Link to="/" className="admin-back-link">← Về cửa hàng</Link>
      </aside>

      <section className="admin-content">
        <header className="admin-page-header">
          <div>
            <span className="admin-eyebrow">TÀI KHOẢN</span>
            <h1>Người dùng đã đăng nhập</h1>
            <p>Theo dõi những tài khoản đã truy cập vào HTCD Shop.</p>
          </div>
          <span className="admin-status">
            <i /> {isLoading ? 'Đang tải...' : `${users.length} tài khoản`}
          </span>
        </header>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Tài khoản</th>
                <th>Email</th>
                <th>Số điện thoại</th>
                <th>Ngày sinh</th>
                <th>Lần đăng nhập gần nhất</th>
              </tr>
            </thead>
            <tbody>
              {users.length > 0 ? users.map((user) => (
                <tr key={user.username}>
                  <td><strong>{user.username}</strong></td>
                  <td>{user.email || 'Chưa cập nhật'}</td>
                  <td>{user.phone || 'Chưa cập nhật'}</td>
                  <td>{user.dateOfBirth || 'Chưa cập nhật'}</td>
                  <td>{user.lastLogin ? new Date(user.lastLogin).toLocaleString('vi-VN') : 'Chưa có dữ liệu'}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5">{isLoading ? 'Đang tải dữ liệu...' : 'Chưa có tài khoản nào đăng nhập.'}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

export default AdminUsers;
