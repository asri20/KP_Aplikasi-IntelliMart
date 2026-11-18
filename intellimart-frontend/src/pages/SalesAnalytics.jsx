import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getCustomerAnalytics,
  getBestSellingProducts,
  getCrossSellingRecommendations,
} from '../services/salesAnalyticsService';
import '../styles/SalesAnalytics.css';

const formatRupiah = (value) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const formatDate = (value) => {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return date.toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

function SalesAnalytics() {
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [crossSelling, setCrossSelling] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError('');

    try {
      const [customerData, productData, crossSellingData] = await Promise.all([
        getCustomerAnalytics(),
        getBestSellingProducts(),
        getCrossSellingRecommendations(10),
      ]);

      setCustomers(Array.isArray(customerData) ? customerData : []);
      setProducts(Array.isArray(productData) ? productData : []);
      setCrossSelling(Array.isArray(crossSellingData) ? crossSellingData : []);
    } catch (err) {
      console.error('Gagal memuat analisis penjualan:', err);

      setError(
        err.response?.data?.message ||
          err.message ||
          'Gagal memuat data analisis penjualan.'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const summary = useMemo(() => {
    const activeCustomers = customers.filter(
      (customer) => Number(customer.total_transactions) > 0
    );

    const totalTransactions = customers.reduce(
      (sum, customer) => sum + Number(customer.total_transactions || 0),
      0
    );

    const totalSpending = customers.reduce(
      (sum, customer) => sum + Number(customer.total_spending || 0),
      0
    );

    const totalItems = customers.reduce(
      (sum, customer) => sum + Number(customer.total_items || 0),
      0
    );

    return {
      totalCustomers: customers.length,
      activeCustomers: activeCustomers.length,
      totalTransactions,
      totalSpending,
      totalItems,
    };
  }, [customers]);

  if (loading) {
    return (
      <div className="analytics-page">
        <div className="analytics-loading">
          Memuat data analisis penjualan...
        </div>
      </div>
    );
  }

  return (
    <main className="analytics-page">
      <header className="analytics-header">
        <div>
          <span className="analytics-eyebrow">
            INTELLIMART / MODUL PENJUALAN
          </span>
          <h1>Analisis Penjualan</h1>
          <p>
            Pantau perilaku pelanggan, performa produk, dan pola pembelian
            berdasarkan transaksi yang berhasil.
          </p>
        </div>

        <button
          type="button"
          className="analytics-refresh"
          onClick={loadAnalytics}
        >
          ↻ Perbarui Data
        </button>
      </header>

      {error && (
        <div className="analytics-error">
          <strong>Data belum berhasil dimuat.</strong>
          <span>{error}</span>
          <button type="button" onClick={loadAnalytics}>
            Coba Lagi
          </button>
        </div>
      )}

      {!error && (
        <>
          <section className="analytics-summary">
            <article className="analytics-card">
              <span>Total Pelanggan</span>
              <strong>{summary.totalCustomers}</strong>
              <small>{summary.activeCustomers} sudah melakukan transaksi</small>
            </article>

            <article className="analytics-card">
              <span>Total Transaksi</span>
              <strong>{summary.totalTransactions}</strong>
              <small>Transaksi PAID dan SUCCESS</small>
            </article>

            <article className="analytics-card">
              <span>Total Penjualan</span>
              <strong>{formatRupiah(summary.totalSpending)}</strong>
              <small>Berdasarkan subtotal detail produk</small>
            </article>

            <article className="analytics-card">
              <span>Total Item Terjual</span>
              <strong>{summary.totalItems}</strong>
              <small>Akumulasi kuantitas pembelian pelanggan</small>
            </article>
          </section>

          <section className="analytics-section">
            <div className="analytics-section-heading">
              <div>
                <h2>Analisis Pelanggan</h2>
                <p>Ringkasan frekuensi dan nilai pembelian setiap pelanggan.</p>
              </div>
            </div>

            <div className="analytics-table-wrapper">
              <table className="analytics-table">
                <thead>
                  <tr>
                    <th>Pelanggan</th>
                    <th>Tipe</th>
                    <th>Transaksi</th>
                    <th>Total Belanja</th>
                    <th>Jumlah Item</th>
                    <th>Pembelian Terakhir</th>
                  </tr>
                </thead>

                <tbody>
                  {customers.length > 0 ? (
                    customers.map((customer) => (
                      <tr key={customer.customer_id}>
                        <td>
                          <strong>{customer.customer_name}</strong>
                          <small>ID #{customer.customer_id}</small>
                        </td>
                        <td>
                          <span
                            className={`analytics-type ${
                              customer.customer_type === 'RESELLER'
                                ? 'wholesale'
                                : 'retail'
                            }`}
                          >
                            {customer.customer_type}
                          </span>
                        </td>
                        <td>{customer.total_transactions}</td>
                        <td>{formatRupiah(customer.total_spending)}</td>
                        <td>{customer.total_items}</td>
                        <td>{formatDate(customer.last_purchase)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="analytics-empty">
                        Belum ada data pelanggan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="analytics-section">
            <div className="analytics-section-heading">
              <div>
                <h2>Produk Terlaris</h2>
                <p>Produk dan varian berdasarkan jumlah unit yang terjual.</p>
              </div>
            </div>

            <div className="analytics-table-wrapper">
              <table className="analytics-table">
                <thead>
                  <tr>
                    <th>Produk</th>
                    <th>Varian</th>
                    <th>SKU</th>
                    <th>Jumlah Terjual</th>
                    <th>Jumlah Transaksi</th>
                    <th>Omzet Detail</th>
                  </tr>
                </thead>

                <tbody>
                  {products.length > 0 ? (
                    products.map((product) => (
                      <tr key={product.variant_id}>
                        <td>
                          <strong>{product.product_name}</strong>
                        </td>
                        <td>{product.variant_name}</td>
                        <td>{product.sku}</td>
                        <td>
                          <strong>
                            {Number(product.total_quantity_sold || 0)}
                          </strong>
                        </td>
                        <td>{product.total_transactions}</td>
                        <td>{formatRupiah(product.total_revenue)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="analytics-empty">
                        Belum ada data penjualan produk.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <section className="analytics-section">
            <div className="analytics-section-heading">
              <div>
                <h2>Rekomendasi Cross-selling</h2>
                <p>
                  Pasangan produk yang pernah dibeli dalam transaksi yang sama.
                </p>
              </div>
            </div>

            {crossSelling.length > 0 ? (
              <div className="cross-selling-list">
                {crossSelling.map((item, index) => (
                  <article
                    className="cross-selling-card"
                    key={`${item.product_a_variant_id}-${item.product_b_variant_id}`}
                  >
                    <span className="cross-selling-number">{index + 1}</span>

                    <div className="cross-selling-products">
                      <strong>
                        {item.product_a} - {item.product_a_variant}
                      </strong>
                      <span>+</span>
                      <strong>
                        {item.product_b} - {item.product_b_variant}
                      </strong>
                    </div>

                    <div className="cross-selling-frequency">
                      <strong>{item.times_bought_together}</strong>
                      <small>Transaksi bersama</small>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="analytics-empty-panel">
                <strong>Belum ada pola pembelian bersama.</strong>
                <p>
                  Sistem belum menemukan transaksi yang membeli dua produk
                  berbeda secara bersamaan. Rekomendasi akan muncul setelah
                  tersedia data transaksi yang sesuai.
                </p>
              </div>
            )}
          </section>
        </>
      )}
    </main>
  );
}

export default SalesAnalytics;
