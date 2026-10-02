const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const config = require('./config');
const initialProducts = require('../data/initialProducts');

class Database {
  constructor() {
    this.dbFile = config.DB_FILE;
    this.dataDir = config.DATA_DIR;
    this.init();
  }

  init() {
    if (!fs.existsSync(this.dataDir)) {
      fs.mkdirSync(this.dataDir, { recursive: true });
    }

    if (!fs.existsSync(this.dbFile)) {
      // Hash default admin password
      const salt = bcrypt.genSaltSync(10);
      const hashedAdminPassword = bcrypt.hashSync(config.ADMIN_PASSWORD, salt);

      const initialData = {
        users: [
          {
            id: 'admin-1',
            username: config.ADMIN_USERNAME,
            password: hashedAdminPassword,
            email: config.ADMIN_EMAIL,
            phone: '0901234567',
            dateOfBirth: '1995-01-01',
            role: 'admin',
            createdAt: new Date().toISOString()
          }
        ],
        loginHistory: [],
        products: initialProducts.map((p) => ({
          ...p,
          description: p.description || `${p.name} chất lượng cao, thiết kế trẻ trung, hiện đại.`,
          createdAt: new Date().toISOString()
        })),
        orders: [],
        reviews: {}
      };

      this.writeAtomic(initialData);
    }
  }

  read() {
    try {
      const content = fs.readFileSync(this.dbFile, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      console.error('Error reading database file:', error);
      return {
        users: [],
        loginHistory: [],
        products: [],
        orders: [],
        reviews: {}
      };
    }
  }

  writeAtomic(data) {
    const tempFile = `${this.dbFile}.${Date.now()}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempFile, this.dbFile);
  }

  // --- Users ---
  getUsers() {
    const data = this.read();
    return data.users || [];
  }

  findUserByUsername(username) {
    const users = this.getUsers();
    return users.find((u) => u.username.toLowerCase() === username.toLowerCase());
  }

  findUserById(id) {
    const users = this.getUsers();
    return users.find((u) => u.id === id);
  }

  createUser(userData) {
    const data = this.read();
    const newUser = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      ...userData,
      role: userData.role || 'user',
      createdAt: new Date().toISOString()
    };
    data.users.push(newUser);
    this.writeAtomic(data);
    return newUser;
  }

  // --- Login History ---
  getLoginHistory() {
    const data = this.read();
    return data.loginHistory || [];
  }

  addLoginHistory(record) {
    const data = this.read();
    data.loginHistory = data.loginHistory || [];
    // remove older login of same username to keep latest on top
    const filtered = data.loginHistory.filter((item) => item.username !== record.username);
    data.loginHistory = [
      {
        ...record,
        lastLogin: new Date().toISOString()
      },
      ...filtered
    ];
    this.writeAtomic(data);
  }

  // --- Products ---
  getProducts(filters = {}) {
    const data = this.read();
    let items = data.products || [];

    if (filters.category) {
      items = items.filter(
        (p) => p.category.toLowerCase() === filters.category.toLowerCase()
      );
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      items = items.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      );
    }

    return items;
  }

  getProductById(id) {
    const data = this.read();
    const numericId = Number(id);
    const product = (data.products || []).find((p) => p.id === numericId || p.id === id);
    if (!product) return null;

    const reviews = (data.reviews && data.reviews[product.id]) || [];
    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    return {
      ...product,
      reviews,
      averageRating: Number(averageRating.toFixed(1))
    };
  }

  createProduct(productData) {
    const data = this.read();
    const newId =
      data.products.length > 0
        ? Math.max(...data.products.map((p) => (typeof p.id === 'number' ? p.id : 0))) + 1
        : 1;

    const newProduct = {
      id: newId,
      name: productData.name,
      category: productData.category,
      price: Number(productData.price) || 0,
      image: productData.image || '/images/default.jpg',
      description: productData.description || `${productData.name} thời trang cao cấp.`,
      createdAt: new Date().toISOString()
    };

    data.products.push(newProduct);
    this.writeAtomic(data);
    return newProduct;
  }

  updateProduct(id, updates) {
    const data = this.read();
    const numericId = Number(id);
    const index = data.products.findIndex((p) => p.id === numericId || p.id === id);
    if (index === -1) return null;

    data.products[index] = {
      ...data.products[index],
      ...updates,
      id: data.products[index].id, // preserve id
      price: updates.price !== undefined ? Number(updates.price) : data.products[index].price,
      updatedAt: new Date().toISOString()
    };

    this.writeAtomic(data);
    return data.products[index];
  }

  deleteProduct(id) {
    const data = this.read();
    const numericId = Number(id);
    const initialLength = data.products.length;
    data.products = data.products.filter((p) => p.id !== numericId && p.id !== id);

    if (data.products.length === initialLength) return false;

    this.writeAtomic(data);
    return true;
  }

  // --- Orders ---
  getOrders() {
    const data = this.read();
    return data.orders || [];
  }

  getOrdersByUser(username) {
    const orders = this.getOrders();
    return orders.filter(
      (o) => o.customer && o.customer.toLowerCase() === username.toLowerCase()
    );
  }

  createOrder(orderData) {
    const data = this.read();
    const newOrder = {
      id: orderData.id || `ORD${Date.now()}`,
      customer: orderData.customer || 'Khách hàng',
      items: orderData.items || [],
      total: Number(orderData.total) || 0,
      delivery: orderData.delivery || {},
      paymentMethod: orderData.paymentMethod || 'Thanh toán khi nhận hàng',
      status: 'Đang xử lý',
      date: orderData.date || new Date().toLocaleString('vi-VN'),
      createdAt: new Date().toISOString()
    };

    data.orders = [newOrder, ...(data.orders || [])];
    this.writeAtomic(data);
    return newOrder;
  }

  updateOrderStatus(orderId, status) {
    const data = this.read();
    const order = data.orders.find((o) => String(o.id) === String(orderId));
    if (!order) return null;

    order.status = status;
    order.updatedAt = new Date().toISOString();
    this.writeAtomic(data);
    return order;
  }

  // --- Reviews ---
  getReviews(productId) {
    const data = this.read();
    return (data.reviews && data.reviews[productId]) || [];
  }

  addReview(productId, reviewData) {
    const data = this.read();
    data.reviews = data.reviews || {};
    data.reviews[productId] = data.reviews[productId] || [];

    const newReview = {
      id: Date.now(),
      username: reviewData.username || 'Khách hàng',
      rating: Number(reviewData.rating) || 5,
      text: reviewData.text || '',
      date: new Date().toLocaleDateString('vi-VN'),
      createdAt: new Date().toISOString()
    };

    data.reviews[productId] = [newReview, ...data.reviews[productId]];
    this.writeAtomic(data);
    return newReview;
  }

  // --- Stats for Admin ---
  getStats() {
    const data = this.read();
    const productsCount = (data.products || []).length;
    const orders = data.orders || [];
    const usersCount = (data.users || []).length;

    const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

    const todayStr = new Date().toLocaleDateString('vi-VN');
    const ordersToday = orders.filter((o) => {
      if (!o.createdAt) return false;
      return new Date(o.createdAt).toLocaleDateString('vi-VN') === todayStr;
    }).length;

    return {
      totalProducts: productsCount,
      totalOrders: orders.length,
      totalUsers: usersCount,
      totalRevenue,
      ordersToday
    };
  }
}

module.exports = new Database();
