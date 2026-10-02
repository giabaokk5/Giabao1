import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import productsData from '../products';
import api from '../../services/api';

function ProductManagement() {
    const [products, setProducts] = useState(productsData);
    const [editingProduct, setEditingProduct] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        category: '',
        price: '',
        image: '',
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const productsPerPage = 8;

    // Load products from backend API
    const loadProducts = async () => {
        setIsLoading(true);
        try {
            const data = await api.products.getAll();
            if (Array.isArray(data) && data.length > 0) {
                setProducts(data);
            }
        } catch (err) {
            console.warn('Could not load products from API, using local fallback:', err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadProducts();
    }, []);

    const totalPages = Math.max(1, Math.ceil(products.length / productsPerPage));

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const currentProducts = products.slice(
        (currentPage - 1) * productsPerPage,
        currentPage * productsPerPage
    );

    // Hiển thị form để thêm/sửa sản phẩm
    const openForm = (product = null) => {
        if (product) {
            setFormData(product);
            setEditingProduct(product);
        } else {
            setFormData({ id: '', name: '', category: '', price: '', image: '' });
            setEditingProduct(null);
        }
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
    };

    // Lưu sản phẩm mới hoặc cập nhật sản phẩm
    const handleSaveProduct = async (e) => {
        e.preventDefault();
        try {
            if (editingProduct) {
                // Update product via API
                const res = await api.products.update(editingProduct.id, formData);
                const updatedProduct = res.product || { ...editingProduct, ...formData };
                setProducts((prev) =>
                    prev.map((p) => (p.id === editingProduct.id ? updatedProduct : p))
                );
                alert('Cập nhật sản phẩm thành công!');
            } else {
                // Create product via API
                const res = await api.products.create(formData);
                const newProduct = res.product || { ...formData, id: products.length + 1 };
                setProducts((prev) => [newProduct, ...prev]);
                alert('Thêm sản phẩm mới thành công!');
            }
        } catch (err) {
            console.warn('API error, saving locally:', err.message);
            if (editingProduct) {
                setProducts((prev) =>
                    prev.map((p) => (p.id === editingProduct.id ? { ...formData } : p))
                );
            } else {
                setProducts((prev) => [
                    { ...formData, id: prev.length + 1 },
                    ...prev
                ]);
            }
            alert('Đã lưu sản phẩm!');
        }
        closeForm();
    };

    // Xóa sản phẩm
    const handleDeleteProduct = async (id) => {
        if (!window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
            return;
        }

        try {
            await api.products.delete(id);
            setProducts((prev) => prev.filter((product) => product.id !== id));
            alert('Xóa sản phẩm thành công!');
        } catch (err) {
            console.warn('API error during delete, removing locally:', err.message);
            setProducts((prev) => prev.filter((product) => product.id !== id));
            alert('Đã xóa sản phẩm!');
        }
    };

    return (
        <main className="admin-shell product-admin-shell">
            {/* Sidebar */}
            <aside className="admin-sidebar">
                <div className="admin-brand">
                    <span className="admin-brand-mark">HT</span>
                    <span>
                        <strong>HTCD SHOP</strong>
                        <small>TRUNG TÂM QUẢN TRỊ</small>
                    </span>
                </div>
                <nav className="admin-nav">
                    <Link to="/admin" className="admin-nav-link">
                        <span>⌂</span> Tổng quan
                    </Link>
                    <Link to="/admin/orders" className="admin-nav-link">
                        <span>◷</span> Đơn hàng
                    </Link>
                    <Link to="/admin/products" className="admin-nav-link active">
                        <span>▦</span> Sản phẩm
                    </Link>
                    <Link to="/admin/users" className="admin-nav-link">
                        <span>♙</span> Người dùng
                    </Link>
                </nav>
                <Link to="/" className="admin-back-link">← Về cửa hàng</Link>
            </aside>

            {/* Main Content */}
            <section className="admin-content product-admin-content">
                <header className="admin-page-header product-page-header">
                    <div>
                        <span className="admin-eyebrow">KHO HÀNG</span>
                        <h1>Quản lý sản phẩm</h1>
                        <p>Quản lý danh mục và thông tin sản phẩm của cửa hàng.</p>
                    </div>
                    <button className="admin-primary-btn" onClick={() => openForm()}>
                        <span>+</span> Thêm sản phẩm
                    </button>
                </header>

                <div className="product-toolbar">
                    <div>
                        <strong>{products.length} sản phẩm</strong>
                        <span> trong kho hàng {isLoading ? '(Đang tải...)' : ''}</span>
                    </div>
                    <span>Hiển thị {currentProducts.length} sản phẩm / trang</span>
                </div>

                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Tên sản phẩm</th>
                                <th>Danh mục</th>
                                <th>Giá</th>
                                <th>Hình ảnh</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentProducts.map((product) => (
                                <tr key={product.id}>
                                    <td>{product.id}</td>
                                    <td>{product.name}</td>
                                    <td>{product.category}</td>
                                    <td>${product.price}</td>
                                    <td>
                                        <img
                                            src={product.image}
                                            alt={product.name}
                                            className="admin-product-thumb"
                                            onError={(e) => { e.target.src = '/images/default.jpg'; }}
                                        />
                                    </td>
                                    <td>
                                        <button
                                            className="admin-action-btn edit"
                                            onClick={() => openForm(product)}
                                        >
                                            Sửa
                                        </button>
                                        <button
                                            className="admin-action-btn delete"
                                            onClick={() => handleDeleteProduct(product.id)}
                                        >
                                            Xóa
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <nav className="admin-pagination">
                    <ul className="pagination">
                        <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button
                                className="page-link"
                                onClick={() => handlePageChange(currentPage - 1)}
                            >
                                Trước
                            </button>
                        </li>
                        {[...Array(totalPages).keys()].map((page) => (
                            <li
                                key={page + 1}
                                className={`page-item ${
                                    currentPage === page + 1 ? 'active' : ''
                                }`}
                            >
                                <button
                                    className="page-link"
                                    onClick={() => handlePageChange(page + 1)}
                                >
                                    {page + 1}
                                </button>
                            </li>
                        ))}
                        <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
                            <button
                                className="page-link"
                                onClick={() => handlePageChange(currentPage + 1)}
                            >
                                Sau
                            </button>
                        </li>
                    </ul>
                </nav>

                {/* Modal Form */}
                {showForm && (
                    <div className="admin-modal-backdrop" tabIndex="-1">
                        <div className="admin-modal">
                            <div className="admin-modal-header">
                                <h5 className="modal-title">
                                    {editingProduct ? 'Sửa sản phẩm' : 'Thêm sản phẩm'}
                                </h5>
                                <button
                                    type="button"
                                    className="admin-modal-close"
                                    aria-label="Close"
                                    onClick={closeForm}
                                ></button>
                            </div>
                            <form onSubmit={handleSaveProduct}>
                                <div className="admin-modal-body">
                                    <div className="mb-3">
                                        <label className="admin-form-label">Tên sản phẩm</label>
                                        <input
                                            type="text"
                                            className="admin-form-control"
                                            value={formData.name}
                                            onChange={(e) =>
                                                setFormData({ ...formData, name: e.target.value })
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="admin-form-label">Danh mục</label>
                                        <input
                                            type="text"
                                            className="admin-form-control"
                                            value={formData.category}
                                            onChange={(e) =>
                                                setFormData({
                                                    ...formData,
                                                    category: e.target.value,
                                                })
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="admin-form-label">Giá</label>
                                        <input
                                            type="number"
                                            className="admin-form-control"
                                            value={formData.price}
                                            onChange={(e) =>
                                                setFormData({ ...formData, price: e.target.value })
                                            }
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="admin-form-label">Hình ảnh</label>
                                        <input
                                            type="text"
                                            className="admin-form-control"
                                            value={formData.image}
                                            onChange={(e) =>
                                                setFormData({ ...formData, image: e.target.value })
                                            }
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="admin-modal-footer">
                                    <button
                                        type="button"
                                        className="admin-secondary-btn"
                                        onClick={closeForm}
                                    >
                                        Hủy
                                    </button>
                                    <button type="submit" className="admin-primary-btn">
                                        Lưu
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </section>
        </main>
    );
}

export default ProductManagement;
