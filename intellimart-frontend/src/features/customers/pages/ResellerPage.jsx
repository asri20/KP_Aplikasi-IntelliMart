import React, { useState, useEffect } from 'react';
import { customerService } from '../services/customerService';

export default function ResellerPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('pelanggan');

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await customerService.getAllCustomers();
      const allData = data.data || data;
      setCustomers(allData);
    } catch (err) {
      setError('Gagal memuat data reseller dari server.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filteredCustomers = customers.filter(customer => {
    const name = (customer.name || '').toLowerCase();
    const email = (customer.email || '').toLowerCase();
    const search = (searchTerm || '').toLowerCase();
    return name.includes(search) || email.includes(search);
  });

  return (
    <div className="min-h-screen bg-slate-100 flex font-sans">
      
      {/* Sidebar InteliMart Seller */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col">
        <div className="p-6 border-b border-slate-100 flex items-center space-x-3">
          <div className="w-10 h-10 bg-orange-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md">
            I
          </div>
          <div>
            <h2 className="font-bold text-slate-800 text-base">InteliMart Seller</h2>
            <p className="text-xs text-orange-600 font-medium">Status: Aktif / Reseller</p>
          </div>
        </div>

        <nav className="p-4 space-y-1 flex-1">
          <button 
            onClick={() => setActiveTab('pelanggan')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'pelanggan' ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>👥</span>
            <span>Daftar Pelanggan / Relasi</span>
          </button>
          <button 
            onClick={() => setActiveTab('produk')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'produk' ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>📦</span>
            <span>Kelola Produk Toko</span>
          </button>
          <button 
            onClick={() => setActiveTab('pesanan')}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'pesanan' ? 'bg-orange-50 text-orange-600 font-semibold' : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span>📋</span>
            <span>Daftar Pesanan Masuk</span>
          </button>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <a 
            href="/store" 
            className="w-full flex items-center justify-center px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-medium transition-colors"
          >
            ← Kembali ke Storefront
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Top Header */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex justify-between items-center sticky top-0 z-10">
          <div>
            <h1 className="text-xl font-bold text-slate-800">Dashboard Toko Reseller</h1>
            <p className="text-xs text-slate-500">Kelola performa toko dan jaringan pelangganmu dengan mudah.</p>
          </div>
          <div className="flex items-center space-x-3">
            <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
              Verified Merchant
            </span>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-8 space-y-6 max-w-7xl w-full mx-auto">
          
          {/* Kartu Statistik Toko */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Pelanggan Terdaftar</p>
                <h3 className="text-3xl font-bold text-slate-800 mt-1">{customers.length}</h3>
              </div>
              <div className="p-4 bg-orange-50 text-orange-600 rounded-2xl text-2xl">👥</div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Status Toko</p>
                <h3 className="text-lg font-bold text-orange-600 mt-1">Buka / Aktif</h3>
              </div>
              <div className="p-4 bg-orange-50 text-orange-600 rounded-2xl text-2xl">🏪</div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Reputasi Toko</p>
                <h3 className="text-lg font-bold text-amber-500 mt-1">★ 4.9 (Gold Merchant)</h3>
              </div>
              <div className="p-4 bg-amber-50 text-amber-500 rounded-2xl text-2xl">⭐</div>
            </div>
          </div>

          {/* Tabel / Konten Utama Berdasarkan Tab */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-6">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-lg font-bold text-slate-800">
                {activeTab === 'pelanggan' && 'Daftar Relasi Pelanggan Toko'}
                {activeTab === 'produk' && 'Kelola Etalase Produk'}
                {activeTab === 'pesanan' && 'Daftar Pesanan Masuk'}
              </h2>

              {activeTab === 'pelanggan' && (
                <div className="w-full sm:w-72">
                  <input 
                    type="text" 
                    placeholder="Cari pelanggan..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 text-slate-800"
                  />
                </div>
              )}
            </div>

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                {error}
              </div>
            )}

            {/* Tabel Data Pelanggan */}
            {activeTab === 'pelanggan' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs font-semibold uppercase text-slate-400">
                      <th className="py-3 px-4">ID User</th>
                      <th className="py-3 px-4">Alamat Toko / Lokasi</th>
                      <th className="py-3 px-4">Tipe / Segmen</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                    {loading ? (
                      <tr>
                        <td colSpan="3" className="py-8 text-center text-slate-400">Memuat data...</td>
                      </tr>
                    ) : filteredCustomers.length === 0 ? (
                      <tr>
                        <td colSpan="3" className="py-8 text-center text-slate-400">Belum ada data pelanggan.</td>
                      </tr>
                    ) : (
                      filteredCustomers.map((c, index) => (
                        <tr key={index} className="hover:bg-slate-50 transition-colors">
                          <td className="py-4 px-4 font-medium text-slate-900">#User {c.user_id}</td>
                          <td className="py-4 px-4 text-slate-600">{c.address || '-'}</td>
                          <td className="py-4 px-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              c.customer_type === 'RESELLER' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                            }`}>
                              {c.customer_type || 'RETAIL'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'produk' && (
              <div className="py-12 text-center text-slate-400">
                <p className="text-4xl mb-2">📦</p>
                <p className="text-sm font-medium">Fitur manajemen etalase produk reseller akan segera hadir.</p>
              </div>
            )}

            {activeTab === 'pesanan' && (
              <div className="py-12 text-center text-slate-400">
                <p className="text-4xl mb-2">📋</p>
                <p className="text-sm font-medium">Belum ada pesanan masuk untuk toko Anda saat ini.</p>
              </div>
            )}

          </div>

        </div>
      </main>
    </div>
  );
}