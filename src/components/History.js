import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import '../assets/style/history.css';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';

function History() {
  const location = useLocation();
  const { username } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMyOrders = async () => {
      if (location.state?.orderHistory) {
        setOrders(location.state.orderHistory);
        setIsLoading(false);
        return;
      }

      try {
        const data = await api.orders.getMyOrders(username);
        if (Array.isArray(data)) {
          setOrders(data);
          setIsLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Could not fetch user orders from API, checking local storage:', err.message);
      }

      const storedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      const userOrders = storedOrders.filter(
        (o) => !username || !o.customer || o.customer.toLowerCase() === username.toLowerCase()
      );
      setOrders(userOrders.length > 0 ? userOrders : storedOrders);
      setIsLoading(false);
    };

    fetchMyOrders();
  }, [location.state, username]);

  return (
    <div className="history">
      <h1>Lịch sử đặt hàng</h1>
      {isLoading ? (
        <p>Đang tải lịch sử đơn hàng...</p>
      ) : orders.length > 0 ? (
        <ul className="order-history">
          {orders.map((order) => (
            <li key={order.id}>
              <h3>Đơn hàng #{String(order.id).slice(-8)}</h3>
              <p>Khách hàng: {order.customer || 'Khách hàng'}</p>
              <p>Ngày đặt: {order.date}</p>
              <p>Tổng tiền: ${order.total}</p>
              <p>Trạng thái: <strong>{order.status || 'Đang xử lý'}</strong></p>
              <ul>
                {order.items?.map((item) => (
                  <li key={item.id}>
                    {item.name} - Số lượng: {item.quantity} (${item.price})
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
