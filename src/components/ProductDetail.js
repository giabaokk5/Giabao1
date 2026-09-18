import React, { useContext, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import '../assets/style/product-detail.css';
import { useCart } from '../contexts/CartContext';
import { AuthContext } from '../contexts/AuthContext';

const products = [
  // Danh sách sản phẩm như bạn đã cung cấp
  { id: 1, name: 'Mũ Trắng', category: 'Mũ', image: '/images/mumautrang.jpg', price: 1000 },
  { id: 2, name: 'Áo Sơ Mi Trắng', category: 'Áo thun', image: '/images/aomitrang.jpg', price: 2000 },
  { id: 3, name: 'Quần Jeans Xanh', category: 'Quần', image: '/images/quanjear1.jpg', price: 5000 },
  { id: 4, name: 'Áo Sơ Mi Đen', category: 'Áo thun', image: '/images/aosomiden2.jpg', price: 500 },
  { id: 5, name: 'Áo Sơ Mi Xanh', category: 'Áo thun', image: '/images/aosomixanh.jpg', price: 400 },
  { id: 6, name: 'Mũ Đỏ', category: 'Mũ', image: '/images/mudo.jpg', price: 205 },
  { id: 7, name: 'Áo Khoác Gió Màu Đen', category: 'Áo khoác', image: '/images/aokhoac5.jpg', price: 680 },
  { id: 8, name: 'Giày Màu Tím', category: 'Giày', image: '/images/giaytim.jpg', price: 230 },
  { id: 9, name: 'Quần Jean Light Blue', category: 'Quần', image: '/images/quan1.jpg', price: 800 },
  { id: 10, name: 'Áo Khoác Màu Bạc', category: 'Áo khoác', image: '/images/aokhoac20.jpg', price: 330 },
  { id: 11, name: 'Áo Khoác Trắng', category: 'Áo khoác', image: '/images/aokhoac6.jpg', price: 700 },
  { id: 12, name: 'Áo Sơ Mi Bạc', category: 'Áo thun', image: '/images/ao somibac.jpg', price: 310 },
  { id: 13, name: 'Mũ Vàng', category: 'Mũ', image: '/images/muvang.jpg', price: 210 },
  { id: 14, name: 'Áo Khoác Màu Nâu', category: 'Áo khoác', image: '/images/aokhoac4.jpg', price: 680 },
  { id: 15, name: 'Áo Thun Tay Ngắn', category: 'Áo thun', image: '/images/shirt.jpg', price: 250 },
  { id: 16, name: 'Giày Xanh', category: 'Giày', image: '/images/giayxanh.jpg', price: 270 },
  { id: 17, name: 'Áo Khoác Gió Màu Đỏ', category: 'Áo khoác', image: '/images/aokhoac13.jpg', price: 430 },
  { id: 18, name: 'Áo Thun Đen', category: 'Áo thun', image: '/images/aothun4.jpg', price: 230 },
  { id: 19, name: 'Áo Sơ Mi', category: 'Áo thun', image: '/images/aoominagan.jpg', price: 540 },
  { id: 20, name: 'Áo Thun Xanh', category: 'Áo thun', image: '/images/aoxanh.jpg', price: 540 },
  { id: 21, name: 'Áo Khoác Da Màu Nâu', category: 'Áo khoác', image: '/images/aokhoac14.jpg', price: 450 },
  { id: 22, name: 'Áo Khoác Đen', category: 'Áo khoác', image: '/images/aokhoac9.jpg', price: 740 },
  { id: 23, name: 'Áo Khoác Gió Red', category: 'Áo khoác', image: '/images/aokhoac2.jpg', price: 500 },
  { id: 24, name: 'Quần Jeans Đen', category: 'Quần', image: '/images/quandn8.jpg', price: 700 },
  { id: 25, name: 'Á o Khoác Xanh', category: 'Áo khoác', image: '/images/aokhoac7.jpg', price: 750 },
  { id: 26, name: 'Áo Khoác Gió Black', category: 'Áo khoác', image: '/images/aokhoac1.jpg', price: 500 },
  { id: 27, name: 'Giày Trắng', category: 'Giày', image: '/images/giaytrang.jpg', price: 200 },
  { id: 28, name: 'Mũ Đen', category: 'Mũ', image: '/images/muden.jpg', price: 215 },
  { id: 29, name: 'Áo Khoác Màu Đen', category: 'Áo khoác', image: '/images/aokhoac16.jpg', price: 410 },
  { id: 30, name: 'Quần Jeans Bạc', category: 'Quần', image: '/images/quan jean bac.jpg', price: 500 },
  { id: 31, name: 'Mũ Xanh', category: 'Mũ', image: '/images/muxanh.jpg', price: 225 },
  { id: 32, name: 'Giày Thể Thao', category: 'Giày', image: '/images/giaythethao.jpg', price: 230 },
  { id: 33, name: 'Áo Khoác Màu Nâu', category: 'Áo khoác', image: '/images/aokhoac18.jpg', price: 340 },
  { id: 34, name: 'Áo Sơ Mi', category: 'Áo thun', image: '/images/aoomi1.jpg', price: 800 },
  { id: 35, name: 'Quần Jeans Xanh Bạc', category: 'Quần', image: '/images/quan1.jpg', price: 860 },
  { id: 36, name: 'Giày Đen', category: 'Giày', image: '/images/giayden.jpg', price: 260 },
  { id: 37, name: 'Áo Thun Trắng', category: 'Áo thun', image: '/images/aothutrang4.jpg', price: 250 },
  { id: 38, name: 'Quần Jeans Đen', category: 'Quần', image: '/images/quan jean den4.jpg', price: 740 },
  { id: 39, name: 'Áo Khoác Vàng', category: 'Áo khoác', image: '/images/aokhoac3.jpg', price: 660 },
  { id: 40, name: 'Áo Sơ Mi Vàng', category: 'Áo thun', image: '/images/aosomivang.jpg', price: 340 },
  { id: 41, name: 'Giày Xanh', category: 'Giày', image: '/images/giay1.jpg', price: 210 },
  { id: 42, name: 'Áo Khoác Màu Hồng', category: 'Áo kho ác', image: '/images/aokhoac11.jpg', price: 380 },
  { id: 43, name: 'Mũ Xanh Lá Cây', category: 'Mũ', image: '/images/muxanhlacay.jpg', price: 208 },
  { id: 44, name: 'Áo Khoác Nâu', category: 'Áo khoác', image: '/images/aokhoac8.jpg', price: 730 },
  { id: 45, name: 'Giày Đen Trắng', category: 'Giày', image: '/images/giaydentrang.jpg', price: 250 }
];

function ProductDetail() {
  const { id } = useParams();
  const { addToCart } = useCart();
  const [message, setMessage] = useState('');
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const navigate = useNavigate(); // Sử dụng navigate
  const { username } = useContext(AuthContext);
  const product = products.find((p) => p.id === parseInt(id));

  if (!product) return <h2>Không tìm thấy sản phẩm</h2>;

  const similarProducts = products.filter(
    (p) => p.category === product.category && p.id !== product.id
  );

  const handleAddToCart = () => {
    addToCart(product);
    setMessage('Bạn đã thêm sản phẩm vào giỏ hàng thành công!');
    setTimeout(() => setMessage(''), 500);
  };

  const handleCheckout = () => {
    navigate('/checkout', { state: { product } }); // Điều hướng đến trang thanh toán
  };

  const storedReviews = JSON.parse(localStorage.getItem('productReviews') || '{}');
  const reviews = storedReviews[product.id] || [];
  const averageRating = reviews.length > 0
    ? reviews.reduce((total, review) => total + review.rating, 0) / reviews.length
    : 0;

  const handleSubmitReview = (event) => {
    event.preventDefault();
    const text = reviewText.trim();

    if (!text) {
      return;
    }

    const nextReview = {
      id: Date.now(),
      username: username || 'Khách hàng',
      rating: reviewRating,
      text,
      date: new Date().toLocaleDateString('vi-VN'),
    };
    const nextReviews = [nextReview, ...reviews];
    localStorage.setItem('productReviews', JSON.stringify({
      ...storedReviews,
      [product.id]: nextReviews,
    }));
    setReviewText('');
    setReviewRating(5);
  };

  return (
    <div className="product-detail-container">
      <div className="product-detail-card">
        <div className="product-image">
          <img src={product.image} alt={product.name} />
        </div>
        <div className="product-info">
          <h1 className="product-name">{product.name}</h1>
          <p className="product-price">Giá: ${product.price}</p>
          <p className="product-category">Loại: {product.category}</p>
          <p className="product-description">{product.description}</p>
          <div className="button-container">
            <button className="add-to-cart-button" onClick={handleAddToCart}>
              Thêm vào giỏ hàng
            </button>
            <button className="checkout-button" onClick={handleCheckout}>
              Thanh toán
            </button>
          </div>
          {message && <div className="success-message">{message}</div>}
        </div>
      </div>

      {similarProducts.length > 0 && (
        <div className="similar-products">
          <h2>Sản phẩm tương tự</h2>
          <div className="similar-products-list">
            {similarProducts.slice(0, 5).map((similarProduct) => (
              <div key={similarProduct.id} className="similar-product-card">
                <Link to={`/product/${similarProduct.id}`}>
                  <img
                    src={similarProduct.image}
                    alt={similarProduct.name}
                    className="similar-product-image"
                  />
                  <h3 className="similar-product-name">{similarProduct.name}</h3>
                  <p className="similar-product-price">
                    Giá: ${similarProduct.price}
                  </p>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      <section className="product-reviews">
        <div className="reviews-heading">
          <div>
            <span className="reviews-eyebrow">TRẢI NGHIỆM KHÁCH HÀNG</span>
            <h2>Đánh giá sản phẩm</h2>
          </div>
          <div className="reviews-summary">
            <strong>{averageRating ? averageRating.toFixed(1) : '—'}</strong>
            <span>{[1, 2, 3, 4, 5].map((star) => (
              <span key={star} className={star <= Math.round(averageRating) ? 'star active' : 'star'}>★</span>
            ))}</span>
            <small>{reviews.length} đánh giá</small>
          </div>
        </div>

        <form className="review-form" onSubmit={handleSubmitReview}>
          <div className="review-form-top">
            <label>Đánh giá của bạn</label>
            <div className="rating-picker" aria-label="Chọn số sao">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  className={star <= reviewRating ? 'star active' : 'star'}
                  onClick={() => setReviewRating(star)}
                  aria-label={`${star} sao`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <textarea
            value={reviewText}
            onChange={(event) => setReviewText(event.target.value)}
            placeholder="Chia sẻ cảm nhận của bạn về sản phẩm..."
            rows="4"
            required
          />
          <button type="submit" className="review-submit">Gửi đánh giá</button>
        </form>

        <div className="review-list">
          {reviews.length > 0 ? reviews.map((review) => (
            <article key={review.id} className="review-item">
              <div className="review-avatar">{review.username.charAt(0).toUpperCase()}</div>
              <div>
                <div className="review-item-heading">
                  <strong>{review.username}</strong>
                  <small>{review.date}</small>
                </div>
                <div className="review-stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className={star <= review.rating ? 'star active' : 'star'}>★</span>
                  ))}
                </div>
                <p>{review.text}</p>
              </div>
            </article>
          )) : (
            <p className="empty-reviews">Chưa có đánh giá nào. Hãy là người đầu tiên chia sẻ cảm nhận.</p>
          )}
        </div>
      </section>
    </div>
  );
}

export default ProductDetail;