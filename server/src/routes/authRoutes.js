const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const config = require('../config');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role
    },
    config.JWT_SECRET,
    { expiresIn: config.JWT_EXPIRES_IN }
  );
}

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, password, email, phone, dateOfBirth } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Tên đăng nhập và mật khẩu là bắt buộc.' });
    }

    const trimmedUsername = username.trim();
    if (trimmedUsername.length < 3) {
      return res.status(400).json({ message: 'Tên đăng nhập phải có ít nhất 3 ký tự.' });
    }

    if (password.length < 4) {
      return res.status(400).json({ message: 'Mật khẩu phải có ít nhất 4 ký tự.' });
    }

    const existing = db.findUserByUsername(trimmedUsername);
    if (existing) {
      return res.status(409).json({ message: 'Tên đăng nhập đã được sử dụng. Vui lòng chọn tên khác.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = db.createUser({
      username: trimmedUsername,
      password: hashedPassword,
      email: email ? email.trim() : '',
      phone: phone ? phone.trim() : '',
      dateOfBirth: dateOfBirth ? dateOfBirth.trim() : '',
      role: 'user'
    });

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    db.addLoginHistory({
      username: newUser.username,
      email: newUser.email,
      phone: newUser.phone,
      dateOfBirth: newUser.dateOfBirth,
      ip: clientIp
    });

    const token = generateToken(newUser);

    const safeUser = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email,
      phone: newUser.phone,
      dateOfBirth: newUser.dateOfBirth,
      role: newUser.role
    };

    return res.status(201).json({
      message: 'Đăng ký tài khoản thành công!',
      user: safeUser,
      token
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Đã xảy ra lỗi máy chủ trong quá trình đăng ký.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: 'Vui lòng nhập tên đăng nhập và mật khẩu.' });
    }

    const trimmedUsername = username.trim();
    const user = db.findUserByUsername(trimmedUsername);

    if (!user) {
      return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không chính xác.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không chính xác.' });
    }

    const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '';
    db.addLoginHistory({
      username: user.username,
      email: user.email,
      phone: user.phone,
      dateOfBirth: user.dateOfBirth,
      ip: clientIp
    });

    const token = generateToken(user);

    const safeUser = {
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      dateOfBirth: user.dateOfBirth,
      role: user.role
    };

    return res.json({
      message: 'Đăng nhập thành công!',
      user: safeUser,
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Đã xảy ra lỗi máy chủ trong quá trình đăng nhập.' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req, res) => {
  const user = db.findUserById(req.user.id);
  if (!user) {
    return res.status(404).json({ message: 'Không tìm thấy thông tin người dùng.' });
  }

  return res.json({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      dateOfBirth: user.dateOfBirth,
      role: user.role
    }
  });
});

module.exports = router;
