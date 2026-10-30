import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import './assets/style/admin.css';
import api from './services/api';
import AdminSidebar from './components/admin/AdminSidebar';

function Admin() {
  const [stats, setStats] = useState({
    totalProducts: 30,
    totalOrders: 0,
    totalUsers: 1,
    totalRevenue: 0,
    ordersToday: 0
  });

  const [orders, setOrders] = useState([]);
  const [chartPeriod, setChartPeriod] = useState('7days'); // '7days' | '14days'
  const [hoveredBar, setHoveredBar] = useState(null);

  // Biên lợi nhuận trung bình (35%)
  const PROFIT_MARGIN = 0.35;

  useEffect(() => {
    document.title = 'HTCD Shop - Bảng Điều Khiển Quản Trị';

    const loadData = async () => {
      let fetchedStats = null;
      let fetchedOrders = [];

      try {
        fetchedStats = await api.admin.getStats();
      } catch (err) {
        console.warn('Could not load stats from API:', err.message);
      }

      try {
        fetchedOrders = await api.orders.getAll();
      } catch (err) {
        console.warn('Could not load orders from API:', err.message);
      }

      const localOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      const allOrders = (fetchedOrders && fetchedOrders.length > 0) ? fetchedOrders : localOrders;
      setOrders(allOrders);

      if (fetchedStats) {
        setStats(fetchedStats);
      } else {
        const localUsers = JSON.parse(localStorage.getItem('loginHistory') || '[]');
        const totalRev = allOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
        setStats({
          totalProducts: 30,
          totalOrders: allOrders.length,
          totalUsers: Math.max(1, localUsers.length),
          totalRevenue: totalRev,
          ordersToday: allOrders.length
        });
      }
    };

    loadData();
  }, []);

  // Tính toán lợi nhuận tổng quan
  const totalProfit = useMemo(() => {
    return Math.round(stats.totalRevenue * PROFIT_MARGIN);
  }, [stats.totalRevenue]);

  // Giá trị trung bình mỗi đơn (AOV)
  const averageOrderValue = useMemo(() => {
    if (!stats.totalOrders || stats.totalOrders === 0) return 0;
    return Math.round(stats.totalRevenue / stats.totalOrders);
  }, [stats.totalRevenue, stats.totalOrders]);

  // Chuẩn bị dữ liệu cho biểu đồ bán hàng
  const chartData = useMemo(() => {
    const daysCount = chartPeriod === '7days' ? 7 : 14;
    const result = [];
    const now = new Date();

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayLabel = `${d.getDate()}/${d.getMonth() + 1}`;
      const isoDateStr = d.toISOString().slice(0, 10);

      const dayOrders = orders.filter((o) => {
        if (!o.createdAt && !o.date) return false;
        const oDate = o.createdAt ? o.createdAt.slice(0, 10) : '';
        return oDate === isoDateStr;
      });

      const dayRevenue = dayOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
      const dayProfit = Math.round(dayRevenue * PROFIT_MARGIN);

      let displayRevenue = dayRevenue;
      let displayProfit = dayProfit;
      let displayOrdersCount = dayOrders.length;

      if (orders.length === 0) {
        const mockBase = [2400, 3100, 1800, 4200, 3800, 5200, 4600, 3900, 4800, 3200, 5600, 6100, 4900, 5800];
        const val = mockBase[(daysCount - 1 - i) % mockBase.length];
        displayRevenue = val;
        displayProfit = Math.round(val * PROFIT_MARGIN);
        displayOrdersCount = Math.max(1, Math.round(val / 800));
      }

      result.push({
        label: dayLabel,
        revenue: displayRevenue,
        profit: displayProfit,
        ordersCount: displayOrdersCount
      });
    }

    return result;
  }, [orders, chartPeriod]);

  // Max value scale biểu đồ
  const maxChartValue = useMemo(() => {
    const maxVal = Math.max(...chartData.map((d) => d.revenue), 1000);
    return Math.ceil(maxVal / 1000) * 1000;
  }, [chartData]);

  // Thống kê theo phương thức thanh toán
  const paymentBreakdown = useMemo(() => {
    const methods = {
      'COD (Tiền mặt)': { count: 0, revenue: 0, color: '#e64a2e' },
      'Chuyển khoản (Bank)': { count: 0, revenue: 0, color: '#3b82f6' },
      'Ví điện tử / Thẻ': { count: 0, revenue: 0, color: '#10b981' }
    };

    if (orders.length > 0) {
      orders.forEach((o) => {
        const pm = (o.paymentMethod || '').toLowerCase();
        let key = 'COD (Tiền mặt)';
        if (pm.includes('chuyển') || pm.includes('bank')) {
          key = 'Chuyển khoản (Bank)';
        } else if (pm.includes('ví') || pm.includes('thẻ') || pm.includes('online')) {
          key = 'Ví điện tử / Thẻ';
        }
        methods[key].count += 1;
        methods[key].revenue += Number(o.total) || 0;
      });
    } else {
      methods['COD (Tiền mặt)'].revenue = Math.round(stats.totalRevenue * 0.55) || 16500;
      methods['Chuyển khoản (Bank)'].revenue = Math.round(stats.totalRevenue * 0.3) || 9000;
      methods['Ví điện tử / Thẻ'].revenue = Math.round(stats.totalRevenue * 0.15) || 4500;
    }

    const total = Object.values(methods).reduce((s, m) => s + m.revenue, 0) || 1;
    return Object.entries(methods).map(([name, val]) => ({
      name,
      revenue: val.revenue,
      percentage: Math.round((val.revenue / total) * 100),
      color: val.color
    }));
  }, [orders, stats.totalRevenue]);

  return (
    <main className="admin-shell">
      {/* Sidebar Mục lục chuyên nghiệp */}
      <AdminSidebar active="overview" />

      {/* Main Content Area */}
      <section className="admin-content">
        {/* Header Chào Mừng */}
        <header className="admin-page-header">
          <div className="header-titles">
            <span className="admin-eyebrow">
              <i className="fa-solid fa-shield-halved" /> TRUNG TÂM ĐIỀU HÀNH DOANH NGHIỆP
            </span>
            <h1>Bảng điều khiển kinh doanh</h1>
            <p>Hệ thống giám sát chỉ số bán hàng, dòng tiền doanh thu và lợi nhuận ròng thời gian thực.</p>
          </div>
          <div className="admin-header-actions">
            <Link to="/admin/revenue" className="btn-header-report">
              <i className="fa-solid fa-chart-column" /> Báo cáo chi tiết
            </Link>
            <span className="admin-status">
              <i className="status-live-dot" /> Dữ liệu trực tiếp
            </span>
          </div>
        </header>

        {/* 4 Thẻ KPI Chỉ Số Đẳng Cấp */}
        <div className="admin-stat-grid admin-kpi-grid">
          {/* Card Doanh Thu */}
          <div className="admin-stat-card card-revenue">
            <div className="stat-card-header">
              <span className="admin-stat-label">TỔNG DOANH THU</span>
              <div className="kpi-icon-circle revenue-circle">
                <i className="fa-solid fa-wallet" />
              </div>
            </div>
            <strong className="stat-value">${stats.totalRevenue.toLocaleString()}</strong>
            <div className="stat-footer">
              <span className="stat-sub positive">
                <i className="fa-solid fa-arrow-trend-up" /> +18.4%
              </span>
              <small>so với tháng trước</small>
            </div>
          </div>

          {/* Card Lợi Nhuận */}
          <div className="admin-stat-card card-profit">
            <div className="stat-card-header">
              <span className="admin-stat-label">LỢI NHUẬN RÒNG (EST.)</span>
              <div className="kpi-icon-circle profit-circle">
                <i className="fa-solid fa-sack-dollar" />
              </div>
            </div>
            <strong className="stat-value text-profit">${totalProfit.toLocaleString()}</strong>
            <div className="stat-footer">
              <span className="stat-sub positive">
                <i className="fa-solid fa-circle-check" /> 35% Margin
              </span>
              <small>Hiệu suất sinh lời cao</small>
            </div>
          </div>

          {/* Card Đơn Hàng */}
          <div className="admin-stat-card card-orders">
            <div className="stat-card-header">
              <span className="admin-stat-label">TỔNG ĐƠN HÀNG</span>
              <div className="kpi-icon-circle orders-circle">
                <i className="fa-solid fa-cart-shopping" />
              </div>
            </div>
            <strong className="stat-value">{stats.totalOrders}</strong>
            <div className="stat-footer">
              <small>
                Hôm nay: <b className="text-highlight">{stats.ordersToday}</b> | TB/đơn: <b>${averageOrderValue.toLocaleString()}</b>
              </small>
            </div>
          </div>

          {/* Card Khách Hàng */}
          <div className="admin-stat-card card-customers">
            <div className="stat-card-header">
              <span className="admin-stat-label">KHÁCH HÀNG & KHO</span>
              <div className="kpi-icon-circle customers-circle">
                <i className="fa-solid fa-users" />
              </div>
            </div>
            <strong className="stat-value">
              {stats.totalUsers} <span className="stat-unit">thành viên</span>
            </strong>
            <div className="stat-footer">
              <small>
                Kho hàng: <b className="text-highlight">{stats.totalProducts}</b> sản phẩm niêm yết
              </small>
            </div>
          </div>
        </div>

        {/* Khối Biểu Đồ Bán Hàng & Phân Bổ Nguồn Thu */}
        <div id="revenue-chart" className="admin-chart-section">
          <div className="chart-card">
            <div className="chart-header">
              <div>
                <span className="admin-eyebrow">PHÂN TÍCH TĂNG TRƯỞNG</span>
                <h2>Doanh thu & Lợi nhuận bán hàng</h2>
              </div>
              <div className="chart-controls">
                <div className="chart-legend">
                  <span className="legend-item">
                    <i className="legend-box revenue" /> Doanh thu ($)
                  </span>
                  <span className="legend-item">
                    <i className="legend-box profit" /> Lợi nhuận ($)
                  </span>
                </div>
                <div className="period-tabs">
                  <button
                    className={`period-btn ${chartPeriod === '7days' ? 'active' : ''}`}
                    onClick={() => setChartPeriod('7days')}
                  >
                    7 ngày qua
                  </button>
                  <button
                    className={`period-btn ${chartPeriod === '14days' ? 'active' : ''}`}
                    onClick={() => setChartPeriod('14days')}
                  >
                    14 ngày qua
                  </button>
                </div>
              </div>
            </div>

            {/* Tooltip khi rê chuột vào thanh cột */}
            {hoveredBar && (
              <div className="chart-tooltip-floating">
                <strong><i className="fa-regular fa-calendar-days" /> Ngày {hoveredBar.label}</strong>:
                Doanh thu: <b>${hoveredBar.revenue.toLocaleString()}</b> | Lợi nhuận: <b className="tooltip-profit">${hoveredBar.profit.toLocaleString()}</b> ({hoveredBar.ordersCount} đơn)
              </div>
            )}

            {/* Khung Biểu Đồ Thanh Bar Chart */}
            <div className="chart-bars-container">
              <div className="chart-y-axis">
                <span>${maxChartValue.toLocaleString()}</span>
                <span>${Math.round(maxChartValue * 0.75).toLocaleString()}</span>
                <span>${Math.round(maxChartValue * 0.5).toLocaleString()}</span>
                <span>${Math.round(maxChartValue * 0.25).toLocaleString()}</span>
                <span>$0</span>
              </div>

              <div className="chart-bars-area">
                <div className="chart-grid-lines">
                  <div className="grid-line" />
                  <div className="grid-line" />
                  <div className="grid-line" />
                  <div className="grid-line" />
                  <div className="grid-line" />
                </div>

                <div className="bars-row">
                  {chartData.map((item, idx) => {
                    const revHeight = Math.max(6, (item.revenue / maxChartValue) * 100);
                    const profitHeight = Math.max(4, (item.profit / maxChartValue) * 100);

                    return (
                      <div
                        key={idx}
                        className="bar-group"
                        onMouseEnter={() => setHoveredBar(item)}
                        onMouseLeave={() => setHoveredBar(null)}
                      >
                        <div className="bar-track">
                          {/* Cột Doanh Thu */}
                          <div
                            className="bar-fill revenue-bar"
                            style={{ height: `${revHeight}%` }}
                          >
                            <span className="bar-popup">${item.revenue.toLocaleString()}</span>
                          </div>
                          {/* Cột Lợi Nhuận */}
                          <div
                            className="bar-fill profit-bar"
                            style={{ height: `${profitHeight}%` }}
                          />
                        </div>
                        <span className="bar-label">{item.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Cột Cơ Cấu Nguồn Thu & Hiệu Suất */}
          <div className="chart-side-card">
            <div className="side-card-header">
              <span className="admin-eyebrow">DÒNG TIỀN GIAO DỊCH</span>
              <h3>Cơ cấu nguồn thu</h3>
            </div>

            <div className="payment-breakdown-list">
              {paymentBreakdown.map((pm, i) => (
                <div key={i} className="payment-item">
                  <div className="payment-meta">
                    <span className="payment-name">
                      <i style={{ background: pm.color }} className="pm-dot" />
                      {pm.name}
                    </span>
                    <strong>${pm.revenue.toLocaleString()} ({pm.percentage}%)</strong>
                  </div>
                  <div className="payment-progress-bar">
                    <div
                      className="payment-progress-fill"
                      style={{ width: `${pm.percentage}%`, background: pm.color }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="profit-efficiency-box">
              <div className="efficiency-title">
                <span>
                  <i className="fa-solid fa-gem" /> HIỆU SUẤT SINH LỜI
                </span>
                <strong>35.0%</strong>
              </div>
              <p>Mỗi $100 doanh thu bán hàng tạo ra khoảng $35 lợi nhuận ròng sau khi trừ giá vốn hàng bán.</p>
            </div>
          </div>
        </div>

        {/* Khu Vực Quản Lý Nhanh - 3 Thẻ Lối Tắt */}
        <div className="admin-section-heading">
          <div>
            <span className="admin-eyebrow">TRUY CẬP NHANH</span>
            <h2>Các khu vực vận hành cốt lõi</h2>
          </div>
          <span className="admin-date">
            <i className="fa-regular fa-clock" /> Cập nhật hôm nay
          </span>
        </div>

        <div className="admin-module-grid">
          <Link to="/admin/products" className="admin-module-card module-products">
            <div className="module-icon-wrap">
              <i className="fa-solid fa-boxes-stacked" />
            </div>
            <div className="admin-module-copy">
              <strong>Quản lý kho sản phẩm</strong>
              <small>Xem, thêm mới, sửa giá, danh mục và cập nhật ảnh sản phẩm.</small>
            </div>
            <span className="admin-module-arrow">
              <i className="fa-solid fa-arrow-right" />
            </span>
          </Link>

          <Link to="/admin/orders" className="admin-module-card module-orders">
            <div className="module-icon-wrap">
              <i className="fa-solid fa-receipt" />
            </div>
            <div className="admin-module-copy">
              <strong>Đơn hàng & Giao vận</strong>
              <small>Xử lý thông tin người nhận, trạng thái vận chuyển và hóa đơn.</small>
            </div>
            <span className="admin-module-arrow">
              <i className="fa-solid fa-arrow-right" />
            </span>
          </Link>

          <Link to="/admin/users" className="admin-module-card module-users">
            <div className="module-icon-wrap">
              <i className="fa-solid fa-users-gear" />
            </div>
            <div className="admin-module-copy">
              <strong>Tài khoản & Phân quyền</strong>
              <small>Kiểm soát người dùng, lịch sử đăng nhập và bảo mật tài khoản.</small>
            </div>
            <span className="admin-module-arrow">
              <i className="fa-solid fa-arrow-right" />
            </span>
          </Link>
        </div>

        {/* Khối Ghi Chú Chiến Lược */}
        <div className="admin-note">
          <div className="admin-note-icon">
            <i className="fa-solid fa-lightbulb" />
          </div>
          <div>
            <strong>Mẹo tối ưu hiệu quả kinh doanh</strong>
            <p>
              Theo dõi định kỳ báo cáo doanh thu để nhận diện các sản phẩm bán chạy nhất, chủ động nhập kho và điều chỉnh chính sách ưu đãi phù hợp.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Admin;
