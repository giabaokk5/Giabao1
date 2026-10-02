const API_BASE = process.env.REACT_APP_API_URL || '/api';

function getAuthHeader() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {})
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || `Lỗi yêu cầu: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error.message);
    throw error;
  }
}

export const api = {
  // Authentication
  auth: {
    login: (credentials) =>
      request('/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      }),
    register: (userData) =>
      request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData)
      }),
    getMe: () => request('/auth/me')
  },

  // Products
  products: {
    getAll: (params = {}) => {
      const query = new URLSearchParams();
      if (params.category) query.append('category', params.category);
      if (params.search) query.append('search', params.search);
      if (params.page) query.append('page', params.page);
      if (params.limit) query.append('limit', params.limit);
      const qs = query.toString();
      return request(`/products${qs ? `?${qs}` : ''}`);
    },
    getById: (id) => request(`/products/${id}`),
    create: (productData) =>
      request('/products', {
        method: 'POST',
        body: JSON.stringify(productData)
      }),
    update: (id, productData) =>
      request(`/products/${id}`, {
        method: 'PUT',
        body: JSON.stringify(productData)
      }),
    delete: (id) =>
      request(`/products/${id}`, {
        method: 'DELETE'
      })
  },

  // Orders
  orders: {
    create: (orderData) =>
      request('/orders', {
        method: 'POST',
        body: JSON.stringify(orderData)
      }),
    getMyOrders: (username) => {
      const qs = username ? `?username=${encodeURIComponent(username)}` : '';
      return request(`/orders/my-orders${qs}`);
    },
    getAll: () => request('/orders'),
    updateStatus: (id, status) =>
      request(`/orders/${id}/status`, {
        method: 'PUT',
        body: JSON.stringify({ status })
      })
  },

  // Reviews
  reviews: {
    getByProduct: (productId) => request(`/reviews/${productId}`),
    add: (productId, reviewData) =>
      request(`/reviews/${productId}`, {
        method: 'POST',
        body: JSON.stringify(reviewData)
      })
  },

  // Admin
  admin: {
    getStats: () => request('/admin/stats'),
    getUsers: () => request('/admin/users')
  },

  // Health
  health: () => request('/health')
};

export default api;
