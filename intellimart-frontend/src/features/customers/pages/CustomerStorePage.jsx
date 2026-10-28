import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Sesuaikan path import servis produk kamu nanti
// import { productService } from '../services/productService'; 

export default function CustomerStorePage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([
    // Data dummy sementara sebagai contoh produk toko
    { id: 1, name: 'Kripik Singkong Pedas Manis', price: 15000, stock: 25, category: 'Cemilan', image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400' },
    { id: 2, name: 'Kopi Susu Gula Aren Literan', price: 45000, stock: 10, category: 'Minuman', image: 'https://images.unsplash.com/photo-1517701550927-30cf4ba1dba5?w=400' },
    { id: 3, name: 'Tas Tote Bag Kanvas Aesthetic', price: 65000, stock: 15, category: 'Fashion', image: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=400' },
  ]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);

  // Filter produk berdasarkan pencarian
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddToCart = (product) => {
    setCartCount(prev => prev + 1);
    alert(`Berhasil menambahkan ${product.name} ke keranjang belanja!`);
  };

  return (
    <div className="min-h-screen bg-zinc-50 pb-12">
      {/* 1. Navbar E-Commerce Pelanggan */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-orange-600 tracking-tight">InteliMart</span>
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-medium">Store</span>
          </div>

          {/* Search Bar ala Marketplace */}
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

          {/* Keranjang & Menu Account */}
          <div className="flex items-center gap-3">
            <button className="relative p-2 bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-100 transition-colors flex items-center gap-2 px-4">
              <span>🛒</span>
              <span className="text-sm font-semibold">Keranjang</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Dropdown Menu Account / TokoMu */}
            <div className="relative">
              <button 
                onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                className="p-2 bg-zinc-100 text-zinc-700 rounded-xl hover:bg-zinc-200 transition-colors flex items-center gap-2 px-3 text-sm font-medium"
              >
                <span>👤</span>
                <span>Akun</span>
              </button>

              {isAccountMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-zinc-200 rounded-2xl shadow-lg py-2 z-50">
                  <div className="px-4 py-2 border-b border-zinc-100">
                    <p className="text-xs text-zinc-400">Masuk sebagai</p>
                    <p className="text-sm font-bold text-zinc-800">Customer</p>
                  </div>
                  
                  {/* Tombol langsung ke Dashboard Reseller / TokoMu */}
                  <button 
                    onClick={() => navigate('/reseller')}
                    className="w-full text-left px-4 py-2.5 text-sm text-orange-600 font-semibold hover:bg-orange-50 transition-colors flex items-center gap-2"
                  >
                    <span>🏪</span> TokoMu
                  </button>

                  {/* Tombol untuk Pendaftaran Toko Baru */}
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

      {/* 2. Hero Banner Toko */}
      <main className="max-w-7xl mx-auto px-6 mt-8 space-y-8">
        <div className="bg-gradient-to-r from-orange-600 to-amber-500 rounded-3xl p-8 text-white shadow-md flex flex-col justify-center">
          <span className="text-xs font-semibold uppercase tracking-widest bg-white/20 w-max px-3 py-1 rounded-full mb-3">Belanja Mudah & Cepat</span>
          <h1 className="text-3xl font-bold tracking-tight">Temukan Produk Terbaik Pilihan Reseller Kami!</h1>
          <p className="text-orange-100 text-sm mt-2 max-w-xl">Dapatkan berbagai barang berkualitas langsung dari para penjual terpercaya di InteliMart.</p>
        </div>

        {/* 3. Katalog Produk Grid */}
        <div>
          <h2 className="text-xl font-bold text-zinc-900 mb-4">Katalog Produk</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl border border-zinc-200/80 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow">
                <div className="h-48 bg-zinc-100 overflow-hidden relative">
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" 
                  />
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
      </main>
    </div>
  );
}