import React from 'react';

export default function CustomerTable({ customers, loading }) {
  // 1. LOADING SKELETON (Animasi berdenyut saat memuat data)
  if (loading) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 text-xs font-semibold uppercase tracking-wider text-zinc-400">
              <th className="py-3 px-4">Pelanggan</th>
              <th className="py-3 px-4">Kontak</th>
              <th className="py-3 px-4">Alamat</th>
              <th className="py-3 px-4">Tipe / Segmen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {[1, 2, 3].map((item) => (
              <tr key={item} className="animate-pulse">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-zinc-200"></div>
                    <div className="space-y-2">
                      <div className="h-4 bg-zinc-200 rounded w-28"></div>
                      <div className="h-3 bg-zinc-200 rounded w-16"></div>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4 space-y-2">
                  <div className="h-4 bg-zinc-200 rounded w-24"></div>
                  <div className="h-3 bg-zinc-200 rounded w-32"></div>
                </td>
                <td className="py-4 px-4">
                  <div className="h-4 bg-zinc-200 rounded w-40"></div>
                </td>
                <td className="py-4 px-4">
                  <div className="h-6 bg-zinc-200 rounded-full w-24"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // 2. EMPTY STATE (Tampilan jika data kosong atau tidak ditemukan pencarian)
  if (!customers || customers.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="w-16 h-16 bg-orange-50 text-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl shadow-sm">
          🔍
        </div>
        <h3 className="text-base font-bold text-zinc-800">Tidak ada pelanggan ditemukan</h3>
        <p className="text-zinc-400 text-sm mt-1 max-w-sm mx-auto">
          Belum ada data pelanggan yang terdaftar atau kata kunci pencarian kamu tidak cocok dengan data yang ada.
        </p>
      </div>
    );
  }

  const getInitials = (name) => {
    if (!name) return 'C';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-zinc-200 text-xs font-semibold uppercase tracking-wider text-zinc-400">
            <th className="py-3 px-4">Pelanggan</th>
            <th className="py-3 px-4">Kontak</th>
            <th className="py-3 px-4">Alamat</th>
            <th className="py-3 px-4">Tipe / Segmen</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 text-sm">
          {customers.map((customer, index) => {
            const type = (customer.customer_type || 'RETAIL').toUpperCase();
            // Diubah dari WHOLESALE ke RESELLER
            const isReseller = type === 'RESELLER';

            return (
              <tr key={customer.user_id || index} className="hover:bg-zinc-50/50 transition-colors">
                <td className="py-4 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-700 font-bold flex items-center justify-center text-xs shadow-sm">
                      {getInitials(customer.name)}
                    </div>
                    <div>
                      <div className="font-semibold text-zinc-800">{customer.name}</div>
                      <div className="text-xs text-zinc-400">ID: #{customer.user_id}</div>
                    </div>
                  </div>
                </td>

                <td className="py-4 px-4">
                  <div className="text-zinc-800 font-medium">{customer.phone || '-'}</div>
                  <div className="text-xs text-zinc-400">{customer.email}</div>
                </td>

                <td className="py-4 px-4">
                  <div className="text-zinc-600 max-w-xs truncate" title={customer.address || '-'}>
                    {customer.address || '-'}
                  </div>
                </td>

                <td className="py-4 px-4">
                  <span className={`px-3 py-1 text-xs font-semibold rounded-full inline-block ${
                    isReseller 
                      ? 'bg-purple-50 text-purple-700 border border-purple-200/60' 
                      : 'bg-blue-50 text-blue-700 border border-blue-200/60'
                  }`}>
                    {isReseller ? 'Reseller / Wholesale' : 'Reguler / Retail'}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}