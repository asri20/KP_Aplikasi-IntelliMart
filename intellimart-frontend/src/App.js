import React, { useState, useEffect } from 'react';

export default function App() {
  const [activeTab, setActiveTab] = useState('buyer'); // 'buyer' atau 'cashier'
  const [storeId, setStoreId] = useState(1);
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]);
  const [pendingOrders, setPendingOrders] = useState([]);
  
  // Kredensial Simulasi Uji Coba
  const customerId = 3; 
  const cashierId = 2; 

  useEffect(() => {
    fetchProducts();
    fetchPendingOrders();
  }, [storeId]);

  const fetchProducts = async () => {
    try {
      const res = await fetch(`http://localhost:5000/api/products?store_id=${storeId}`);
      const data = await res.json();
      setProducts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Gagal memuat produk:", err);
    }
  };

  const fetchPendingOrders = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/cashier/pending-orders');
      const data = await res.json();
      setPendingOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Gagal memuat antrean kasir:", err);
    }
  };

  const addToCart = async (product, qty) => {
    if (!qty || qty <= 0) return alert("Masukkan jumlah kuantitas valid!");
    if (qty > product.stock) return alert("Kuantitas melebihi stok yang tersedia!");

    try {
      const res = await fetch('http://localhost:5000/api/calculate-price', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price_code: product.price_code, quantity: parseInt(qty) })
      });
      const data = await res.json();

      if (data.unit_price) {
        const priceAfterDiscount = data.unit_price * (1 - (product.discount_store / 100));
        
        const newCartItem = {
          variant_id: product.variant_id,
          product_name: product.product_name,
          variant_name: product.variant_name,
          quantity: parseInt(qty),
          price_per_unit: priceAfterDiscount,
          original_unit_price: data.unit_price
        };

        setCart([...cart.filter(item => item.variant_id !== product.variant_id), newCartItem]);
      } else {
        alert(data.error || 'Gagal mengambil skema harga bertingkat.');
      }
    } catch (err) {
      alert("Koneksi backend terputus.");
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return alert("Keranjang belanja Anda masih kosong!");
    
    try {
      const res = await fetch('http://localhost:5000/api/transactions/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_id: customerId, store_id: parseInt(storeId), items: cart })
      });
      const data = await res.json();
      
      if (data.transaction_id) {
        alert(`Checkout Berhasil! Nota #${data.transaction_id} dibuat dengan status UNPAID.`);
        setCart([]);
        fetchPendingOrders();
      }
    } catch (err) {
      alert("Gagal memproses checkout.");
    }
  };

  const handlePay = async (transactionId) => {
    try {
      const res = await fetch('http://localhost:5000/api/cashier/fulfill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transaction_id: transactionId, cashier_id: cashierId })
      });
      const data = await res.json();

      if (data.success) {
        alert(data.message);
        fetchPendingOrders();
        fetchProducts(); 
      } else {
        alert(`Gagal: ${data.error}`);
      }
    } catch (err) {
      alert("Gagal memproses pembayaran kasir.");
    }
  };

  // Filter produk lokal berdasarkan kolom pencarian ala Tokopedia
  const filteredProducts = products.filter(p => 
    p.product_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const calculateTotalCart = () => {
    return cart.reduce((sum, item) => sum + (item.quantity * item.price_per_unit), 0);
  };

  return (
    <div style={styles.appContainer}>
      
      {/* HEADER / TOP NAVIGATION BAR BAR (Tokopedia Style) */}
      <header style={styles.header}>
        <div style={styles.headerMain}>
          <span style={styles.logo}>Intelli<span style={{ color: '#00AA5B' }}>mart</span></span>
          
          <div style={styles.searchContainer}>
            <input 
              type="text" 
              placeholder="Cari produk pintar di sini..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          <div style={styles.tabToggleGroup}>
            <button 
              onClick={() => setActiveTab('buyer')} 
              style={{...styles.tabButton, ...(activeTab === 'buyer' ? styles.tabActive : {})}}
            >
              🛍️ Mode Pembeli
            </button>
            <button 
              onClick={() => setActiveTab('cashier')} 
              style={{...styles.tabButton, ...(activeTab === 'cashier' ? styles.tabActive : {})}}
            >
              🏪 POS Kasir
            </button>
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT CONTENT */}
      <main style={styles.mainContent}>
        
        {activeTab === 'buyer' ? (
          /* ==================== SCREEN MODE PEMBELI ==================== */
          <div style={styles.buyerGrid}>
            
            {/* SISI KIRI: PRODUK & FILTER */}
            <div style={{ flex: 3 }}>
              <div style={styles.sectionCard}>
                <div style={styles.storeFilterBar}>
                  <span style={{ fontWeight: '600', color: '#212121' }}>📍 Dikirim dari cabang: </span>
                  <select value={storeId} onChange={(e) => setStoreId(e.target.value)} style={styles.dropdownStore}>
                    <option value={1}>Intellimart Jakarta Utara</option>
                    <option value={2}>Intellimart Bandung Kota</option>
                    <option value={3}>Intellimart Surabaya Pusat</option>
                  </select>
                </div>

                <h3 style={styles.sectionTitle}>Produk Pilihan Untukmu</h3>
                
                {filteredProducts.length === 0 ? (
                  <p style={{ color: '#6D7588', textAlign: 'center', padding: '40px 0' }}>Produk tidak ditemukan atau stok kosong di cabang ini.</p>
                ) : (
                  <div style={styles.productGrid}>
                    {filteredProducts.map(p => (
                      <div key={p.variant_id} style={styles.productCard}>
                        {/* Placeholder Gambar Produk */}
                        <div style={styles.productImagePlaceholder}>📦</div>
                        <div style={styles.productCardBody}>
                          <div style={styles.storeTag}>Official Store</div>
                          <h4 style={styles.productName}>{p.product_name}</h4>
                          <p style={styles.variantName}>Varian: {p.variant_name}</p>
                          
                          {/* Label Badge Grosir/Skema Tier Harga */}
                          <div style={styles.tierBadge}>Skema: {p.price_code}</div>
                          {p.discount_store > 0 && (
                            <span style={styles.discountBadge}>Diskon Toko {parseFloat(p.discount_store)}%</span>
                          )}

                          <div style={styles.stockText}>Sisa Stok: <b>{p.stock}</b></div>
                          
                          <div style={styles.actionRow}>
                            <input 
                              type="number" 
                              min="1" 
                              max={p.stock} 
                              defaultValue="1"
                              id={`qty-${p.variant_id}`} 
                              style={styles.qtyInput} 
                            />
                            <button 
                              onClick={() => addToCart(p, document.getElementById(`qty-${p.variant_id}`).value)}
                              style={styles.btnAddToCart}
                            >
                              + Keranjang
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* SISI KANAN: RINGKASAN BELANJA (CART SIDEBAR) */}
            <div style={{ flex: 1.2 }}>
              <div style={styles.cartSidebar}>
                <h3 style={{ ...styles.sectionTitle, marginTop: 0, borderBottom: '1px solid #E5E7E9', paddingBottom: '10px' }}>
                  Keranjang Belanja 🛒
                </h3>
                
                {cart.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#6D7588', padding: '30px 0' }}>
                    <p style={{ fontSize: '48px', margin: 0 }}>🛒</p>
                    <p style={{ fontSize: '13px' }}>Wah, keranjang belanjamu kosong!</p>
                  </div>
                ) : (
                  <div>
                    <div style={styles.cartItemsList}>
                      {cart.map(item => (
                        <div key={item.variant_id} style={styles.cartItemRow}>
                          <div>
                            <div style={styles.cartItemName}>{item.product_name}</div>
                            <div style={styles.cartItemSub}>{item.variant_name} x {item.quantity} pcs</div>
                          </div>
                          <div style={styles.cartItemPrice}>
                            Rp {(item.quantity * item.price_per_unit).toLocaleString('id-ID')}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div style={styles.totalSummaryContainer}>
                      <span style={{ color: '#212121', fontWeight: 'bold' }}>Total Harga</span>
                      <span style={styles.totalPriceText}>Rp {calculateTotalCart().toLocaleString('id-ID')}</span>
                    </div>

                    <button onClick={handleCheckout} style={styles.btnCheckout}>
                      Beli / Kirim ke Kasir
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>
        ) : (
          /* ==================== SCREEN MODE POS KASIR ==================== */
          <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={styles.sectionCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ ...styles.sectionTitle, margin: 0 }}>🏪 Terminal POS Penjualan (Kasir ID: #{cashierId})</h3>
                <button onClick={fetchPendingOrders} style={styles.btnRefresh}>🔄 Segarkan Antrean</button>
              </div>
              <p style={{ color: '#6D7588', fontSize: '14px', marginBottom: '20px' }}>
                Berikut adalah daftar transaksi masuk yang belum dibayar oleh customer. Lakukan verifikasi fisik barang sebelum mengubah status menjadi Lunas.
              </p>

              {pendingOrders.length === 0 ? (
                <div style={styles.emptyStateContainer}>
                  <p style={{ fontSize: '40px', margin: 0 }}>✅</p>
                  <p style={{ color: '#6D7588' }}>Semua antrean bersih. Tidak ada transaksi tertunda.</p>
                </div>
              ) : (
                pendingOrders.map(order => (
                  <div key={order.id} style={styles.invoiceCard}>
                    <div style={styles.invoiceHeader}>
                      <div>
                        <span style={styles.invoiceId}>Nota ID: #{order.id}</span>
                        <div style={styles.invoiceDate}>{new Date(order.created_at).toLocaleString('id-ID')}</div>
                      </div>
                      <span style={styles.unpaidStatusBadge}>{order.status}</span>
                    </div>

                    <div style={styles.invoiceBody}>
                      <div style={{ fontSize: '14px', color: '#212121' }}>
                        Pelanggan ID: <b>{order.customer_id}</b> | Toko Asal: <b>Cabang #{order.store_id}</b>
                      </div>
                      <div style={styles.invoiceTotalRow}>
                        <span style={{ color: '#6D7588' }}>Total Pembayaran:</span>
                        <span style={styles.invoiceTotalAmount}>Rp {parseFloat(order.total_price).toLocaleString('id-ID')}</span>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <button onClick={() => handlePay(order.id)} style={styles.btnFulfill}>
                        🤝 Konfirmasi Bayar & Potong Stok
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

/* ==================== MODERN TOKOPEDIA INLINE STYLES ==================== */
const styles = {
  appContainer: {
    backgroundColor: '#F0F3F7',
    minHeight: '100vh',
    fontFamily: '"Open Sans", Helvetica, Arial, sans-serif',
    color: '#212121',
  },
  header: {
    backgroundColor: '#FFFFFF',
    boxShadow: '0 4px 6px -1px rgba(0,0,0,0.07)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    padding: '12px 0',
  },
  headerMain: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 20px',
    gap: '20px',
  },
  logo: {
    fontSize: '26px',
    fontWeight: '800',
    letterSpacing: '-0.5px',
    color: '#212121',
  },
  searchContainer: {
    flex: 1,
    maxWidth: '600px',
  },
  searchInput: {
    width: '100%',
    padding: '10px 16px',
    borderRadius: '8px',
    border: '1px solid #E5E7E9',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
    backgroundColor: '#F3F4F5',
  },
  tabToggleGroup: {
    display: 'flex',
    gap: '8px',
  },
  tabButton: {
    padding: '8px 16px',
    borderRadius: '8px',
    border: '1px solid transparent',
    backgroundColor: 'transparent',
    fontWeight: '600',
    fontSize: '14px',
    cursor: 'pointer',
    color: '#6D7588',
  },
  tabActive: {
    backgroundColor: '#E6F6EC',
    color: '#00AA5B',
    borderColor: '#00AA5B',
  },
  mainContent: {
    maxWidth: '1200px',
    margin: '24px auto',
    padding: '0 20px',
  },
  buyerGrid: {
    display: 'flex',
    gap: '20px',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 6px 0 rgba(49,53,59,0.12)',
  },
  storeFilterBar: {
    backgroundColor: '#F3F4F5',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '20px',
    fontSize: '14px',
  },
  dropdownStore: {
    padding: '6px 12px',
    borderRadius: '6px',
    border: '1px solid #CDD0D4',
    backgroundColor: '#FFFFFF',
    fontWeight: '600',
    color: '#00AA5B',
    cursor: 'pointer',
    marginLeft: '8px',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#212121',
    marginBottom: '16px',
  },
  productGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
    gap: '16px',
  },
  productCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: '10px',
    border: '1px solid #E5E7E9',
    overflow: 'hidden',
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  productImagePlaceholder: {
    height: '140px',
    backgroundColor: '#F3F4F5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '42px',
  },
  productCardBody: {
    padding: '12px',
  },
  storeTag: {
    color: '#00AA5B',
    fontSize: '11px',
    fontWeight: '700',
    textTransform: 'uppercase',
    marginBottom: '4px',
  },
  productName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#212121',
    margin: '0 0 4px 0',
    lineHeight: '1.4',
  },
  variantName: {
    fontSize: '12px',
    color: '#6D7588',
    margin: '0 0 8px 0',
  },
  tierBadge: {
    display: 'inline-block',
    backgroundColor: '#F3F4F5',
    color: '#31353B',
    fontSize: '11px',
    padding: '3px 6px',
    borderRadius: '4px',
    fontWeight: '600',
    marginBottom: '6px',
    marginRight: '4px',
  },
  discountBadge: {
    display: 'inline-block',
    backgroundColor: '#FFEAEC',
    color: '#FF5C6F',
    fontSize: '11px',
    padding: '3px 6px',
    borderRadius: '4px',
    fontWeight: '700',
    marginBottom: '6px',
  },
  stockText: {
    fontSize: '12px',
    color: '#31353B',
    marginBottom: '12px',
  },
  actionRow: {
    display: 'flex',
    gap: '6px',
  },
  qtyInput: {
    width: '50px',
    padding: '6px',
    borderRadius: '6px',
    border: '1px solid #E5E7E9',
    textAlign: 'center',
  },
  btnAddToCart: {
    flex: 1,
    backgroundColor: '#00AA5B',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '700',
    fontSize: '12px',
    cursor: 'pointer',
  },
  cartSidebar: {
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 1px 6px 0 rgba(49,53,59,0.12)',
    position: 'sticky',
    top: '90px',
  },
  cartItemsList: {
    maxHeight: '240px',
    overflowY: 'auto',
    marginBottom: '16px',
  },
  cartItemRow: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: '1px solid #F3F4F5',
    fontSize: '13px',
  },
  cartItemName: {
    fontWeight: '600',
    color: '#212121',
  },
  cartItemSub: {
    color: '#6D7588',
    fontSize: '11px',
  },
  cartItemPrice: {
    fontWeight: '700',
    color: '#212121',
  },
  totalSummaryContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: '16px 0',
    borderTop: '2px dashed #E5E7E9',
    paddingTop: '16px',
  },
  totalPriceText: {
    fontSize: '18px',
    fontWeight: '800',
    color: '#FF5722',
  },
  btnCheckout: {
    width: '100%',
    backgroundColor: '#00AA5B',
    color: '#FFFFFF',
    border: 'none',
    padding: '12px',
    borderRadius: '8px',
    fontWeight: '700',
    fontSize: '15px',
    cursor: 'pointer',
    boxShadow: '0 4px 10px rgba(0, 170, 91, 0.2)',
  },
  btnRefresh: {
    backgroundColor: '#F3F4F5',
    border: '1px solid #CDD0D4',
    padding: '6px 12px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '600',
  },
  emptyStateContainer: {
    textAlign: 'center',
    padding: '40px 0',
  },
  invoiceCard: {
    border: '1px solid #E5E7E9',
    borderRadius: '8px',
    padding: '16px',
    marginBottom: '16px',
    backgroundColor: '#FFFFFF',
    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
  },
  invoiceHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottom: '1px dashed #E5E7E9',
    paddingBottom: '12px',
    marginBottom: '12px',
  },
  invoiceId: {
    fontWeight: '700',
    fontSize: '15px',
    color: '#212121',
  },
  invoiceDate: {
    fontSize: '12px',
    color: '#6D7588',
    marginTop: '2px',
  },
  unpaidStatusBadge: {
    backgroundColor: '#FFF4E5',
    color: '#F2994A',
    padding: '4px 10px',
    borderRadius: '6px',
    fontSize: '12px',
    fontWeight: '700',
  },
  invoiceBody: {
    marginBottom: '16px',
  },
  invoiceTotalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '10px',
    backgroundColor: '#F8F9FA',
    padding: '8px 12px',
    borderRadius: '6px',
  },
  invoiceTotalAmount: {
    fontWeight: '700',
    color: '#FF5722',
  },
  btnFulfill: {
    backgroundColor: '#00AA5B',
    color: '#FFFFFF',
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    fontWeight: '700',
    fontSize: '13px',
    cursor: 'pointer',
  }
};