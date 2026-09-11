import React, { useState } from 'react';
import '../assets/style/admin.css';

function Admin({ products, setProducts }) {
    const [formState, setFormState] = useState({ id: '', name: '', price: '', category: '', image: '' });
    const [isEditing, setIsEditing] = useState(false);

    const handleChange = (e) => {
        setFormState({ ...formState, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isEditing) {
            // Update sản phẩm
            setProducts(products.map((p) => (p.id === formState.id ? formState : p)));
        } else {
            // Thêm sản phẩm mới
            setProducts([...products, { ...formState, id: Date.now().toString() }]);
        }
        setFormState({ id: '', name: '', price: '', category: '', image: '' });
        setIsEditing(false);
    };

    const handleEdit = (product) => {
        setFormState(product);
        setIsEditing(true);
    };

    const handleDelete = (id) => {
        setProducts(products.filter((product) => product.id !== id));
    };

    return (
        <div className="admin-container">
            <h1>Quản lý sản phẩm</h1>
            <form onSubmit={handleSubmit} className="product-form">
                <input
                    type="text"
                    name="name"
                    placeholder="Tên sản phẩm"
                    value={formState.name}
                    onChange={handleChange}
                    required
                />
                <input
                    type="number"
                    name="price"
                    placeholder="Giá sản phẩm"
                    value={formState.price}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="category"
                    placeholder="Danh mục"
                    value={formState.category}
                    onChange={handleChange}
                    required
                />
                <input
                    type="text"
                    name="image"
                    placeholder="URL hình ảnh"
                    value={formState.image}
                    onChange={handleChange}
                    required
                />
                <button type="submit">{isEditing ? 'Cập nhật' : 'Thêm mới'}</button>
            </form>
            <div className="product-list">
                {products.map((product) => (
                    <div key={product.id} className="product-card">
                        <img src={product.image} alt={product.name} />
                        <h3>{product.name}</h3>
                        <p>Giá: ${product.price}</p>
                        <p>Danh mục: {product.category}</p>
                        <button onClick={() => handleEdit(product)}>Sửa</button>
                        <button onClick={() => handleDelete(product.id)}>Xóa</button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Admin;