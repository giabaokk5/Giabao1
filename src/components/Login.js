import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../assets/style/auth.css';
import { AuthContext } from '../contexts/AuthContext';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext); // Get login function from context

  const adminUsername = process.env.REACT_APP_ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.REACT_APP_ADMIN_PASSWORD || 'admin123';

  const handleLogin = (e) => {
    e.preventDefault();

    const registeredUser = JSON.parse(localStorage.getItem('user') || 'null');
    const isAdminLogin = username === adminUsername && password === adminPassword;
    const user = isAdminLogin
      ? { username: adminUsername, email: 'admin@htcdshop.local', role: 'admin' }
      : registeredUser;

    // Check username and password
    const isValidLogin = isAdminLogin || (
      user && user.username === username && user.password === password
    );

    if (isValidLogin) {
      alert('Đăng nhập thành công!');
      login(user); // Update the context and login state
      navigate(user.role === 'admin' ? '/admin' : '/');
    } else {
      alert('Tên đăng nhập hoặc mật khẩu không chính xác.');
    }
  };

  return (
    <main className="auth-container">
      <div className="auth-shell">
        <section className="auth-showcase">
          <span className="auth-badge">HTCD SHOP</span>
          <h1>Mặc đẹp theo cách của bạn.</h1>
          <p>Khám phá những thiết kế mới và trải nghiệm mua sắm thời trang đơn giản hơn.</p>
        </section>
        <section className="auth-box login-box">
          <div className="auth-heading">
            <span className="auth-eyebrow">CHÀO MỪNG TRỞ LẠI</span>
            <h2>Đăng nhập</h2>
            <p>Tiếp tục hành trình mua sắm của bạn.</p>
          </div>
          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label htmlFor="login-username">Tên đăng nhập</label>
              <input
                id="login-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label htmlFor="login-password">Mật khẩu</label>
              <input
                id="login-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="login-button">
              Đăng nhập
            </button>
            <div className="register-link">
              <p>Bạn chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link></p>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

export default Login;
