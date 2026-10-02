const express = require('express');
const db = require('../db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// GET /api/products
router.get('/', (req, res) => {
  try {
    const { category, search, q, page, limit } = req.query;

    const searchTerm = search || q;
    let products = db.getProducts({ category, search: searchTerm });

    if (page && limit) {
      const pageNum = parseInt(page, 10) || 1;
      const limitNum = parseInt(limit, 10) || 10;
      const total = products.length;
      const totalPages = Math.ceil(total / limitNum);
      const startIndex = (pageNum - 1) * limitNum;
      const paginatedProducts = products.slice(startIndex, startIndex + limitNum);

      return res.json({
        products: paginatedProducts,
        total,
        page: pageNum,
        totalPages,
        limit: limitNum
      });
    }

    return res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    return res.status(500).json({ message: 'Không thể tải danh sách sản phẩm.' });
  }
});

// GET /api/products/:id
router.get('/:id', (req, res) => {
  try {
    const product = db.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm.' });
    }
    return res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    return res.status(500).json({ message: 'Không thể tải thông tin sản phẩm.' });
  }
});

// POST /api/products (Admin only)
router.post('/', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { name, category, price, image, description } = req.body;

    if (!name || !category || price === undefined) {
      return res.status(400).json({ message: 'Tên sản phẩm, danh mục và giá là bắt buộc.' });
    }

    const created = db.createProduct({
      name: name.trim(),
      category: category.trim(),
      price: Number(price),
      image: image ? image.trim() : '/images/default.jpg',
      description: description ? description.trim() : ''
    });

    return res.status(201).json({
      message: 'Thêm sản phẩm mới thành công!',
      product: created
    });
  } catch (error) {
    console.error('Create product error:', error);
    return res.status(500).json({ message: 'Không thể tạo mới sản phẩm.' });
  }
});

// PUT /api/products/:id (Admin only)
router.put('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const { name, category, price, image, description } = req.body;

    const updated = db.updateProduct(req.params.id, {
      ...(name && { name: name.trim() }),
      ...(category && { category: category.trim() }),
      ...(price !== undefined && { price: Number(price) }),
      ...(image && { image: image.trim() }),
      ...(description !== undefined && { description: description.trim() })
    });

    if (!updated) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm cần cập nhật.' });
    }

    return res.json({
      message: 'Cập nhật sản phẩm thành công!',
      product: updated
    });
  } catch (error) {
    console.error('Update product error:', error);
    return res.status(500).json({ message: 'Không thể cập nhật sản phẩm.' });
  }
});

// DELETE /api/products/:id (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  try {
    const deleted = db.deleteProduct(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: 'Không tìm thấy sản phẩm để xóa.' });
    }

    return res.json({ message: 'Xóa sản phẩm thành công!' });
  } catch (error) {
    console.error('Delete product error:', error);
    return res.status(500).json({ message: 'Không thể xóa sản phẩm.' });
  }
});

module.exports = router;
