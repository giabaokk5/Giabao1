import React from 'react';
import { useLocation } from 'react-router-dom';
import '../assets/style/history.css';
function History() {
  const location = useLocation();
  const storedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
  const orderHistory = location.state?.orderHistory || storedOrders;

  return (
    <div className="history">
      <h1>Lịch sử đặt hàng</h1>
      {orderHistory.length > 0 ? (
        <ul className="order-history">
          {orderHistory.map((order) => (
            <li key={order.id}>
              <h3>Đơn hàng #{order.id}</h3>
              <p>Khách hàng: {order.customer || 'Khách hàng'}</p>
              <p>Ngày đặt: {order.date}</p>
              <p>Tổng tiền: ${order.total}</p>
              <ul>
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.name} - Số lượng: {item.quantity}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      ) : (
        <p>Bạn chưa có đơn hàng nào.</p>
      )}
    </div>
  );
}

export default History;
