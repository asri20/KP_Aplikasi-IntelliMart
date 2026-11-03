const transactions = [
  {
    id: 'TRX-20260923-001',
    time: '09:23',
    product: '3 item',
    total: 'Rp 78.000',
    method: 'Tunai',
  },
  {
    id: 'TRX-20260923-002',
    time: '09:17',
    product: '5 item',
    total: 'Rp 152.000',
    method: 'QRIS',
  },
  {
    id: 'TRX-20260923-003',
    time: '08:54',
    product: '2 item',
    total: 'Rp 64.000',
    method: 'Tunai',
  },
  {
    id: 'TRX-20260923-004',
    time: '08:32',
    product: '4 item',
    total: 'Rp 121.000',
    method: 'Kartu',
  },
  {
    id: 'TRX-20260923-005',
    time: '08:15',
    product: '1 item',
    total: 'Rp 32.000',
    method: 'QRIS',
  },
];

const TransactionTable = () => {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="flex items-center justify-between p-6">
        <h3 className="font-bold text-slate-900">
          🕐 Transaksi Terbaru
        </h3>

        <button className="text-xs font-semibold text-orange-500 hover:text-orange-600">
          Lihat Semua →
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-orange-50/50 text-slate-500">
            <tr>
              <th className="px-5 py-3 font-semibold">
                No. Transaksi
              </th>
              <th className="px-5 py-3 font-semibold">Waktu</th>
              <th className="px-5 py-3 font-semibold">Produk</th>
              <th className="px-5 py-3 font-semibold">Total</th>
              <th className="px-5 py-3 font-semibold">Metode</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {transactions.map((transaction) => (
              <tr
                key={transaction.id}
                className="transition hover:bg-orange-50/30"
              >
                <td className="whitespace-nowrap px-5 py-3 font-medium text-slate-700">
                  {transaction.id}
                </td>

                <td className="px-5 py-3 text-slate-400">
                  {transaction.time}
                </td>

                <td className="px-5 py-3 text-slate-500">
                  {transaction.product}
                </td>

                <td className="whitespace-nowrap px-5 py-3 font-semibold text-slate-700">
                  {transaction.total}
                </td>

                <td className="px-5 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 font-medium ${
                      transaction.method === 'Tunai'
                        ? 'bg-emerald-50 text-emerald-600'
                        : transaction.method === 'QRIS'
                          ? 'bg-blue-50 text-blue-600'
                          : 'bg-purple-50 text-purple-600'
                    }`}
                  >
                    {transaction.method}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default TransactionTable;