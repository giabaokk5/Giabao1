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
  const [chartPeriod, setChartPeriod] = useState('7days'); // '7days' | '30days'
  const [hoveredBar, setHoveredBar] = useState(null);

  // Biên lợi nhuận trung bình (35%)
  const PROFIT_MARGIN = 0.35;

  useEffect(() => {
    document.title = 'HTCD Shop - Quản trị doanh thu & lợi nhuận';

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

      // Local fallback nếu API chưa có hoặc rỗng
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

      // Lọc đơn hàng của ngày này
      const dayOrders = orders.filter((o) => {
        if (!o.createdAt && !o.date) return false;
        const oDate = o.createdAt ? o.createdAt.slice(0, 10) : '';
        return oDate === isoDateStr;
      });

      const dayRevenue = dayOrders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);
      const dayProfit = Math.round(dayRevenue * PROFIT_MARGIN);

      // Nếu đơn thực tế rỗng (mới cài đặt), tạo số liệu mẫu minh họa sinh động
      let displayRevenue = dayRevenue;
      let displayProfit = dayProfit;
      let displayOrdersCount = dayOrders.length;

      if (orders.length === 0) {
        // Mock data nếu chưa có đơn hàng nào
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

  // Tìm giá trị max để scale chiều cao cột
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
      // Mock preview
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
    <>
      <main className="admin-shell">
        {/* Sidebar */}
        <AdminSidebar active="overview" />

        {/* Main Content */}
        <section className="admin-content">
          <header className="admin-page-header">
            <div>
              <span className="admin-eyebrow">BÁO CÁO TÀI CHÍNH & VẬN HÀNH</span>
              <h1>Bảng điều khiển kinh doanh</h1>
              <p>Theo dõi chỉ số bán hàng, dòng tiền doanh thu và lợi nhuận thực tế.</p>
            </div>
            <div className="admin-header-actions">
              <span className="admin-status"><i /> Dữ liệu trực tiếp</span>
            </div>
          </header>

          {/* KPI Cards Grid - 4 Thẻ chỉ số */}
          <div className="admin-stat-grid admin-kpi-grid">
            {/* Doanh thu */}
            <div className="admin-stat-card card-revenue">
              <div className="stat-card-header">
                <span className="admin-stat-label">TỔNG DOANH THU</span>
                <span className="stat-badge revenue-badge">Doanh số</span>
              </div>
              <strong className="stat-value">${stats.totalRevenue.toLocaleString()}</strong>
              <div className="stat-footer">
                <span className="stat-sub positive">↑ +18.4%</span>
                <small>so với tháng trước</small>
              </div>
            </div>

            {/* Lợi nhuận ước tính */}
            <div className="admin-stat-card card-profit">
              <div className="stat-card-header">
                <span className="admin-stat-label">LỢI NHUẬN RÒNG (EST.)</span>
                <span className="stat-badge profit-badge">~35% Margin</span>
              </div>
              <strong className="stat-value text-profit">${totalProfit.toLocaleString()}</strong>
              <div className="stat-footer">
                <span className="stat-sub positive">↑ +14.2%</span>
                <small>Biên lợi nhuận gộp vững</small>
              </div>
            </div>

            {/* Đơn hàng */}
            <div className="admin-stat-card card-orders">
              <div className="stat-card-header">
                <span className="admin-stat-label">TỔNG ĐƠN HÀNG</span>
                <span className="stat-badge orders-badge">{stats.ordersToday} hôm nay</span>
              </div>
              <strong className="stat-value">{stats.totalOrders}</strong>
              <div className="stat-footer">
                <small>Giá trị TB/đơn (AOV): <b>${averageOrderValue.toLocaleString()}</b></small>
              </div>
            </div>

            {/* Sản phẩm & Khách hàng */}
            <div className="admin-stat-card card-customers">
              <div className="stat-card-header">
                <span className="admin-stat-label">KHÁCH & SẢN PHẨM</span>
                <span className="stat-badge default-badge">{stats.totalProducts} SP</span>
              </div>
              <strong className="stat-value">{stats.totalUsers} <span className="stat-unit">thành viên</span></strong>
              <div className="stat-footer">
                <small>Đang hoạt động trên hệ thống</small>
              </div>
            </div>
          </div>

          {/* KHỐI BIỂU ĐỒ BÁN HÀNG & DOANH THU - LỢI NHUẬN */}
          <div id="revenue-chart" className="admin-chart-section">
            <div className="chart-card">
              <div className="chart-header">
                <div>
                  <span className="admin-eyebrow">BIỂU ĐỒ BÁN HÀNG</span>
                  <h2>Doanh thu & Lợi nhuận theo thời gian</h2>
                </div>
                <div className="chart-controls">
                  <div className="chart-legend">
                    <span className="legend-item"><i className="legend-box revenue" /> Doanh thu ($)</span>
                    <span className="legend-item"><i className="legend-box profit" /> Lợi nhuận ($)</span>
                  </div>
                  <div className="period-tabs">
                    <button
                      className={`period-btn ${chartPeriod === '7days' ? 'active' : ''}`}
                      onClick={() => setChartPeriod('7days')}
                    >
                      7 ngày qua
                    </button>
                    <button
                      className={`period-btn ${chartPeriod === '30days' ? 'active' : ''}`}
                      onClick={() => setChartPeriod('30days')}
                    >
                      14 ngày qua
                    </button>
                  </div>
                </div>
              </div>

              {/* Tooltip khi rê chuột */}
              {hoveredBar && (
                <div className="chart-tooltip-floating">
                  <strong>Ngày {hoveredBar.label}</strong>: Doanh thu <b>${hoveredBar.revenue.toLocaleString()}</b> | Lợi nhuận <b>${hoveredBar.profit.toLocaleString()}</b> ({hoveredBar.ordersCount} đơn)
                </div>
              )}

              {/* Vẽ biểu đồ Bar Chart dạng SVG Responsive */}
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
                            {/* Cột Doanh thu */}
                            <div
                              className="bar-fill revenue-bar"
                              style={{ height: `${revHeight}%` }}
                            >
                              <span className="bar-popup">${item.revenue}</span>
                            </div>
                            {/* Cột Lợi nhuận */}
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

            {/* Cột Phân bổ thanh toán & Tỷ suất sinh lời */}
            <div className="chart-side-card">
              <div className="side-card-header">
                <span className="admin-eyebrow">DÒNG TIỀN THANH TOÁN</span>
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
                  <span>HIỆU SUẤT LỢI NHUẬN</span>
                  <strong>35.0%</strong>
                </div>
                <p>Mỗi 100$ doanh thu tạo ra khoảng 35$ lợi nhuận ròng sau chi phí hàng bán.</p>
              </div>
            </div>
          </div>

          {/* QUẢN LÝ NHANH CÁC KHU VỰC VẬN HÀNH */}
          <div className="admin-section-heading">
            <div>
              <span className="admin-eyebrow">QUẢN LÝ NHANH</span>
              <h2>Các khu vực vận hành</h2>
            </div>
            <span className="admin-date">Cập nhật hôm nay</span>
          </div>

          <div className="admin-module-grid">
            <Link to="/admin/products" className="admin-module-card">
              <span className="admin-module-icon">▦</span>
              <span className="admin-module-copy">
                <strong>Quản lý sản phẩm</strong>
                <small>Thêm, sửa và xóa sản phẩm trong cửa hàng.</small>
              </span>
              <span className="admin-module-arrow">→</span>
            </Link>
            <Link to="/admin/orders" className="admin-module-card">
              <span className="admin-module-icon">◷</span>
              <span className="admin-module-copy">
                <strong>Đơn hàng đã đặt</strong>
                <small>Xem khách hàng, sản phẩm và phương thức thanh toán.</small>
              </span>
              <span className="admin-module-arrow">→</span>
            </Link>
            <Link to="/admin/users" className="admin-module-card">
              <span className="admin-module-icon">♙</span>
              <span className="admin-module-copy">
                <strong>Quản lý người dùng</strong>
                <small>Kiểm soát tài khoản và quyền truy cập.</small>
              </span>
              <span className="admin-module-arrow">→</span>
            </Link>
          </div>

          <div className="admin-note">
            <span>✦</span>
            <div>
              <strong>Chiến lược tài chính</strong>
              <p>Theo dõi biên lợi nhuận ròng định kỳ để tối ưu giá nhập và các chương trình khuyến mãi bán hàng.</p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

export default Admin;
