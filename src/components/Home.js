import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import products from './products'; // Import danh sách sản phẩm
const banners = [
    { id: 1, image: 'https://i.imgur.com/lvjwNR2.png' },
    { id: 2, image: 'https://i.imgur.com/WgIBDhE.png' },
];
const categories = [
    { name: 'Áo khoác', path: '/jackets', description: 'Ấm áp và cá tính' },
    { name: 'Áo thun', path: '/tshirts', description: 'Thoải mái mỗi ngày' },
    { name: 'Quần', path: '/pants', description: 'Phom dáng hiện đại' },
    { name: 'Giày', path: '/shoes', description: 'Bước đi nổi bật' },
    { name: 'Mũ', path: '/hats', description: 'Hoàn thiện outfit' },
];

function Home() {
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const productsPerPage = 15;

    // Lọc sản phẩm theo từ khóa tìm kiếm
    const filteredProducts = products.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalProducts = filteredProducts.length;
    const totalPages = Math.max(1, Math.ceil(totalProducts / productsPerPage));
    const startIndex = (currentPage - 1) * productsPerPage;
    const currentProducts = filteredProducts.slice(startIndex, startIndex + productsPerPage);

    // Chuyển trang
    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    return (
        <div className="home-container">
            <div id="bannerCarousel" className="carousel slide mb-4" data-bs-ride="carousel" data-bs-interval="3000">
                <div className="carousel-inner">
                    {banners.map((banner, index) => (
                        <div className={`carousel-item ${index === 0 ? 'active' : ''}`} key={banner.id}>
                            <img src={banner.image} className="d-block w-100" alt={`Banner ${banner.id}`} />
                        </div>
                    ))}
                </div>
                <button
                    className="carousel-control-prev"
                    type="button"
                    data-bs-target="#bannerCarousel"
                    data-bs-slide="prev"
                >
                    <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                    <span className="visually-hidden">Previous</span>
                </button>
                <button
                    className="carousel-control-next"
                    type="button"
                    data-bs-target="#bannerCarousel"
                    data-bs-slide="next"
                >
                    <span className="carousel-control-next-icon" aria-hidden="true"></span>
                    <span className="visually-hidden">Next</span>
                </button>
            </div>

            <section className="home-intro">
                <div>
                    <span className="section-eyebrow">BỘ SƯU TẬP MỚI 2026</span>
                    <h1>Chào mừng đến với HTCD Shop</h1>
                    <p>Những món đồ dễ mặc, dễ phối và được chọn để đồng hành cùng phong cách riêng của bạn.</p>
                </div>
                <Link to="/jackets" className="hero-button">Khám phá ngay</Link>
            </section>

            <section className="category-section">
                <div className="section-heading">
                    <div>
                        <span className="section-eyebrow">KHÁM PHÁ THEO PHONG CÁCH</span>
                        <h2>Danh mục nổi bật</h2>
                    </div>
                    <span className="section-count">{categories.length} danh mục</span>
                </div>
                <div className="category-menu">
                    {categories.map((category, index) => (
                        <Link key={category.name} to={category.path} className="category-button">
                            <span className="category-number">0{index + 1}</span>
                            <span>
                                <strong>{category.name}</strong>
                                <small>{category.description}</small>
                            </span>
                            <span className="category-arrow">↗</span>
                        </Link>
                    ))}
                </div>
            </section>

            <section className="product-section">
                <div className="section-heading product-heading">
                    <div>
                        <span className="section-eyebrow">LỰA CHỌN DÀNH CHO BẠN</span>
                        <h2>Tất cả sản phẩm</h2>
                    </div>
                    <span className="section-count">{totalProducts} sản phẩm</span>
                </div>
                <div className="search-bar home-search">
                    <input
                        type="text"
                        placeholder="Tìm kiếm sản phẩm..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>
            <div className="product-list">
                {currentProducts.length > 0 ? (
                    currentProducts.map((product) => (
                        <div key={product.id} className="product-card">
                            <Link to={`/product/${product.id}`}>
                                <img src={product.image} alt={product.name} />
                                <h3>{product.name}</h3>
                                <p>Giá: ${product.price}</p>
                            </Link>
                            <Link to={`/product/${product.id}`} className="button mt-2">
                                Xem Ngay
                            </Link>
                        </div>
                    ))
                ) : (
                    <p>Không tìm thấy sản phẩm nào.</p>
                )}
            </div>

            <div className="pagination">
                <button onClick={handlePrevPage} disabled={currentPage === 1}>
                    Previous
                </button>
                <span>
                    Trang {currentPage} / {totalPages}
                </span>
                <button onClick={handleNextPage} disabled={currentPage === totalPages}>
                    Next
                </button>
            </div>
            </section>
        </div>
    );
}

export default Home;

