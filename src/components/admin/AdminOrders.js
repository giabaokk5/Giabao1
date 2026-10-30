import React, { useState, useEffect } from 'react';
import '../../assets/style/admin.css';
import api from '../../services/api';
import AdminSidebar from './AdminSidebar';

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await api.orders.getAll();
        if (Array.isArray(data)) {
          setOrders(data);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Could not fetch orders from API, checking local storage:', err.message);
      }

      // Fallback
      const localOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      setOrders(localOrders);
      setIsLoading(false);
    };

    fetchOrders();
  }, []);

  return (
    <main className="admin-shell">
      <AdminSidebar active="orders" />

      <section className="admin-content">
        <header className="admin-page-header">
          <div>
            <span className="admin-eyebrow">BÁN HÀNG</span>
            <h1>Đơn hàng đã đặt</h1>
            <p>Theo dõi khách hàng, sản phẩm và phương thức thanh toán.</p>
          </div>
          <span className="admin-status">
            <i /> {isLoading ? 'Đang tải...' : `${orders.length} đơn hàng`}
          </span>
        </header>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Mã đơn</th>
                <th>Khách hàng</th>
                <th>Sản phẩm</th>
                <th>Tổng tiền</th>
                <th>Thanh toán</th>
                <th>Ngày đặt</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 ? orders.map((order) => (
                <tr key={order.id}>
                  <td><strong>#{String(order.id).slice(-8)}</strong></td>
                  <td>{order.customer || 'Khách hàng'}</td>
                  <td>
                    {order.items?.map((item) => `${item.name} x${item.quantity}`).join(', ') || 'Không có sản phẩm'}
                  </td>
                  <td>${order.total}</td>
                  <td>{order.paymentMethod || 'Chưa chọn'}</td>
                  <td>{order.date}</td>
                  <td>
                    <span className="badge bg-success">{order.status || 'Đã đặt'}</span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="7">{isLoading ? 'Đang tải dữ liệu...' : 'Chưa có đơn hàng nào được đặt.'}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

export default AdminOrders;
