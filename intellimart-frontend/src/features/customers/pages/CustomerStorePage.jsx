import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function CustomerStorePage() {
  const navigate = useNavigate();
  const [products] = useState([
    { id: 1, name: 'Kripik Singkong Pedas Manis', price: 15000, stock: 25, category: 'Cemilan', image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400' },
    { id: 2, name: 'Kopi Susu Gula Aren Literan', price: 45000, stock: 10, category: 'Minuman', image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400' },
    { id: 3, name: 'Tas Tote Bag Kanvas Aesthetic', price: 65000, stock: 15, category: 'Fashion', image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400' },
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  
  // State Keranjang Belanja (Menyimpan daftar item yang dipilih)
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  
  // State untuk Riwayat
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' atau 'history'
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const userId = 1; // ID user aktif sementara

  // Fungsi Tambah ke Keranjang
  const handleAddToCart = (product) => {
    setCart(prevCart => {
      const existing = prevCart.find(item => item.id === product.id);
      if (existing) {
        return prevCart.map(item => 
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    alert(`Berhasil menambahkan ${product.name} ke keranjang!`);
  };

  // Hitung Total Belanja
  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Fungsi Proses Checkout (Mengirim data transaksi ke Backend)
  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Keranjang belanja masih kosong!');
      return;
    }

    try {
      setIsCheckingOut(true);
      const response = await fetch('http://localhost:5000/api/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          total_amount: totalAmount,
          items: cart.map(item => ({
            product_id: item.id,
            quantity: item.quantity,
            price: item.price
          }))
        }),
      });

      const result = await response.json();

      if (response.ok || result.success) {
        alert('Checkout berhasil! Transaksi telah dicatat.');
        setCart([]); // Kosongkan keranjang
        setIsCartOpen(false); // Tutup modal keranjang
        setActiveTab('history'); // Pindah otomatis ke tab riwayat
        fetchHistory(); // Ambil data riwayat terbaru
      } else {
        alert(result.message || 'Gagal melakukan checkout.');
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Terjadi kesalahan koneksi saat memproses checkout.');
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Fungsi Ambil Riwayat dari Backend
  const fetchHistory = async () => {
    try {
      setLoadingHistory(true);
      const response = await fetch(`http://localhost:5000/api/history/${userId}`);
      const result = await response.json();
      if (result.success) {
        setHistory(result.data);
      }
    } catch (err) {
      console.error('Gagal memuat riwayat:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  const handleOpenHistory = () => {
    setActiveTab('history');
    setIsAccountMenuOpen(false);
    fetchHistory();
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-zinc-50 pb-12">
      {/* 1. Navbar E-Commerce Pelanggan */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('catalog')}>
            <span className="text-2xl font-black text-orange-600 tracking-tight">IntelliMart</span>
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">Store</span>
          </div>

          {activeTab === 'catalog' && (
            <div className="flex-1 max-w-xl">
              <div className="relative">
                <input 
                  type="text"
                  placeholder="Cari produk kebutuhanmu di sini..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-zinc-100 border border-transparent focus:border-orange-500 focus:bg-white px-4 py-2 rounded-xl text-sm outline-none transition-all"
                />
              </div>
            </div>
          )}

          <div className="flex items-center gap-3">
            {/* Tombol Buka Keranjang */}
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-100 transition-colors flex items-center gap-2 px-4"
            >
              <span>🛒</span>
              <span className="text-sm font-semibold">Keranjang</span>
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>

            {/* Menu Dropdown Akun */}
            <div className="relative">
              <button 
                onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                className="p-2 bg-zinc-100 text-zinc-700 rounded-xl hover:bg-zinc-200 transition-colors flex items-center gap-2 px-3 text-sm font-medium"
              >
                <span>👤</span>
                <span>Akun</span>
              </button>

              {isAccountMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-zinc-200 rounded-2xl shadow-lg py-2 z-50">
                  <div className="px-4 py-2 border-b border-zinc-100">
                    <p className="text-xs text-zinc-400">Masuk sebagai</p>
                    <p className="text-sm font-bold text-zinc-800">Customer</p>
                  </div>
                  
                  <button 
                    onClick={handleOpenHistory}
                    className="w-full text-left px-4 py-2.5 text-sm text-zinc-700 font-medium hover:bg-zinc-50 transition-colors flex items-center gap-2"
                  >
                    <span>📦</span> Riwayat Pembelian
                  </button>
                  
                  <button 
                    onClick={() => navigate('/reseller')}
                    className="w-full text-left px-4 py-2.5 text-sm text-orange-600 font-semibold hover:bg-orange-50 transition-colors flex items-center gap-2"
                  >
                    <span>🏪</span> TokoMu
                  </button>

                  <button 
                    onClick={() => navigate('/daftartoko')}
                    className="w-full text-left px-4 py-2.5 text-sm text-zinc-700 font-medium hover:bg-zinc-50 transition-colors flex items-center gap-2"
                  >
                    <span>🏬</span> Buka Toko Saya
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 2. Modal Keranjang Belanja */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl space-y-4">
            <div className="flex justify-between items-center border-b pb-3">
              <h3 className="font-bold text-lg text-zinc-900">Keranjang Belanja Kamu</h3>
              <button onClick={() => setIsCartOpen(false)} className="text-zinc-400 hover:text-zinc-700 font-bold">✕</button>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-3">
              {cart.length > 0 ? (
                cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center text-sm border-b pb-2">
                    <div>
                      <p className="font-medium text-zinc-800">{item.name}</p>
                      <p className="text-zinc-500">{item.quantity}x @ Rp {item.price.toLocaleString('id-ID')}</p>
                    </div>
                    <span className="font-semibold text-orange-600">
                      Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-center text-zinc-400 py-6">Keranjang masih kosong.</p>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t pt-3 space-y-3">
                <div className="flex justify-between font-bold text-base text-zinc-900">
                  <span>Total Pembayaran:</span>
                  <span className="text-orange-600">Rp {totalAmount.toLocaleString('id-ID')}</span>
                </div>
                <button 
                  onClick={handleCheckout}
                  disabled={isCheckingOut}
                  className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl shadow-md transition-colors disabled:bg-zinc-300"
                >
                  {isCheckingOut ? 'Memproses Transaksi...' : 'Checkout Sekarang'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Main Content Area */}
      <main className="max-w-7xl mx-auto px-6 mt-8 space-y-8">
        {activeTab === 'catalog' ? (
          <>
            <div className="bg-gradient-to-r from-orange-600 to-amber-500 rounded-3xl p-8 text-white shadow-md flex flex-col justify-center">
              <span className="text-xs font-semibold uppercase tracking-widest bg-white/20 w-max px-3 py-1 rounded-full mb-3">Belanja Mudah & Cepat</span>
              <h1 className="text-3xl font-bold tracking-tight">Temukan Produk Terbaik Pilihan Reseller Kami!</h1>
              <p className="text-orange-100 text-sm mt-2 max-w-xl">Dapatkan berbagai barang berkualitas langsung dari para penjual terpercaya di InteliMart.</p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-zinc-900 mb-4">Katalog Produk</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                    <div className="h-48 bg-zinc-100 overflow-hidden relative">
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
                      <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-md text-white text-xs px-2.5 py-1 rounded-lg">
                        {product.category}
                      </span>
                    </div>
                    <div className="p-4 flex flex-col flex-1 justify-between space-y-4">
                      <div>
                        <h3 className="font-semibold text-zinc-800 line-clamp-2">{product.name}</h3>
                        <div className="text-orange-600 font-bold text-lg mt-1">
                          Rp {product.price.toLocaleString('id-ID')}
                        </div>
                        <div className="text-xs text-zinc-400 mt-1">Stok: {product.stock} tersisa</div>
                      </div>
                      <button 
                        onClick={() => handleAddToCart(product)}
                        className="w-full py-2 bg-orange-600 hover:bg-orange-700 text-white font-medium rounded-xl text-sm transition-colors"
                      >
                        + Masukkan Keranjang
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* Tampilan Riwayat Pembelian */
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-zinc-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-zinc-900">Riwayat Pembelian Saya</h2>
              <button 
                onClick={() => setActiveTab('catalog')}
                className="px-4 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 rounded-xl text-sm font-medium transition-colors"
              >
                &larr; Kembali ke Katalog
              </button>
            </div>

            {loadingHistory ? (
              <p className="text-zinc-500 py-8 text-center">Memuat riwayat transaksi...</p>
            ) : (
              <div className="overflow-hidden border border-zinc-200 rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-zinc-100 text-zinc-600 text-sm border-b border-zinc-200">
                      <th className="p-3">ID Transaksi</th>
                      <th className="p-3">Tanggal</th>
                      <th className="p-3">Total Belanja</th>
                      <th className="p-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.length > 0 ? (
                      history.map((item) => (
                        <tr key={item.id || item.transaction_id} className="border-b border-zinc-100 text-sm text-zinc-700 hover:bg-zinc-50">
                          <td className="p-3 font-medium">#{item.id || item.transaction_id}</td>
                          <td className="p-3">{new Date(item.transaction_date).toLocaleDateString('id-ID')}</td>
                          <td className="p-3">Rp {Number(item.total_amount).toLocaleString('id-ID')}</td>
                          <td className="p-3">
                            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-700">
                              {item.status || 'SUCCESS'}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="4" className="p-8 text-center text-zinc-400">
                          Belum ada riwayat transaksi ditemukan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}