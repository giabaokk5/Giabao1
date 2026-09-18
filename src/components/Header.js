import { faShoppingCart, faSignOutAlt, faTags, faUser } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import '../assets/style/header.css';
import { AuthContext } from '../contexts/AuthContext';

function Header() {
  const { isLoggedIn, username, isAdmin, logout } = useContext(AuthContext);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <header className="header">
      <div className="header-container">
        {/* Logo */}
        <h1 className="logo">
          <Link to="/" className="logo-link">
            <span className="logo-mark">HT</span>
            <span className="logo-copy">
              <span className="logo-name">HTCD SHOP</span>
              <span className="logo-tagline">THỜI TRANG MỖI NGÀY</span>
            </span>
          </Link>
        </h1>

        {/* Navigation and User Actions */}
        <nav className="nav">
          <Link to="/ticket" className="nav-link">
            <FontAwesomeIcon icon={faTags} className="icon" /> Hỗ trợ
          </Link>
          <Link to="/cart" className="nav-link">
            <FontAwesomeIcon icon={faShoppingCart} className="icon" /> Giỏ hàng
          </Link>
          {isLoggedIn && isAdmin && (
            <Link to="/admin" className="nav-link">
              <FontAwesomeIcon icon={faUser} className="icon" /> Quay lại Admin
            </Link>
          )}
          {isLoggedIn ? (
            <div className="dropdown">
              <button className="btn" onClick={toggleDropdown}>
                <span className="username">Chào, {username}!</span>
              </button>
              {dropdownOpen && (
                <div className="dropdown-menu">
                  <Link to="/profile" className="dropdown-item">Thông tin</Link>
                  <button className="btn logout-btn" onClick={logout}>
                    <FontAwesomeIcon icon={faSignOutAlt} className="icon" /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="nav-link">
              <FontAwesomeIcon icon={faUser} className="icon" /> Đăng nhập
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

export default Header;
