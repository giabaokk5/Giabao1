import { faMinus, faPlus, faShoppingCart, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import axios from 'axios'; // Import axios
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../assets/style/cart.css';
import { useCart } from '../contexts/CartContext';

function Cart() {
  const { cartItems, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const [discountCode, setDiscountCode] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [orderHistory, setOrderHistory] = useState([]);
  const navigate = useNavigate();

  const handleIncrease = (item) => {
    updateQuantity(item.id, item.quantity + 1);
  };

  const handleDecrease = (item) => {
    if (item.quantity > 1) {
      updateQuantity(item.id, item.quantity - 1);
    }
  };

  const handleApplyDiscount = () => {
    if (discountCode === '2024') {
      setDiscountAmount(totalPrice * 0.1); // Giảm 10%
    } else {
      alert('Mã giảm giá không hợp lệ');
    }
  };

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      alert('Giỏ hàng trống, không thể đặt hàng!');
      return;
    }

    const newOrder = {
      id: new Date().toISOString(),
      customer: JSON.parse(localStorage.getItem('user') || 'null')?.username || 'Khách hàng',
      items: cartItems,
      total: totalPrice - discountAmount,
      date: new Date().toLocaleString(),
    };

    setOrderHistory([...orderHistory, newOrder]);
    const storedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
    localStorage.setItem('orders', JSON.stringify([newOrder, ...storedOrders]));
    clearCart();

    // Gửi thông báo đến bot Telegram
    const message = `🛒Đơn hàng mới:\nID: ${newOrder.id}\nNgày: ${newOrder.date}\nTổng tiền: $${newOrder.total}\nChi tiết:\n` + 
                    cartItems.map(item => `${item.name} - Số lượng: ${item.quantity} - Giá: $${item.price}`).join('\n');

    const telegramToken = '8157137572:AAGahMNa3729RVAsDVlW1J0njPF1rFyXRCE'; // Thay thế bằng token của bạn
    const chatId = '2075745493'; // Thay thế bằng chat_id của bạn

    try {
      await axios.post(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
        chat_id: chatId,
        text: message,
      });
      navigate('/history', { state: { orderHistory: [...orderHistory, newOrder] } });
    } catch (error) {
      console.error('Lỗi khi gửi đơn hàng đến Telegram:', error);
    }
  };

  const discountedTotal = totalPrice - discountAmount;

  return (
    <main className="cart-page">
      <header className="cart-header">
        <div>
          <span className="cart-eyebrow">HTCD SHOP</span>
          <h1>Giỏ hàng của bạn</h1>
          <p>Kiểm tra sản phẩm và hoàn tất đơn hàng của bạn.</p>
        </div>
        <span className="cart-count">{cartItems.length} sản phẩm</span>
      </header>
      {cartItems.length > 0 ? (
        <div className="cart-layout">
          <section className="cart-items-panel">
            <div className="cart-panel-header">
              <h2>Sản phẩm đã chọn</h2>
              <button className="clear-btn" onClick={clearCart}>
                <FontAwesomeIcon icon={faTrash} /> Xóa tất cả
              </button>
            </div>
            <ul className="cart-list">
            {cartItems.map((item) => (
              <li key={item.id} className="cart-item">
                <img className="cart-item-image" src={item.image} alt={item.name} />
                <div className="cart-item-main">
                  <div className="cart-item-heading">
                    <div>
                      <span className="cart-item-category">Thời trang HTCD</span>
                      <h3>{item.name}</h3>
                    </div>
                    <button className="remove-btn" onClick={() => removeFromCart(item.id)} aria-label={`Xóa ${item.name}`}>
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                  <div className="cart-item-footer">
                    <p className="price">${item.price}</p>
                    <div className="quantity" aria-label={`Số lượng ${item.name}`}>
                      <button onClick={() => handleDecrease(item)} aria-label="Giảm số lượng">
                        <FontAwesomeIcon icon={faMinus} />
                      </button>
                      <span>{item.quantity}</span>
                      <button onClick={() => handleIncrease(item)} aria-label="Tăng số lượng">
                        <FontAwesomeIcon icon={faPlus} />
                      </button>
                    </div>
                    <strong className="item-total">${item.price * item.quantity}</strong>
                  </div>
                </div>
              </li>
            ))}
            </ul>
          </section>

          <aside className="cart-summary">
            <h2>Tóm tắt đơn hàng</h2>
            <div className="summary-row">
              <span>Tạm tính</span>
              <strong>${totalPrice}</strong>
            </div>
            <div className="summary-row discount-row">
              <span>Giảm giá</span>
              <strong>- ${discountAmount}</strong>
            </div>
            <div className="discount">
              <input
                type="text"
                placeholder="Mã giảm giá"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value)}
              />
              <button onClick={handleApplyDiscount}>Áp dụng</button>
            </div>
            <div className="summary-total">
              <span>Tổng thanh toán</span>
              <strong>${discountedTotal}</strong>
            </div>
            <button className="order-btn" onClick={handlePlaceOrder}>
              Tiến hành đặt hàng <span>→</span>
            </button>
            <p className="secure-note">Thanh toán an toàn và bảo mật</p>
          </aside>
        </div>
      ) : (
        <section className="empty-cart">
          <div className="empty-cart-icon"><FontAwesomeIcon icon={faShoppingCart} /></div>
          <h2>Giỏ hàng đang trống</h2>
          <p>Hãy khám phá các sản phẩm mới nhất của HTCD Shop.</p>
          <Link to="/" className="continue-shopping">Tiếp tục mua sắm</Link>
        </section>
      )}
    </main>
  );
}

export default Cart;
