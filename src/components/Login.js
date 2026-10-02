import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../assets/style/auth.css';
import { AuthContext } from '../contexts/AuthContext';
import api from '../services/api';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const adminUsername = process.env.REACT_APP_ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.REACT_APP_ADMIN_PASSWORD || 'admin123';

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      // 1. Try logging in via backend API
      const response = await api.auth.login({ username, password });
      setIsLoading(false);
      alert('Đăng nhập thành công!');
      login(response.user, response.token);
      navigate(response.user.role === 'admin' ? '/admin' : '/');
      return;
    } catch (apiError) {
      // 2. Fallback to local check if backend is offline or for legacy local accounts
      const registeredUser = JSON.parse(localStorage.getItem('user') || 'null');
      const isAdminLogin = username === adminUsername && password === adminPassword;

      if (isAdminLogin) {
        setIsLoading(false);
        const adminUser = { username: adminUsername, email: 'admin@htcdshop.local', role: 'admin' };
        alert('Đăng nhập thành công (Admin)!');
        login(adminUser, 'mock-admin-token');
        navigate('/admin');
        return;
      }

      if (registeredUser && registeredUser.username === username && registeredUser.password === password) {
        setIsLoading(false);
        alert('Đăng nhập thành công!');
        login(registeredUser, 'mock-user-token');
        navigate('/');
        return;
      }

      setIsLoading(false);
      const msg = apiError.message || 'Tên đăng nhập hoặc mật khẩu không chính xác.';
      setErrorMessage(msg);
      alert(msg);
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

          {errorMessage && (
            <div className="alert alert-danger py-2" role="alert">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <div className="input-group">
              <label htmlFor="login-username">Tên đăng nhập</label>
              <input
                id="login-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
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
                disabled={isLoading}
              />
            </div>
            <button type="submit" className="login-button" disabled={isLoading}>
              {isLoading ? 'Đang xử lý...' : 'Đăng nhập'}
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
