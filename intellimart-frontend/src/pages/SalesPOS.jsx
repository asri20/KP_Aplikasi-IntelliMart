import React, { useEffect, useMemo, useState } from 'react';

import {
  getProductStocks,
  checkoutTransaction,
} from '../services/transactionService';

import '../styles/SalesPOS.css';

/**
 * @typedef {Object} Product
 * @property {number} variant_id
 * @property {string} product_name
 * @property {string|null} variant_name
 * @property {string|null} sku
 * @property {number|string} stock
 * @property {number|string} base_price
 * @property {number|null} price_code_id
 * @property {string|null} price_code
 * @property {string|null} store_name
 */

/**
 * @typedef {Object} CartItem
 * @property {number} variant_id
 * @property {number} product_id
 * @property {string} product_name
 * @property {string|null} variant_name
 * @property {string|null} sku
 * @property {number} price
 * @property {number} price_code_id
 * @property {number} stock
 * @property {number} qty
 */

export default function SalesPOS() {
  /** @type {[Product[], React.Dispatch<React.SetStateAction<Product[]>>]} */
  const [products, setProducts] = useState([]);

  /** @type {[CartItem[], React.Dispatch<React.SetStateAction<CartItem[]>>]} */
  const [cart, setCart] = useState([]);

  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [search, setSearch] = useState('');

  const STORE_ID = 1;
  const CASHIER_ID = 1;

  // =========================================================
  // LOAD PRODUCTS
  // =========================================================

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoadingProducts(true);

      const res = await getProductStocks(STORE_ID);

      if (res.success) {
        setProducts(res.data || []);
      } else {
        setProducts([]);
      }
    } catch (error) {
      console.error('Gagal memuat produk:', error);
      alert('Gagal memuat data produk.');
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  // =========================================================
  // FILTER PRODUCTS
  // =========================================================

  const filteredProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return products;
    }

    return products.filter((product) => {
      return (
        product.product_name
          ?.toLowerCase()
          .includes(keyword) ||
        product.variant_name
          ?.toLowerCase()
          .includes(keyword) ||
        product.sku
          ?.toLowerCase()
          .includes(keyword)
      );
    });
  }, [products, search]);

  // =========================================================
  // ADD TO CART
  // =========================================================

  /**
   * @param {Product} product
   */
  const addToCart = (product) => {
    if (Number(product.stock) <= 0) {
      alert('Stok produk habis.');
      return;
    }

    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) =>
          item.variant_id === product.variant_id
      );

      if (existingItem) {
        if (
          existingItem.qty >=
          Number(product.stock)
        ) {
          alert(
            'Jumlah melebihi stok yang tersedia.'
          );

          return currentCart;
        }

        return currentCart.map((item) =>
          item.variant_id === product.variant_id
            ? {
                ...item,
                qty: item.qty + 1,
              }
            : item
        );
      }

      return [
        ...currentCart,
        {
          variant_id: Number(
            product.variant_id
          ),

          product_id: Number(
            product.variant_id
          ),

          product_name:
            product.product_name,

          variant_name:
            product.variant_name || '-',

          sku: product.sku || '-',

          price:
            Number(product.base_price) || 0,

          price_code_id:
            Number(product.price_code_id) || 1,

          stock:
            Number(product.stock) || 0,

          qty: 1,
        },
      ];
    });
  };

  // =========================================================
  // INCREASE QUANTITY
  // =========================================================

  /**
   * @param {number} variantId
   */
  const increaseQty = (variantId) => {
    setCart((currentCart) =>
      currentCart.map((item) => {
        if (
          item.variant_id !== variantId
        ) {
          return item;
        }

        if (item.qty >= item.stock) {
          alert(
            'Jumlah sudah mencapai stok yang tersedia.'
          );

          return item;
        }

        return {
          ...item,
          qty: item.qty + 1,
        };
      })
    );
  };

  // =========================================================
  // DECREASE QUANTITY
  // =========================================================

  /**
   * @param {number} variantId
   */
  const decreaseQty = (variantId) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.variant_id === variantId
            ? {
                ...item,
                qty: item.qty - 1,
              }
            : item
        )
        .filter(
          (item) => item.qty > 0
        )
    );
  };

  // =========================================================
  // REMOVE
  // =========================================================

  /**
   * @param {number} variantId
   */
  const removeFromCart = (variantId) => {
    setCart((currentCart) =>
      currentCart.filter(
        (item) =>
          item.variant_id !== variantId
      )
    );
  };

  // =========================================================
  // TOTAL
  // =========================================================

  const subtotal = cart.reduce(
    (total, item) =>
      total + item.price * item.qty,
    0
  );

  // =========================================================
  // FORMAT RUPIAH
  // =========================================================

  /**
   * @param {number|string} value
   */
  const formatRupiah = (value) => {
    return `Rp ${Number(
      value || 0
    ).toLocaleString('id-ID')}`;
  };

  // =========================================================
  // CHECKOUT
  // =========================================================

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert(
        'Keranjang belanja masih kosong!'
      );

      return;
    }

    setLoading(true);

    const payload = {
      cashier_id: CASHIER_ID,
      store_id: STORE_ID,
      sale_type: 'RETAIL',
      status: 'PAID',
      discount_type: 'PERCENT',
      discount_value: 0,

      items: cart.map((item) => ({
        product_id:
          item.product_id,

        price_code_id:
          item.price_code_id,

        qty: Number(item.qty),

        price: Number(item.price),
      })),
    };

    console.log(
      'Checkout payload:',
      payload
    );

    try {
      const res =
        await checkoutTransaction(
          payload
        );

      if (res.success) {
        alert(
          `Transaksi berhasil!\n\n` +
            `ID Transaksi: ${res.transaction_id}\n` +
            `Total: ${formatRupiah(
              res.total_price
            )}`
        );

        setCart([]);

        await loadProducts();
      } else {
        alert(
          res.message ||
            'Transaksi gagal diproses.'
        );
      }
    } catch (error) {
      console.error(
        'Checkout error:',
        error
      );

      const message =
        error.response?.data?.message ||
        'Gagal memproses checkout transaksi.';

      alert(message);
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div className="sales-pos">

      {/* =====================================================
          HEADER
      ====================================================== */}

      <header className="sales-header">

        <div className="sales-header-left">

          <div className="sales-logo">
            IM
          </div>

          <div className="sales-title-wrapper">
            <h1>IntelliMart</h1>

            <p>
              Sales Point of Sale
            </p>
          </div>

        </div>

        <div className="sales-header-right">

          <div className="store-info">
            <strong>
              Toko Testing Modul 1
            </strong>

            <span>
              Store ID: {STORE_ID}
            </span>
          </div>

          <div className="cashier-badge">
            👤 Kasir #{CASHIER_ID}
          </div>

        </div>

      </header>

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <main className="sales-content">

        {/* ===================================================
            PRODUCTS
        ==================================================== */}

        <section className="products-section">

          <div className="section-heading">

            <div>
              <h2>
                Daftar Produk
              </h2>

              <p>
                Pilih produk untuk ditambahkan
                ke dalam transaksi.
              </p>
            </div>

            <div className="product-count">
              {filteredProducts.length}{' '}
              Produk
            </div>

          </div>

          {/* SEARCH */}

          <div className="product-toolbar">

            <div className="search-box">

              <span className="search-icon">
                🔍
              </span>

              <input
                type="text"
                placeholder="Cari produk, varian, atau SKU..."
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
              />

            </div>

          </div>

          {/* PRODUCTS */}

          {loadingProducts ? (
            <div className="loading-state">
              Memuat produk...
            </div>
          ) : filteredProducts.length ===
            0 ? (
            <div className="no-product">
              Tidak ada produk yang ditemukan.
            </div>
          ) : (
            <div className="products-grid">

              {filteredProducts.map(
                (product) => {

                  const stock =
                    Number(
                      product.stock
                    );

                  const isEmpty =
                    stock <= 0;

                  return (
                    <article
                      className="product-card"
                      key={
                        product.variant_id
                      }
                    >

                      <div className="product-card-top">

                        <div className="product-icon">
                          🛒
                        </div>

                        <span
                          className={
                            isEmpty
                              ? 'stock-badge empty'
                              : 'stock-badge'
                          }
                        >
                          {isEmpty
                            ? 'Stok Habis'
                            : `Stok ${stock}`}
                        </span>

                      </div>

                      <h3 className="product-name">
                        {
                          product.product_name
                        }
                      </h3>

                      <p className="product-variant">
                        Varian:{' '}
                        {
                          product.variant_name ||
                          '-'
                        }
                      </p>

                      <p className="product-sku">
                        SKU:{' '}
                        {product.sku || '-'}
                      </p>

                      <div className="product-bottom">

                        <div className="product-price">
                          {formatRupiah(
                            product.base_price
                          )}
                        </div>

                        <button
                          className="add-product-button"
                          onClick={() =>
                            addToCart(
                              product
                            )
                          }
                          disabled={
                            isEmpty
                          }
                        >
                          {isEmpty
                            ? 'Stok Habis'
                            : '+ Tambah ke Keranjang'}
                        </button>

                      </div>

                    </article>
                  );
                }
              )}

            </div>
          )}

        </section>

        {/* ===================================================
            CART
        ==================================================== */}

        <aside className="cart-section">

          <div className="cart-header">

            <h2>
              Keranjang
            </h2>

            <div className="cart-count">
              {cart.reduce(
                (total, item) =>
                  total + item.qty,
                0
              )}
            </div>

          </div>

          <div className="cart-body">

            {cart.length === 0 ? (

              <div className="empty-cart">

                <div className="empty-cart-icon">
                  🛒
                </div>

                <h3>
                  Keranjang masih kosong
                </h3>

                <p>
                  Tambahkan produk untuk
                  memulai transaksi.
                </p>

              </div>

            ) : (

              cart.map((item) => (

                <div
                  className="cart-item"
                  key={
                    item.variant_id
                  }
                >

                  <div className="cart-item-header">

                    <div>

                      <h3 className="cart-item-name">
                        {
                          item.product_name
                        }
                      </h3>

                      <p className="cart-item-variant">
                        {
                          item.variant_name
                        }
                      </p>

                    </div>

                    <button
                      className="remove-button"
                      onClick={() =>
                        removeFromCart(
                          item.variant_id
                        )
                      }
                      title="Hapus produk"
                    >
                      ✕
                    </button>

                  </div>

                  <div className="cart-item-bottom">

                    <div className="quantity-control">

                      <button
                        className="quantity-button"
                        onClick={() =>
                          decreaseQty(
                            item.variant_id
                          )
                        }
                      >
                        −
                      </button>

                      <span className="quantity-value">
                        {item.qty}
                      </span>

                      <button
                        className="quantity-button"
                        onClick={() =>
                          increaseQty(
                            item.variant_id
                          )
                        }
                      >
                        +
                      </button>

                    </div>

                    <div className="cart-item-price">

                      <span>
                        {formatRupiah(
                          item.price
                        )}{' '}
                        × {item.qty}
                      </span>

                      <strong>
                        {formatRupiah(
                          item.price *
                            item.qty
                        )}
                      </strong>

                    </div>

                  </div>

                </div>

              ))

            )}

          </div>

          {/* =================================================
              CART FOOTER
          ================================================== */}

          <div className="cart-footer">

            <div className="summary-row">

              <span>
                Subtotal
              </span>

              <strong>
                {formatRupiah(
                  subtotal
                )}
              </strong>

            </div>

            <div className="summary-row">

              <span>
                Diskon
              </span>

              <strong>
                Rp 0
              </strong>

            </div>

            <hr className="summary-divider" />

            <div className="total-row">

              <span>
                Total Pembayaran
              </span>

              <strong>
                {formatRupiah(
                  subtotal
                )}
              </strong>

            </div>

            <button
              className="checkout-button"
              onClick={
                handleCheckout
              }
              disabled={
                loading ||
                cart.length === 0
              }
            >
              {loading
                ? 'Memproses Transaksi...'
                : 'Bayar Sekarang'}
            </button>

          </div>

        </aside>

      </main>

    </div>
  );
}