const express = require('express');
const db = require('../db');
const { optionalAuth } = require('../middleware/auth');

const router = express.Router({ mergeParams: true });

// GET /api/reviews/:productId or /api/products/:productId/reviews
router.get('/:productId', (req, res) => {
  try {
    const reviews = db.getReviews(req.params.productId);
    return res.json(reviews);
  } catch (error) {
    console.error('Get reviews error:', error);
    return res.status(500).json({ message: 'Không thể tải đánh giá sản phẩm.' });
  }
});

// POST /api/reviews/:productId
router.post('/:productId', optionalAuth, (req, res) => {
  try {
    const { username, rating, text } = req.body;

    if (!rating || !text) {
      return res.status(400).json({ message: 'Điểm đánh giá và nội dung nhận xét là bắt buộc.' });
    }

    const reviewerName = (req.user && req.user.username) || username || 'Khách hàng';

    const newReview = db.addReview(req.params.productId, {
      username: reviewerName,
      rating: Number(rating),
      text: text.trim()
    });

    return res.status(201).json({
      message: 'Cảm ơn bạn đã gửi đánh giá!',
      review: newReview
    });
  } catch (error) {
    console.error('Add review error:', error);
    return res.status(500).json({ message: 'Không thể lưu đánh giá.' });
  }
});

module.exports = router;
