import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import staticProducts from './products';
import api from '../services/api';

function CategoryPage({ categoryName }) {
    const [productsList, setProductsList] = useState(
        staticProducts.filter((product) => product.category === categoryName)
    );

    useEffect(() => {
        const fetchCategoryProducts = async () => {
            try {
                const data = await api.products.getAll({ category: categoryName });
                if (Array.isArray(data) && data.length > 0) {
                    setProductsList(data);
                    return;
                }
            } catch (err) {
                console.warn('API error fetching category products, using local fallback:', err.message);
            }
            setProductsList(
                staticProducts.filter((product) => product.category === categoryName)
            );
        };

        fetchCategoryProducts();
    }, [categoryName]);

    return (
        <div className="category-page">
            <h1>{categoryName}</h1>
            <div className="product-list">
                {productsList.length > 0 ? (
                    productsList.map((product) => (
                        <div key={product.id} className="product-card">
                            <Link to={`/product/${product.id}`}>
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    onError={(e) => { e.target.src = '/images/default.jpg'; }}
                                />
                                <h3>{product.name}</h3>
                                <p>Giá: ${product.price}</p>
                            </Link>
                        </div>
                    ))
                ) : (
                    <p>Không có sản phẩm nào trong danh mục này.</p>
                )}
            </div>
        </div>
    );
}

export default CategoryPage;
