import React, { useState, useEffect } from 'react';

export default function CustomerHistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userId = 1; // Ganti dengan ID user yang sedang aktif

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/history/${userId}`);
        const result = await response.json();

        if (result.success) {
          setHistory(result.data);
        } else {
          setError(result.message || 'Gagal memuat riwayat.');
        }
      } catch (err) {
        console.error('Error fetching history:', err);
        setError('Terjadi kesalahan pada koneksi server.');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [userId]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-zinc-800">Riwayat Pembelian Pelanggan</h1>
      
      {loading && <p className="text-zinc-500">Memuat data riwayat...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden border border-zinc-200">
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
                  <td colSpan="4" className="p-6 text-center text-zinc-400">
                    Belum ada riwayat transaksi ditemukan.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}