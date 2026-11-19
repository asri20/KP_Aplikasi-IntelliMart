import React, { useCallback, useEffect, useState } from 'react';
import {
  getDashboardSummary,
  getDashboardSalesTrend,
  getDashboardTopProducts,
  getDashboardLowStock,
  getDashboardRecentTransactions,
  getDashboardProfit,
} from '../services/dashboardService';

import '../styles/Dashboard.css';

const STORE_ID = 1;

const formatRupiah = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatNumber = (value) =>
  new Intl.NumberFormat('id-ID').format(Number(value) || 0);

const formatDate = (value) => {
  if (!value) return '-';

  return new Date(value).toLocaleDateString('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

const formatDateTime = (value) => {
  if (!value) return '-';

  return new Date(value).toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const getDefaultDates = () => {
  const today = new Date();
  const from = new Date(today);
  from.setDate(today.getDate() - 29);

  const toLocalDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  };

  return {
    fromDate: toLocalDate(from),
    toDate: toLocalDate(today),
  };
};

const Dashboard = () => {
  const defaultDates = getDefaultDates();

  const [summary, setSummary] = useState({});
  const [salesTrend, setSalesTrend] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [profit, setProfit] = useState({});

  const [fromDate, setFromDate] = useState(defaultDates.fromDate);
  const [toDate, setToDate] = useState(defaultDates.toDate);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadDashboard = useCallback(async () => {
    if (fromDate > toDate) {
      setError('Tanggal awal tidak boleh melewati tanggal akhir.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const [
        summaryData,
        trendData,
        productData,
        stockData,
        transactionData,
        profitData,
      ] = await Promise.all([
        getDashboardSummary(STORE_ID),
        getDashboardSalesTrend(STORE_ID, fromDate, toDate),
        getDashboardTopProducts(STORE_ID, 10),
        getDashboardLowStock(STORE_ID),
        getDashboardRecentTransactions(STORE_ID, 10),
        getDashboardProfit(STORE_ID, fromDate, toDate),
      ]);

      setSummary(summaryData || {});
      setSalesTrend(Array.isArray(trendData) ? trendData : []);
      setTopProducts(Array.isArray(productData) ? productData : []);
      setLowStock(Array.isArray(stockData) ? stockData : []);
      setRecentTransactions(
        Array.isArray(transactionData) ? transactionData : []
      );
      setProfit(profitData || {});
    } catch (err) {
      console.error('Dashboard error:', err);
      setError(
        err.response?.data?.message ||
          err.message ||
          'Gagal memuat data Dashboard.'
      );
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const maxRevenue = Math.max(
    ...salesTrend.map((item) => Number(item.total_revenue) || 0),
    1
  );

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">INTELLIMART MANAGEMENT</p>
          <h1>Dashboard</h1>
          <p className="dashboard-subtitle">
            Ringkasan aktivitas dan performa penjualan toko.
          </p>
        </div>

        <button
          className="dashboard-refresh"
          onClick={loadDashboard}
          disabled={loading}
        >
          {loading ? 'Memuat...' : '↻ Perbarui Data'}
        </button>
      </div>

      <section className="dashboard-filter">
        <div className="dashboard-filter-group">
          <label htmlFor="dashboard-from">Dari tanggal</label>
          <input
            id="dashboard-from"
            type="date"
            value={fromDate}
            max={toDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
        </div>

        <div className="dashboard-filter-group">
          <label htmlFor="dashboard-to">Sampai tanggal</label>
          <input
            id="dashboard-to"
            type="date"
            value={toDate}
            min={fromDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>

        <button
          className="dashboard-filter-button"
          onClick={loadDashboard}
          disabled={loading}
        >
          Terapkan Filter
        </button>
      </section>

      {error && (
        <div className="dashboard-error">
          <strong>Gagal memuat Dashboard:</strong> {error}
        </div>
      )}

      {loading && (
        <div className="dashboard-loading">Memuat data Dashboard...</div>
      )}

      {!loading && !error && (
        <>
          <section className="dashboard-section">
            <div className="dashboard-section-heading">
              <div>
                <h2>Ringkasan Penjualan</h2>
                <p>Akumulasi transaksi yang telah dibayar.</p>
              </div>
            </div>

            <div className="dashboard-summary-grid">
              <div className="dashboard-card">
                <div className="dashboard-card-icon">▤</div>
                <p>Total Transaksi</p>
                <h3>{formatNumber(summary.total_transactions)}</h3>
                <span>Seluruh periode</span>
              </div>

              <div className="dashboard-card">
                <div className="dashboard-card-icon">Rp</div>
                <p>Total Pendapatan</p>
                <h3>{formatRupiah(summary.total_revenue)}</h3>
                <span>Seluruh periode</span>
              </div>

              <div className="dashboard-card">
                <div className="dashboard-card-icon">▦</div>
                <p>Barang Terjual</p>
                <h3>{formatNumber(summary.total_items_sold)}</h3>
                <span>Total kuantitas barang</span>
              </div>

              <div className="dashboard-card">
                <div className="dashboard-card-icon">%</div>
                <p>Total Diskon</p>
                <h3>{formatRupiah(summary.total_discount)}</h3>
                <span>Diskon transaksi</span>
              </div>
            </div>
          </section>

          <section className="dashboard-profit-grid">
            <div className="dashboard-profit-card">
              <p>Pendapatan Periode Terpilih</p>
              <h3>{formatRupiah(profit.total_revenue)}</h3>
              <span>
                {formatDate(fromDate)} – {formatDate(toDate)}
              </span>
            </div>

            <div className="dashboard-profit-card">
              <p>Total Modal Produk</p>
              <h3>{formatRupiah(profit.total_cost)}</h3>
              <span>Estimasi berdasarkan cost price saat ini</span>
            </div>

            <div className="dashboard-profit-card dashboard-profit-highlight">
              <p>Estimasi Keuntungan</p>
              <h3>{formatRupiah(profit.estimated_profit)}</h3>
              <span>{formatNumber(profit.total_transactions)} transaksi</span>
            </div>
          </section>

          <section className="dashboard-panel">
            <div className="dashboard-section-heading">
              <div>
                <h2>Tren Penjualan</h2>
                <p>Pendapatan harian selama periode terpilih.</p>
              </div>
            </div>

            {salesTrend.length === 0 ? (
              <div className="dashboard-empty">
                Belum ada data penjualan pada periode ini.
              </div>
            ) : (
              <div className="dashboard-chart">
                {salesTrend.map((item, index) => {
                  const revenue = Number(item.total_revenue) || 0;
                  const height = Math.max((revenue / maxRevenue) * 100, 3);

                  return (
                    <div
                      className="dashboard-chart-column"
                      key={`${item.sales_date}-${index}`}
                      title={`${formatDate(item.sales_date)}: ${formatRupiah(revenue)}`}
                    >
                      <strong>{formatRupiah(revenue)}</strong>
                      <div className="dashboard-chart-bar-area">
                        <div
                          className="dashboard-chart-bar"
                          style={{ height: `${height}%` }}
                        />
                      </div>
                      <span>{formatDate(item.sales_date)}</span>
                      <small>
                        {formatNumber(item.total_transactions)} transaksi
                      </small>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <div className="dashboard-two-columns">
            <section className="dashboard-panel">
              <div className="dashboard-section-heading">
                <div>
                  <h2>Produk Terlaris</h2>
                  <p>Berdasarkan jumlah barang terjual.</p>
                </div>
              </div>

              {topProducts.length === 0 ? (
                <div className="dashboard-empty">
                  Belum ada data produk terlaris.
                </div>
              ) : (
                <div className="dashboard-table-wrapper">
                  <table className="dashboard-table">
                    <thead>
                      <tr>
                        <th>Produk</th>
                        <th>Terjual</th>
                        <th>Transaksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topProducts.map((product) => (
                        <tr key={product.variant_id}>
                          <td>
                            <strong>{product.product_name}</strong>
                            <small>
                              {product.variant_name} · {product.sku}
                            </small>
                          </td>
                          <td>{formatNumber(product.total_quantity_sold)}</td>
                          <td>{formatNumber(product.total_transactions)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            <section className="dashboard-panel">
              <div className="dashboard-section-heading">
                <div>
                  <h2>Peringatan Stok</h2>
                  <p>Produk dengan stok mencapai batas minimum.</p>
                </div>
              </div>

              {lowStock.length === 0 ? (
                <div className="dashboard-stock-safe">
                  <span>✓</span>
                  <div>
                    <strong>Stok dalam kondisi aman</strong>
                    <p>Tidak ada produk yang berada di bawah batas minimum.</p>
                  </div>
                </div>
              ) : (
                <div className="dashboard-stock-list">
                  {lowStock.map((item) => (
                    <div
                      className="dashboard-stock-item"
                      key={`${item.store_id}-${item.variant_id}`}
                    >
                      <div>
                        <strong>{item.product_name}</strong>
                        <small>
                          {item.variant_name} · {item.sku}
                        </small>
                      </div>
                      <div className="dashboard-stock-quantity">
                        <strong>{formatNumber(item.stock)}</strong>
                        <small>Minimum {formatNumber(item.min_stock)}</small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          <section className="dashboard-panel">
            <div className="dashboard-section-heading">
              <div>
                <h2>Transaksi Terbaru</h2>
                <p>Sepuluh transaksi terakhir di toko.</p>
              </div>
            </div>

            {recentTransactions.length === 0 ? (
              <div className="dashboard-empty">Belum ada transaksi.</div>
            ) : (
              <div className="dashboard-table-wrapper">
                <table className="dashboard-table">
                  <thead>
                    <tr>
                      <th>Invoice</th>
                      <th>Pelanggan</th>
                      <th>Tipe</th>
                      <th>Jumlah Barang</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Tanggal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTransactions.map((transaction) => (
                      <tr key={transaction.id}>
                        <td>
                          <strong>{transaction.invoice_no}</strong>
                        </td>
                        <td>{transaction.customer_name || 'Umum'}</td>
                        <td>
                          {transaction.sale_type === 'WHOLESALE'
                            ? 'Grosir'
                            : 'Ecer'}
                        </td>
                        <td>{formatNumber(transaction.total_items)}</td>
                        <td>{formatRupiah(transaction.total_price)}</td>
                        <td>
                          <span
                            className={`dashboard-status ${
                              ['PAID', 'SUCCESS', 'LUNAS'].includes(
                                String(transaction.status).toUpperCase()
                              )
                                ? 'is-paid'
                                : 'is-pending'
                            }`}
                          >
                            {transaction.status}
                          </span>
                        </td>
                        <td>{formatDateTime(transaction.created_at)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default Dashboard;
