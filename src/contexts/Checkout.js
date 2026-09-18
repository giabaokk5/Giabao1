import axios from 'axios';
import React, { useContext, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../assets/style/checkout.css';
// Assuming you have a context to manage authentication state
import { AuthContext } from '../contexts/AuthContext'; // Example import, adjust to your context structure

function Checkout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn } = useContext(AuthContext);
  const product = location.state?.product;
  const cartItemsFromState = location.state?.cartItems || [];

  const [items, setItems] = useState(
    cartItemsFromState.length > 0
      ? cartItemsFromState
      : product
        ? [{ ...product, quantity: 1 }]
        : []
  );

  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');

  const updateCheckoutQuantity = (id, nextQuantity) => {
    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id
          ? { ...item, quantity: Math.max(1, Number(nextQuantity) || 1) }
          : item
      )
    );
  };

  const subtotal = items.reduce((total, item) => total + Number(item.price) * Number(item.quantity || 1), 0);

  if (!product && items.length === 0) {
    return <h2>Không có sản phẩm để thanh toán</h2>;
  }

  const handleConfirmPayment = () => {
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    if (!address || !phone) {
      alert('Vui lòng nhập đầy đủ địa chỉ và số điện thoại.');
      return;
    }

    if (!paymentMethod) {
      alert('Vui lòng chọn phương thức thanh toán.');
      return;
    }

    const paymentMethodLabels = {
      cod: 'Thanh toán khi nhận hàng',
      bank: 'Chuyển khoản ngân hàng',
      wallet: 'Ví điện tử',
    };

    const newOrder = {
      id: Math.floor(Math.random() * 1000),
      customer: JSON.parse(localStorage.getItem('user') || 'null')?.username || 'Khách hàng',
      date: new Date().toLocaleDateString(),
      total: subtotal,
      items: items.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
      })),
      delivery: {
        address,
        phone,
      },
      paymentMethod: paymentMethodLabels[paymentMethod],
    };

    const storedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    localStorage.setItem('orders', JSON.stringify([newOrder, ...storedOrders]));

    const orderMessage = `
      🛒 Đơn hàng mới!
      - Mã đơn hàng: ${newOrder.id}
      - Ngày: ${newOrder.date}
      - Sản phẩm: ${items.map((item) => `${item.name} x ${item.quantity}`).join(', ')}
      - Tổng tiền: $${subtotal}
      - Địa chỉ giao hàng: ${address}
      - Số điện thoại: ${phone}
      - Phương thức thanh toán: ${paymentMethodLabels[paymentMethod]}
    `;

    const sendToTelegram = async () => {
      const botToken = '8157137572:AAGahMNa3729RVAsDVlW1J0njPF1rFyXRCE';
      const chatId = '2075745493';

      try {
        const response = await axios.post(
          `https://api.telegram.org/bot${botToken}/sendMessage`,
          {
            chat_id: chatId,
            text: orderMessage,
          }
        );

        if (response.status === 200) {
          console.log('Message sent to Telegram successfully');
        } else {
          console.error('Failed to send message to Telegram');
        }
      } catch (error) {
        console.error('Error sending Telegram message:', error.message);
      }
    };

    sendToTelegram();

    navigate('/history', {
      state: {
        orderHistory: [newOrder],
      },
    });

    alert('Cảm ơn bạn đã mua hàng!');
  };

  return (
    <div className="checkout-container">
      <h1>Thanh toán</h1>

      <div className="checkout-products-list">
        {items.map((item) => (
          <div key={item.id} className="checkout-product">
            <img src={item.image} alt={item.name} />
            <div className="checkout-product-info">
              <h2>{item.name}</h2>
              <p>Giá: ${item.price}</p>
              <div className="checkout-quantity-row">
                <button type="button" onClick={() => updateCheckoutQuantity(item.id, Number(item.quantity || 1) - 1)}>-</button>
                <span>{item.quantity || 1}</span>
                <button type="button" onClick={() => updateCheckoutQuantity(item.id, Number(item.quantity || 1) + 1)}>+</button>
              </div>
              <strong>Tổng: ${Number(item.price) * Number(item.quantity || 1)}</strong>
            </div>
          </div>
        ))}
      </div>

      <div className="checkout-summary-box">
        <h3>Sản phẩm đã đặt</h3>
        <ul>
          {items.map((item) => (
            <li key={item.id}>
              {item.name} x {item.quantity || 1} - ${Number(item.price) * Number(item.quantity || 1)}
            </li>
          ))}
        </ul>
        <p className="checkout-total">Tổng tiền: ${subtotal}</p>
      </div>

      {isLoggedIn && (
        <div className="checkout-delivery-info">
          <h3>Thông tin giao hàng</h3>
          <label>
            Địa chỉ giao hàng:
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Nhập địa chỉ giao hàng"
            />
          </label>
          <label>
            Số điện thoại:
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Nhập số điện thoại"
            />
          </label>

          <fieldset className="payment-methods">
            <legend>Phương thức thanh toán</legend>
            <label className={`payment-option ${paymentMethod === 'cod' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="paymentMethod"
                value="cod"
                checked={paymentMethod === 'cod'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span>
                <strong>Thanh toán khi nhận hàng</strong>
                <small>Thanh toán trực tiếp cho nhân viên giao hàng</small>
              </span>
            </label>
            <label className={`payment-option ${paymentMethod === 'bank' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="paymentMethod"
                value="bank"
                checked={paymentMethod === 'bank'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span>
                <strong>Chuyển khoản ngân hàng</strong>
                <small>Chuyển khoản trước khi đơn hàng được giao</small>
              </span>
            </label>
            <label className={`payment-option ${paymentMethod === 'wallet' ? 'selected' : ''}`}>
              <input
                type="radio"
                name="paymentMethod"
                value="wallet"
                checked={paymentMethod === 'wallet'}
                onChange={(e) => setPaymentMethod(e.target.value)}
              />
              <span>
                <strong>Ví điện tử</strong>
                <small>Thanh toán nhanh qua ví điện tử</small>
              </span>
            </label>
          </fieldset>
        </div>
      )}

      <button className="confirm-payment-button" onClick={handleConfirmPayment}>
        Xác nhận thanh toán
      </button>
    </div>
  );
}

export default Checkout;
