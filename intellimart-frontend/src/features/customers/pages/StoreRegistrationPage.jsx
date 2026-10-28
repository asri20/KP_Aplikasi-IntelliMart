import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function StoreRegistrationPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/register-store', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        alert(data.message);
        // Setelah sukses mendaftar, arahkan ke halaman /reseller
        navigate('/reseller');
      } else {
        alert('Gagal: ' + data.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan koneksi ke server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-xl border border-zinc-200/80 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Pendaftaran Toko Reseller</h1>
          <p className="text-sm text-zinc-500 mt-1">Lengkapi informasi akun dan alamat tokomu untuk mulai berjualan.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1">Nama Pemilik Toko</label>
            <input 
              type="text" 
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="Masukkan nama lengkap..."
              className="w-full bg-zinc-100 border border-transparent focus:border-orange-500 focus:bg-white p-3 rounded-xl text-sm outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1">Email</label>
            <input 
              type="email" 
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="nama@email.com"
              className="w-full bg-zinc-100 border border-transparent focus:border-orange-500 focus:bg-white p-3 rounded-xl text-sm outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1">No. Telepon / WhatsApp</label>
            <input 
              type="text" 
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              placeholder="08xxxxxxxxxx"
              className="w-full bg-zinc-100 border border-transparent focus:border-orange-500 focus:bg-white p-3 rounded-xl text-sm outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1">Alamat Toko</label>
            <textarea 
              name="address"
              rows="3"
              required
              value={formData.address}
              onChange={handleChange}
              placeholder="Masukkan alamat lengkap tokomu..."
              className="w-full bg-zinc-100 border border-transparent focus:border-orange-500 focus:bg-white p-3 rounded-xl text-sm outline-none transition-all resize-none"
            ></textarea>
          </div>

          <div>
            <label className="block text-sm font-semibold text-zinc-700 mb-1">Password</label>
            <input 
              type="password" 
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full bg-zinc-100 border border-transparent focus:border-orange-500 focus:bg-white p-3 rounded-xl text-sm outline-none transition-all"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-orange-600 hover:bg-orange-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-sm disabled:opacity-50 mt-2"
          >
            {loading ? 'Memproses Pendaftaran...' : 'Daftar & Buka Toko Sekarang'}
          </button>
        </form>
      </div>
    </div>
  );
}