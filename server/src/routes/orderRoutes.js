const express = require('express');
const axios = require('axios');
const db = require('../db');
const config = require('../config');
const { authenticateToken, optionalAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

async function sendTelegramNotification(order) {
  if (!config.TELEGRAM_BOT_TOKEN || !config.TELEGRAM_CHAT_ID) {
    return;
  }

  try {
    const itemsList = (order.items || [])
      .map((item) => `- ${item.name} x${item.quantity} ($${item.price})`)
      .join('\n');

    const message =
      `🛒 ĐƠN HÀNG MỚI TẠI HTCD SHOP!\n` +
      `Mã đơn: #${order.id}\n` +
      `Khách hàng: ${order.customer}\n` +
      `Tổng tiền: $${order.total}\n` +
      `Thanh toán: ${order.paymentMethod}\n` +
      `Ngày đặt: ${order.date}\n` +
      (order.delivery?.address ? `Địa chỉ: ${order.delivery.address}\n` : '') +
      (order.delivery?.phone ? `SĐT: ${order.delivery.phone}\n` : '') +
      `Chi tiết sản phẩm:\n${itemsList}`;

    const url = `https://api.telegram.org/bot${config.TELEGRAM_BOT_TOKEN}/sendMessage`;
    await axios.post(url, {
      chat_id: config.TELEGRAM_CHAT_ID,
      text: message
    });
  } catch (err) {
    console.error('Failed to send Telegram notification:', err.message);
  }
}

// POST /api/orders - Place a new order
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { items, total, delivery, paymentMethod, customer } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Giỏ hàng của bạn đang trống.' });
    }

    const customerName = (req.user && req.user.username) || customer || 'Khách hàng';

    const newOrder = db.createOrder({
      customer: customerName,
      items,
      total: Number(total) || 0,
      delivery: delivery || {},
      paymentMethod: paymentMethod || 'Thanh toán khi nhận hàng'
    });

    // Send telegram notification asynchronously in the background
    sendTelegramNotification(newOrder).catch(() => {});

    return res.status(201).json({
      message: 'Đặt hàng thành công!',
      order: newOrder
    });
  } catch (error) {
    console.error('Create order error:', error);
    return res.status(500).json({ message: 'Không thể xử lý đơn hàng.' });
  }
});

// GET /api/orders/my-orders - User's order history
router.get('/my-orders', optionalAuth, (req, res) => {
  try {
    const username = (req.user && req.user.username) || req.query.username;

    if (!username) {
      return res.status(400).json({ message: 'Vui lòng cung cấp tên tài khoản.' });
    }

    const orders = db.getOrdersByUser(username);
    return res.json(orders);
  } catch (error) {
    console.error('Get my orders error:', error);
    return res.status(500).json({ message: 'Không thể tải lịch sử đơn hàng.' });
  }
});

// GET /api/orders - All orders (Admin only)
router.get('/', authenticateToken, requireAdmin, (req, res) => {
  try {
    const orders = db.getOrders();
    return res.json(orders);
  } catch (error) {
    console.error('Get all orders error:', error);
    return res.status(500).json({ message: 'Không thể tải danh sách đơn hàng.' });
  }
});

// PUT /api/orders/:id/status - Update order status (Admin only)
router.put('/:id/status', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: 'Trạng thái đơn hàng là bắt buộc.' });
    }

    const updated = db.updateOrderStatus(req.params.id, status);
    if (!updated) {
      return res.status(404).json({ message: 'Không tìm thấy đơn hàng.' });
    }

    return res.json({
      message: 'Cập nhật trạng thái đơn hàng thành công!',
      order: updated
    });
  } catch (error) {
    console.error('Update order status error:', error);
    return res.status(500).json({ message: 'Không thể cập nhật trạng thái đơn hàng.' });
  }
});

module.exports = router;
