import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../assets/style/auth.css';

function Register() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');

  const handleRegister = (e) => {
    e.preventDefault();

    // Kiểm tra xem mật khẩu và xác nhận mật khẩu có trùng khớp không
    if (password !== confirmPassword) {
      alert('Mật khẩu và xác nhận mật khẩu không trùng khớp.');
      return;
    }

    if (!/^0\d{9}$/.test(phone)) {
      alert('Số điện thoại phải gồm 10 chữ số và bắt đầu bằng số 0.');
      return;
    }

    if (new Date(dateOfBirth) > new Date()) {
      alert('Ngày sinh không được lớn hơn ngày hiện tại.');
      return;
    }

    // Lưu thông tin người dùng vào localStorage (hoặc vào cơ sở dữ liệu)
    const newUser = { email, username, password, phone, dateOfBirth };
    localStorage.setItem('user', JSON.stringify(newUser));

    alert('Đăng ký thành công!');
    navigate('/login'); // Điều hướng đến trang đăng nhập
  };

  return (
    <main className="auth-container">
      <div className="auth-shell register-shell">
        <section className="auth-showcase">
          <span className="auth-badge">HTCD SHOP</span>
          <h1>Phong cách bắt đầu từ bạn.</h1>
          <p>Tạo tài khoản để lưu sản phẩm yêu thích và nhận ưu đãi dành riêng cho thành viên.</p>
        </section>
        <section className="auth-box register-box">
          <div className="auth-heading">
            <span className="auth-eyebrow">THÀNH VIÊN HTCD</span>
            <h2>Tạo tài khoản</h2>
            <p>Điền thông tin để bắt đầu mua sắm.</p>
          </div>
          <form onSubmit={handleRegister}>
            <div className="input-group">
              <label htmlFor="register-email">Email</label>
              <input
                id="register-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="register-username">Tên đăng nhập</label>
              <input
                id="register-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="auth-form-row">
              <div className="input-group">
                <label htmlFor="register-phone">Số điện thoại</label>
                <input
                  id="register-phone"
                  type="tel"
                  inputMode="numeric"
                  pattern="0[0-9]{9}"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="09xxxxxxxx"
                  required
                />
              </div>
              <div className="input-group">
                <label htmlFor="register-date-of-birth">Ngày sinh</label>
                <input
                  id="register-date-of-birth"
                  type="date"
                  max={new Date().toISOString().split('T')[0]}
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="input-group">
              <label htmlFor="register-password">Mật khẩu</label>
              <input
                id="register-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="register-confirm-password">Xác nhận mật khẩu</label>
              <input
                id="register-confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="register-button">
              Đăng ký
            </button>
          </form>
          <div className="login-link">
            <p>
              Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Register;
