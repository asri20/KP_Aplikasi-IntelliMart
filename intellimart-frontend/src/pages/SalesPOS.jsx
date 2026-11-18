import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  getProductStocks,
  getPaymentMethods,
  checkoutTransaction,
} from '../services/transactionService';

import PaymentModal from '../components/pos/PaymentModal';
import UpsellRecommendations from '../components/pos/UpsellRecommendations';

import '../styles/SalesPOS.css';

// =========================================================
// KONFIGURASI POS
// =========================================================

const STORE_ID = 1;
const CASHIER_ID = 1;

// =========================================================
// TIPE DATA (JSDoc agar kompatibel dengan pemeriksaan TypeScript)
// =========================================================

/**
 * @typedef {'ECER' | 'GROSIR'} SaleType
 * @typedef {'PERCENT' | 'AMOUNT'} DiscountType
 * @typedef {Object} Product
 * @property {number} variant_id
 * @property {string} product_name
 * @property {string|null} [variant_name]
 * @property {string|null} [sku]
 * @property {string|null} [barcode]
 * @property {number} stock
 * @property {number} base_price
 * @property {number|null} [price_code_id]
 * @property {number} [discount_store]
 * @property {number} [price]
 * @property {number} [product_id]
 * @property {number} [id]
 * @property {string} [name]
 * @property {any} [key]
 * @typedef {Product & {qty: number, price: number, name: string}} CartItem
 * @typedef {{id: number, method_name: string}} PaymentMethod
 * @typedef {{transaction_id: number, invoice_number?: string, invoice_no?: string, payment_method?: string, amount_received?: number, amount_paid?: number, change_amount?: number, created_at?: string}} ReceiptTransaction
 * @typedef {{subtotal: number, discountAmount: number, grandTotal: number}} ReceiptTotals
 */

// =========================================================
// HELPER
// =========================================================

/** @param {number|string|null|undefined} value */
const formatRupiah = (value) => {
  return `Rp ${Number(value || 0).toLocaleString('id-ID')}`;
};

/** @param {any} product @returns {Product} */
const normalizeProduct = (product) => {
  const variantId = Number(
    product.variant_id ?? product.product_id ?? product.id
  );

  return {
    ...product,
    variant_id: variantId,
    product_name: product.product_name || product.name || 'Produk tanpa nama',
    variant_name: product.variant_name || null,
    sku: product.sku || null,
    barcode: product.barcode || null,
    stock: Number(product.stock || 0),
    base_price: Number(product.base_price ?? product.price ?? 0),
    price_code_id:
      product.price_code_id === null ||
      product.price_code_id === undefined ||
      product.price_code_id === ''
        ? null
        : Number(product.price_code_id),
    price_tiers: Array.isArray(product.price_tiers) ? product.price_tiers : [],
    price_code_active:
      product.price_code_active === true ||
      Number(product.price_code_active) === 1,
  };
};

/** Harga jual sesuai jenis transaksi dan jumlah pembelian. */
const getUnitPrice = (product, quantity, saleType) => {
  const retailPrice =
    (Number(product.base_price) || 0) *
    (1 - (Number(product.discount_store) || 0) / 100);

  if (saleType !== 'GROSIR' || !product.price_code_active) {
    return retailPrice;
  }

  const tiers = Array.isArray(product.price_tiers)
    ? [...product.price_tiers].sort(
        (a, b) =>
          Number(a.min_qty ?? a.min_quantity ?? 0) -
          Number(b.min_qty ?? b.min_quantity ?? 0)
      )
    : [];

  const matchedTier = tiers.find((tier) => {
    const min = Number(tier.min_qty ?? tier.min_quantity ?? 0);
    const maxValue = tier.max_qty ?? tier.max_quantity;
    const max = maxValue == null ? Infinity : Number(maxValue);
    return Number(quantity) >= min && Number(quantity) <= max;
  });

  return matchedTier
    ? Number(matchedTier.unit_price ?? matchedTier.price)
    : retailPrice;
};

// =========================================================
// COMPONENT
// =========================================================

