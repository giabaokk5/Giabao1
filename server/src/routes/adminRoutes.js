const express = require('express');
const db = require('../db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Apply admin guard to all routes in this router
router.use(authenticateToken, requireAdmin);

// GET /api/admin/stats
router.get('/stats', (req, res) => {
  try {
    const stats = db.getStats();
    return res.json(stats);
  } catch (error) {
    console.error('Admin stats error:', error);
    return res.status(500).json({ message: 'Không thể tải số liệu thống kê.' });
  }
});

// GET /api/admin/users
router.get('/users', (req, res) => {
  try {
    const users = db.getUsers().map((u) => ({
      id: u.id,
      username: u.username,
      email: u.email,
      phone: u.phone,
      dateOfBirth: u.dateOfBirth,
      role: u.role,
      createdAt: u.createdAt
    }));

    const loginHistory = db.getLoginHistory();

    return res.json({
      users,
      loginHistory
    });
  } catch (error) {
    console.error('Admin users error:', error);
    return res.status(500).json({ message: 'Không thể tải danh sách tài khoản.' });
  }
});

module.exports = router;