export default function SalesPOS() {
  // -------------------------------------------------------
  // STATE PRODUK DAN KERANJANG
  // -------------------------------------------------------

  const [products, setProducts] = useState(/** @type {Product[]} */ ([]));
  const [cart, setCart] = useState(/** @type {CartItem[]} */ ([]));

  const [search, setSearch] = useState('');
  const [saleType, setSaleType] = useState(/** @type {SaleType} */ ('ECER'));

  // Pelanggan hanya diambil dari akun dengan role Customer dan tipe yang sesuai.
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [loadingCustomers, setLoadingCustomers] = useState(false);

  // -------------------------------------------------------
  // STATE DISKON
  // -------------------------------------------------------

  const [discountType, setDiscountType] = useState(
    /** @type {DiscountType} */ ('PERCENT')
  );
  const [discountValue, setDiscountValue] = useState('0');

  // -------------------------------------------------------
  // STATE LOADING DAN PESAN
  // -------------------------------------------------------

  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // -------------------------------------------------------
  // STATE MODAL STRUK
  // -------------------------------------------------------

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [transactionData, setTransactionData] = useState(
    /** @type {ReceiptTransaction|null} */ (null)
  );

  const [completedCart, setCompletedCart] = useState(
    /** @type {CartItem[]} */ ([])
  );

  const [completedTotals, setCompletedTotals] = useState({
    subtotal: 0,
    discountAmount: 0,
    grandTotal: 0,
  });

  // STATE PEMBAYARAN
  const [paymentMethods, setPaymentMethods] = useState(
    /** @type {PaymentMethod[]} */ ([])
  );
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [amountReceived, setAmountReceived] = useState('');
  const [referenceNo, setReferenceNo] = useState('');
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(true);

  const selectedMethod = paymentMethods.find(
    (method) => Number(method.id) === Number(selectedPaymentMethod)
  );

  const isCashPayment = selectedMethod?.method_name?.toLowerCase() === 'cash';

  const loadPaymentMethods = useCallback(async () => {
    try {
      setLoadingPaymentMethods(true);
      const response = await getPaymentMethods();

      if (!response?.success || !Array.isArray(response.data)) {
        throw new Error(
          response?.message || 'Metode pembayaran tidak tersedia.'
        );
      }

      setPaymentMethods(response.data);
    } catch (error) {
      console.error('Gagal memuat metode pembayaran:', error);
      setPaymentMethods([]);
      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          'Gagal memuat metode pembayaran.'
      );
    } finally {
      setLoadingPaymentMethods(false);
    }
  }, []);

  useEffect(() => {
    loadPaymentMethods();
  }, [loadPaymentMethods]);

  // =========================================================
  // LOAD CUSTOMERS BERDASARKAN JENIS TRANSAKSI
  // =========================================================

  const loadCustomers = useCallback(async () => {
    const backendSaleType = saleType === 'GROSIR' ? 'WHOLESALE' : 'RETAIL';

    try {
      setLoadingCustomers(true);
      setSelectedCustomerId('');

      const response = await fetch(
        `http://localhost:5000/api/transactions/customers?sale_type=${backendSaleType}`
      );
      const result = await response.json();

      if (!response.ok || !result?.success || !Array.isArray(result.data)) {
        throw new Error(result?.message || 'Data pelanggan gagal dimuat.');
      }

      setCustomers(result.data);
    } catch (error) {
      console.error('Gagal memuat pelanggan:', error);
      setCustomers([]);
      setErrorMessage(error.message || 'Gagal memuat data pelanggan.');
    } finally {
      setLoadingCustomers(false);
    }
  }, [saleType]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  // =========================================================
  // LOAD PRODUCTS
  // =========================================================

  const loadProducts = useCallback(async () => {
    try {
      setLoadingProducts(true);
      setErrorMessage('');

      const response = await getProductStocks(STORE_ID);

      if (!response?.success || !Array.isArray(response.data)) {
        setProducts([]);
        setErrorMessage(response?.message || 'Data produk tidak dapat dimuat.');
        return;
      }

      const normalizedProducts = response.data
        .map(normalizeProduct)
        .filter(
          (product) =>
            Number.isInteger(product.variant_id) && product.variant_id > 0
        );

      setProducts(normalizedProducts);
    } catch (error) {
      console.error('Gagal memuat produk:', error);

      setProducts([]);

      setErrorMessage(
        error.response?.data?.message ||
          'Gagal memuat data produk. Periksa koneksi backend.'
      );
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // =========================================================
  // FILTER PRODUCTS
  // =========================================================

  const filteredProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) {
      return products;
    }

    return products.filter((product) => {
      const searchableText = [
        product.product_name,
        product.variant_name,
        product.sku,
        product.barcode,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      return searchableText.includes(keyword);
    });
  }, [products, search]);

  // =========================================================
  // HITUNG SUBTOTAL
  // =========================================================

  const subtotal = useMemo(() => {
    return cart.reduce((total, item) => {
      return total + Number(item.price) * Number(item.qty);
    }, 0);
  }, [cart]);

  // =========================================================
  // HITUNG DISKON
  // =========================================================

  const discountAmount = useMemo(() => {
    const value = Math.max(0, Number(discountValue) || 0);

    if (discountType === 'PERCENT') {
      return Math.min(subtotal, (subtotal * value) / 100);
    }

    return Math.min(subtotal, value);
  }, [subtotal, discountType, discountValue]);

  const grandTotal = Math.max(0, subtotal - discountAmount);

  // Dihitung setelah grandTotal tersedia agar tidak terkena temporal dead zone.
  const changeAmount = isCashPayment
    ? Math.max(0, Number(amountReceived || 0) - grandTotal)
    : 0;

  // =========================================================
  // ADD TO CART
  // =========================================================

  /** @param {Product} product */
  const addToCart = (product) => {
    if (!product.variant_id || !Number.isInteger(product.variant_id)) {
      setErrorMessage('ID varian produk tidak valid.');
      return;
    }

    if (product.stock <= 0) {
      setErrorMessage('Stok produk habis.');
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');

    setCart((currentCart) => {
      const existingItem = currentCart.find(
        (item) => item.variant_id === product.variant_id
      );

      if (existingItem) {
        if (existingItem.qty >= product.stock) {
          setErrorMessage(
            `Jumlah ${product.product_name} sudah mencapai stok tersedia.`
          );

          return currentCart;
        }

        return currentCart.map((item) =>
          item.variant_id === product.variant_id
            ? {
                ...item,
                qty: item.qty + 1,
                price: getUnitPrice(item, item.qty + 1, saleType),
              }
            : item
        );
      }

      return [
        ...currentCart,
        {
          variant_id: product.variant_id,
          product_id: product.variant_id,

          product_name: product.product_name,
          name: product.product_name,

          variant_name: product.variant_name || '-',
          sku: product.sku || '-',

          price: getUnitPrice(product, 1, saleType),
          price_tiers: product.price_tiers || [],
          price_code_active:
            product.price_code_active === true ||
            Number(product.price_code_active) === 1,
          base_price: product.base_price,
          discount_store: product.discount_store,

          // Jangan menggunakan ID pengganti seperti angka 1.
          price_code_id: product.price_code_id,

          stock: product.stock,
          qty: 1,
        },
      ];
    });
  };

  // =========================================================
  // INCREASE QUANTITY
  // =========================================================

  const increaseQty = (variantId) => {
    setErrorMessage('');

    setCart((currentCart) =>
      currentCart.map((item) => {
        if (item.variant_id !== variantId) {
          return item;
        }

        if (item.qty >= item.stock) {
          setErrorMessage(
            `Stok ${item.product_name} hanya tersedia ${item.stock}.`
          );

          return item;
        }

        const nextQty = item.qty + 1;
        return {
          ...item,
          qty: nextQty,
          price: getUnitPrice(item, nextQty, saleType),
        };
      })
    );
  };

  // =========================================================
  // DECREASE QUANTITY
  // =========================================================

  const decreaseQty = (variantId) => {
    setErrorMessage('');

    setCart((currentCart) =>
      currentCart
        .map((item) => {
          if (item.variant_id !== variantId) return item;
          const nextQty = item.qty - 1;
          return {
            ...item,
            qty: nextQty,
            price: getUnitPrice(item, nextQty, saleType),
          };
        })
        .filter((item) => item.qty > 0)
    );
  };

  // =========================================================
  // UPDATE QUANTITY
  // =========================================================

  const updateQty = (variantId, value) => {
    const quantity = Number(value);

    if (!Number.isInteger(quantity) || quantity < 1) {
      return;
    }

    setCart((currentCart) =>
      currentCart.map((item) => {
        if (item.variant_id !== variantId) {
          return item;
        }

        if (quantity > item.stock) {
          setErrorMessage(
            `Stok ${item.product_name} hanya tersedia ${item.stock}.`
          );

          return item;
        }

        setErrorMessage('');

        return {
          ...item,
          qty: quantity,
          price: getUnitPrice(item, quantity, saleType),
        };
      })
    );
  };

  // =========================================================
  // REMOVE ITEM
  // =========================================================

  const removeFromCart = (variantId) => {
    setCart((currentCart) =>
      currentCart.filter((item) => item.variant_id !== variantId)
    );

    setErrorMessage('');
  };

  // =========================================================
  // RESET CART
  // =========================================================

  const resetCart = () => {
    if (loading) return;

    setCart([]);
    setDiscountType('PERCENT');
    setDiscountValue('0');
    setSelectedPaymentMethod('');
    setSelectedCustomerId('');
    setAmountReceived('');
    setReferenceNo('');

    setErrorMessage('');
    setSuccessMessage('');
  };

  // =========================================================
  // CHANGE SALE TYPE
  // =========================================================

  /** @param {SaleType} type */
  const handleSaleTypeChange = (type) => {
    if (loading) return;

    setSaleType(type);
    setSelectedCustomerId('');
    setErrorMessage('');

    setCart((currentCart) =>
      currentCart.map((item) => ({
        ...item,
        price: getUnitPrice(item, item.qty, type),
      }))
    );
  };

  // =========================================================
  // VALIDASI CHECKOUT
  // =========================================================

  const validateCheckout = () => {
    if (cart.length === 0) {
      return 'Keranjang belanja masih kosong.';
    }

    for (const item of cart) {
      if (
        !Number.isInteger(Number(item.variant_id)) ||
        Number(item.variant_id) <= 0
      ) {
        return `ID produk ${item.product_name} tidak valid.`;
      }

      if (!Number.isInteger(Number(item.qty)) || Number(item.qty) <= 0) {
        return `Kuantitas ${item.product_name} tidak valid.`;
      }

      if (Number(item.qty) > Number(item.stock)) {
        return `Stok ${item.product_name} tidak mencukupi.`;
      }

      if (!Number.isFinite(Number(item.price)) || Number(item.price) < 0) {
        return `Harga ${item.product_name} tidak valid.`;
      }
    }

    const discount = Number(discountValue);

    if (!Number.isFinite(discount) || discount < 0) {
      return 'Nilai diskon tidak valid.';
    }

    if (discountType === 'PERCENT' && discount > 100) {
      return 'Diskon persentase tidak boleh lebih dari 100%.';
    }

    if (discountType !== 'PERCENT' && discount > subtotal) {
      return 'Diskon tidak boleh melebihi subtotal.';
    }

    if (!selectedPaymentMethod || !selectedMethod) {
      return 'Silakan pilih metode pembayaran.';
    }

    if (isCashPayment) {
      const received = Number(amountReceived);

      if (!Number.isFinite(received) || received < grandTotal) {
        return 'Nominal uang diterima harus sama dengan atau lebih besar dari total pembayaran.';
      }
    }

    return null;
  };

  // =========================================================
  // CHECKOUT
  // =========================================================

  const handleCheckout = async () => {
    if (loading) return;

    const validationError = validateCheckout();

    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    const backendSaleType = saleType === 'GROSIR' ? 'WHOLESALE' : 'RETAIL';

    const cartSnapshot = cart.map((item) => ({
      ...item,
      name: item.product_name,
    }));

    const subtotalSnapshot = subtotal;
    const discountSnapshot = discountAmount;
    const totalSnapshot = grandTotal;

    const receivedAmount = isCashPayment
      ? Number(amountReceived)
      : totalSnapshot;

    const payload = {
      cashier_id: CASHIER_ID,
      store_id: STORE_ID,
      sale_type: backendSaleType,
      customer_id: selectedCustomerId ? Number(selectedCustomerId) : null,
      discount_type: discountType,
      discount_value: Number(discountValue || 0),
      payment_method_id: Number(selectedPaymentMethod),
      amount_received: receivedAmount,
      reference_no: referenceNo.trim() || null,
      items: cartSnapshot.map((item) => ({
        variant_id: Number(item.variant_id),
        qty: Number(item.qty),
      })),
    };

    try {
      const apiResponse = await checkoutTransaction(payload);

      if (!apiResponse?.success || !apiResponse?.data) {
        throw new Error(apiResponse?.message || 'Transaksi gagal diproses.');
      }

      const result = apiResponse.data;

      const receiptItems = Array.isArray(result.items)
        ? result.items.map((item) => {
            const cartItem = cartSnapshot.find(
              (current) =>
                Number(current.variant_id) === Number(item.variant_id)
            );

            const qty = Number(item.qty ?? item.quantity ?? cartItem?.qty ?? 0);
            const price = Number(item.price_per_unit ?? cartItem?.price ?? 0);

            return {
              ...cartItem,
              name: cartItem?.product_name || 'Produk',
              product_name: cartItem?.product_name || 'Produk',
              variant_name: cartItem?.variant_name || '-',
              sku: cartItem?.sku || '-',
              qty,
              price,
              subtotal: Number(item.subtotal ?? price * qty),
            };
          })
        : cartSnapshot;

      setTransactionData({
        transaction_id: result.transaction_id,
        invoice_number: result.invoice_no || '-',
        invoice_no: result.invoice_no || '-',
        payment_method:
          result.payment_method || selectedMethod?.method_name || '-',
        amount_received: Number(result.amount_received ?? receivedAmount),
        amount_paid: Number(
          result.amount_paid ?? result.total_price ?? totalSnapshot
        ),
        change_amount: Number(result.change_amount || 0),
        created_at: new Date().toISOString(),
      });

      setCompletedCart(receiptItems);
      setCompletedTotals({
        subtotal: Number(result.subtotal ?? subtotalSnapshot),
        discountAmount: Number(result.discount_amount ?? discountSnapshot),
        grandTotal: Number(result.total_price ?? totalSnapshot),
      });

      setIsPaymentModalOpen(true);
      setCart([]);
      setDiscountType('PERCENT');
      setDiscountValue('0');
      setSelectedPaymentMethod('');
      setSelectedCustomerId('');
      setAmountReceived('');
      setReferenceNo('');
      setSuccessMessage('Transaksi berhasil disimpan.');

      await loadProducts();
    } catch (error) {
      console.error('Checkout error:', error);

      setErrorMessage(
        error.response?.data?.message ||
          error.message ||
          'Gagal memproses checkout transaksi.'
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // CLOSE PAYMENT MODAL
  // =========================================================

  const closePaymentModal = () => {
    setIsPaymentModalOpen(false);

    setTransactionData(null);
    setCompletedCart([]);

    setSuccessMessage('');
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
          <div className="sales-logo">IM</div>

          <div className="sales-title-wrapper">
            <h1>IntelliMart</h1>

            <p>Sales Point of Sale</p>
          </div>
        </div>

        <div className="sales-header-right">
          <div className="store-info">
            <strong>Toko Testing Modul 1</strong>

            <span>Store ID: {STORE_ID}</span>
          </div>

          <div className="cashier-badge">👤 Kasir #{CASHIER_ID}</div>
        </div>
      </header>

      {/* =====================================================
          CONTENT
      ====================================================== */}

      <main className="sales-content">
        {/* PESAN ERROR DAN SUKSES */}

        {errorMessage && (
          <div
            role="alert"
            className="sales-message sales-message-error"
            style={{
              marginBottom: '16px',
              padding: '12px 16px',
              borderRadius: '8px',
              color: '#991b1b',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
            }}
          >
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div
            role="status"
            className="sales-message sales-message-success"
            style={{
              marginBottom: '16px',
              padding: '12px 16px',
              borderRadius: '8px',
              color: '#166534',
              backgroundColor: '#f0fdf4',
              border: '1px solid #bbf7d0',
            }}
          >
            {successMessage}
          </div>
        )}

        {/* ===================================================
            JENIS TRANSAKSI
        ==================================================== */}

        <section
          className="sale-type-section"
          style={{
            marginBottom: '20px',
            padding: '16px',
            borderRadius: '12px',
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
          }}
        >
          <h2
            style={{
              margin: '0 0 12px',
              fontSize: '15px',
              fontWeight: 700,
              color: '#374151',
            }}
          >
            Jenis Transaksi
          </h2>

          <div
            style={{
              display: 'flex',
              gap: '10px',
              flexWrap: 'wrap',
            }}
          >
            {['ECER', 'GROSIR'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => handleSaleTypeChange(type)}
                disabled={loading}
                aria-pressed={saleType === type}
                style={{
                  padding: '10px 22px',
                  borderRadius: '8px',
                  border:
                    saleType === type
                      ? '1px solid #ff6b00'
                      : '1px solid #d1d5db',
                  backgroundColor: saleType === type ? '#ff6b00' : '#ffffff',
                  color: saleType === type ? '#ffffff' : '#374151',
                  fontWeight: 700,
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {type}
              </button>
            ))}
          </div>

          {saleType === 'GROSIR' && (
            <p
              style={{
                margin: '10px 0 0',
                fontSize: '12px',
                color: '#92400e',
              }}
            >
              Transaksi GROSIR dipilih. Harga bertingkat dan konversi satuan
              tetap harus divalidasi oleh backend.
            </p>
          )}
        </section>

        {/* ===================================================
            PILIH PELANGGAN (OPSIONAL)
        ==================================================== */}
        <section
          className="sale-type-section"
          style={{
            marginBottom: '20px',
            padding: '16px',
            borderRadius: '12px',
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
          }}
        >
          <label
            htmlFor="pos-customer"
            style={{ display: 'block', marginBottom: '8px', fontWeight: 700 }}
          >
            Pelanggan (opsional)
          </label>
          <select
            id="pos-customer"
            value={selectedCustomerId}
            onChange={(event) => setSelectedCustomerId(event.target.value)}
            disabled={loading || loadingCustomers}
            style={{
              width: '100%',
              padding: '10px',
              border: '1px solid #d1d5db',
              borderRadius: '7px',
              backgroundColor: '#ffffff',
            }}
          >
            <option value="">
              {loadingCustomers
                ? 'Memuat pelanggan...'
                : 'Transaksi tanpa pelanggan'}
            </option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name ||
                  customer.customer_name ||
                  `Pelanggan #${customer.id}`}{' '}
                (
                {customer.customer_type ||
                  (saleType === 'GROSIR' ? 'RESELLER' : 'RETAIL')}
                )
              </option>
            ))}
          </select>
          <small
            style={{ display: 'block', marginTop: '7px', color: '#6b7280' }}
          >
            {saleType === 'GROSIR'
              ? 'Daftar hanya menampilkan akun Customer bertipe Reseller.'
              : 'Daftar hanya menampilkan akun Customer bertipe Retail.'}
          </small>
        </section>

        {/* ===================================================
            PRODUCTS
        ==================================================== */}

        <section className="products-section">
          <div className="section-heading">
            <div>
              <h2>Daftar Produk</h2>

              <p>Pilih produk untuk ditambahkan ke dalam transaksi.</p>
            </div>

            <div className="product-count">
              {filteredProducts.length} Produk
            </div>
          </div>

          {/* SEARCH */}

          <div className="product-toolbar">
            <div className="search-box">
              <span className="search-icon">🔍</span>

              <input
                type="text"
                placeholder="Cari produk, varian, SKU, atau barcode..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <button
              type="button"
              onClick={loadProducts}
              disabled={loadingProducts || loading}
              className="refresh-products-button"
            >
              {loadingProducts ? 'Memuat...' : '↻ Refresh'}
            </button>
          </div>

          {/* PRODUCTS */}

          {loadingProducts ? (
            <div className="loading-state">Memuat produk...</div>
          ) : filteredProducts.length === 0 ? (
            <div className="no-product">
              {products.length === 0
                ? 'Belum ada produk yang tersedia.'
                : 'Tidak ada produk yang ditemukan.'}
            </div>
          ) : (
            <div className="products-grid">
              {filteredProducts.map((product) => {
                const stock = Number(product.stock);
                const isEmpty = stock <= 0;

                return (
                  <article className="product-card" key={product.variant_id}>
                    <div className="product-card-top">
                      <div className="product-icon">🛒</div>

                      <span
                        className={
                          isEmpty ? 'stock-badge empty' : 'stock-badge'
                        }
                      >
                        {isEmpty ? 'Stok Habis' : `Stok ${stock}`}
                      </span>
                    </div>

                    <h3 className="product-name">{product.product_name}</h3>

                    <p className="product-variant">
                      Varian: {product.variant_name || '-'}
                    </p>

                    <p className="product-sku">SKU: {product.sku || '-'}</p>

                    <div className="product-bottom">
                      <div className="product-price">
                        {formatRupiah(getUnitPrice(product, 1, saleType))}
                      </div>

                      <button
                        type="button"
                        className="add-product-button"
                        onClick={() => addToCart(product)}
                        disabled={isEmpty || loading}
                      >
                        {isEmpty ? 'Stok Habis' : '+ Tambah ke Keranjang'}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* ===================================================
            CART
        ==================================================== */}

        <aside className="cart-section">
          <div className="cart-header">
            <h2>Keranjang</h2>

            <div className="cart-count">
              {cart.reduce((total, item) => total + item.qty, 0)}
            </div>
          </div>

          <div className="cart-body">
            {cart.length === 0 ? (
              <div className="empty-cart">
                <div className="empty-cart-icon">🛒</div>
                <UpsellRecommendations cart={cart} storeId={STORE_ID} />

                <h3>Keranjang masih kosong</h3>

                <p>Tambahkan produk untuk memulai transaksi.</p>
              </div>
            ) : (
              cart.map((item) => (
                <div className="cart-item" key={item.variant_id}>
                  <div className="cart-item-header">
                    <div>
                      <h3 className="cart-item-name">{item.product_name}</h3>

                      <p className="cart-item-variant">{item.variant_name}</p>

                      <p className="cart-item-sku">SKU: {item.sku}</p>
                    </div>

                    <button
                      type="button"
                      className="remove-button"
                      onClick={() => removeFromCart(item.variant_id)}
                      title="Hapus produk"
                      disabled={loading}
                    >
                      ✕
                    </button>
                  </div>

                  <div className="cart-item-bottom">
                    <div className="quantity-control">
                      <button
                        type="button"
                        className="quantity-button"
                        onClick={() => decreaseQty(item.variant_id)}
                        disabled={loading}
                      >
                        −
                      </button>

                      <span className="quantity-value">{item.qty}</span>

                      <button
                        type="button"
                        className="quantity-button"
                        onClick={() => increaseQty(item.variant_id)}
                        disabled={loading || item.qty >= item.stock}
                      >
                        +
                      </button>
                    </div>

                    <div className="cart-item-price">
                      <span>
                        {formatRupiah(item.price)} × {item.qty}
                      </span>

                      <strong>{formatRupiah(item.price * item.qty)}</strong>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* REKOMENDASI UPSELLING - tidak mengubah keranjang otomatis */}
          {cart.length > 0 && (
            <UpsellRecommendations cart={cart} storeId={STORE_ID} />
          )}

          {/* =================================================
              CART FOOTER
          ================================================== */}

          <div className="cart-footer">
            {/* DISKON */}

            <div
              className="discount-control"
              style={{
                marginBottom: '16px',
              }}
            >
              <label
                htmlFor="discount-type"
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '13px',
                  fontWeight: 700,
                }}
              >
                Diskon Transaksi
              </label>

              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                }}
              >
                <select
                  id="discount-type"
                  value={discountType}
                  onChange={(event) => setDiscountType(event.target.value)}
                  disabled={loading}
                  style={{
                    minWidth: '110px',
                    padding: '9px',
                    border: '1px solid #d1d5db',
                    borderRadius: '7px',
                    backgroundColor: '#ffffff',
                  }}
                >
                  <option value="PERCENT">Persen (%)</option>

                  <option value="AMOUNT">Nominal (Rp)</option>
                </select>

                <input
                  type="number"
                  min="0"
                  max={discountType === 'PERCENT' ? 100 : subtotal}
                  value={discountValue}
                  onChange={(event) => setDiscountValue(event.target.value)}
                  disabled={loading}
                  placeholder="Nilai diskon"
                  style={{
                    width: '100%',
                    minWidth: 0,
                    padding: '9px',
                    border: '1px solid #d1d5db',
                    borderRadius: '7px',
                  }}
                />
              </div>
            </div>

            {/* SUMMARY */}

            <div className="summary-row">
              <span>Subtotal</span>

              <strong>{formatRupiah(subtotal)}</strong>
            </div>

            <div className="summary-row">
              <span>Diskon</span>

              <strong>- {formatRupiah(discountAmount)}</strong>
            </div>

            <hr className="summary-divider" />

            <div className="total-row">
              <span>Total Pembayaran</span>

              <strong>{formatRupiah(grandTotal)}</strong>
            </div>

            {/* METODE PEMBAYARAN */}
            <section
              className="payment-section"
              style={{
                marginTop: '18px',
                paddingTop: '16px',
                borderTop: '1px solid #e5e7eb',
              }}
            >
              <label
                htmlFor="payment-method"
                style={{
                  display: 'block',
                  marginBottom: '8px',
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#374151',
                }}
              >
                Metode Pembayaran
              </label>

              <select
                id="payment-method"
                value={selectedPaymentMethod}
                onChange={(event) => {
                  setSelectedPaymentMethod(event.target.value);
                  setAmountReceived('');
                  setReferenceNo('');
                  setErrorMessage('');
                }}
                disabled={loading || loadingPaymentMethods}
                style={{
                  width: '100%',
                  padding: '10px',
                  border: '1px solid #d1d5db',
                  borderRadius: '7px',
                  backgroundColor: '#ffffff',
                  marginBottom: '12px',
                }}
              >
                <option value="">
                  {loadingPaymentMethods
                    ? 'Memuat metode pembayaran...'
                    : 'Pilih metode pembayaran'}
                </option>
                {paymentMethods.map((method) => (
                  <option key={method.id} value={method.id}>
                    {method.method_name}
                  </option>
                ))}
              </select>

              {isCashPayment ? (
                <div style={{ marginBottom: '12px' }}>
                  <label
                    htmlFor="amount-received"
                    style={{
                      display: 'block',
                      marginBottom: '6px',
                      fontSize: '13px',
                      fontWeight: 600,
                    }}
                  >
                    Uang Diterima
                  </label>
                  <input
                    id="amount-received"
                    type="number"
                    min={grandTotal}
                    step="1"
                    value={amountReceived}
                    onChange={(event) => setAmountReceived(event.target.value)}
                    disabled={loading}
                    placeholder="Masukkan nominal uang"
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '7px',
                    }}
                  />
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginTop: '10px',
                      fontSize: '13px',
                    }}
                  >
                    <span>Kembalian</span>
                    <strong style={{ color: '#15803d' }}>
                      {formatRupiah(changeAmount)}
                    </strong>
                  </div>
                </div>
              ) : selectedMethod ? (
                <div style={{ marginBottom: '12px' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '13px',
                      marginBottom: '10px',
                    }}
                  >
                    <span>Nominal yang harus dibayar</span>
                    <strong>{formatRupiah(grandTotal)}</strong>
                  </div>
                  <label
                    htmlFor="payment-reference"
                    style={{
                      display: 'block',
                      marginBottom: '6px',
                      fontSize: '13px',
                      fontWeight: 600,
                    }}
                  >
                    Nomor Referensi (opsional)
                  </label>
                  <input
                    id="payment-reference"
                    type="text"
                    value={referenceNo}
                    onChange={(event) => setReferenceNo(event.target.value)}
                    disabled={loading}
                    maxLength={100}
                    placeholder="Masukkan nomor referensi pembayaran"
                    style={{
                      width: '100%',
                      boxSizing: 'border-box',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '7px',
                    }}
                  />
                </div>
              ) : null}
            </section>

            {/* ACTION BUTTONS */}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
                marginTop: '16px',
              }}
            >
              <button
                type="button"
                onClick={resetCart}
                disabled={loading || cart.length === 0}
                className="clear-cart-button"
              >
                Kosongkan
              </button>

              <button
                type="button"
                className="checkout-button"
                onClick={handleCheckout}
                disabled={
                  loading ||
                  cart.length === 0 ||
                  loadingPaymentMethods ||
                  paymentMethods.length === 0
                }
              >
                {loading ? 'Memproses Transaksi...' : 'Bayar Sekarang'}
              </button>
            </div>
          </div>
        </aside>
      </main>

      {/* =====================================================
          PAYMENT / RECEIPT MODAL
      ====================================================== */}

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={closePaymentModal}
        transactionData={transactionData}
        cart={completedCart}
        subtotal={completedTotals.subtotal}
        discountAmount={completedTotals.discountAmount}
        grandTotal={completedTotals.grandTotal}
      />
    </div>
  );
}
