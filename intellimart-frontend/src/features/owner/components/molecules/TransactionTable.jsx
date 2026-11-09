import { useNavigate } from 'react-router-dom';

const formatRupiah = (val) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(val) || 0);

const TransactionTable = ({ transactions = [] }) => {
  const navigate = useNavigate();

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="flex items-center justify-between p-6">
        <h3 className="font-bold text-slate-900">🕐 Transaksi Terbaru</h3>

        <button
          type="button"
          onClick={() => navigate('/penjualan')}
          className="text-xs font-semibold text-orange-500 hover:text-orange-600"
        >
          Lihat Semua →
        </button>
      </div>

      {transactions.length === 0 ? (
        <p className="px-6 pb-8 text-center text-sm text-slate-400">
          Belum ada transaksi pada toko ini.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-orange-50/50 text-slate-500">
              <tr>
                <th className="px-5 py-3 font-semibold">No. Transaksi</th>
                <th className="px-5 py-3 font-semibold">Waktu</th>
                <th className="px-5 py-3 font-semibold">Item</th>
                <th className="px-5 py-3 font-semibold">Total</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {transactions.map((trx) => {
                const code =
                  trx.invoice_no || `TRX-${String(trx.id).padStart(4, '0')}`;
                const time = trx.created_at
                  ? new Date(trx.created_at).toLocaleTimeString('id-ID', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : '-';
                const itemsCount = Number(trx.total_items ?? 1);
                const status = String(trx.status || 'PAID').toUpperCase();

                return (
                  <tr key={trx.id || code} className="transition hover:bg-orange-50/30">
                    <td className="whitespace-nowrap px-5 py-3 font-medium text-slate-700">
                      {code}
                    </td>

                    <td className="px-5 py-3 text-slate-400">{time}</td>

                    <td className="px-5 py-3 text-slate-500">
                      {itemsCount} item
                    </td>

                    <td className="whitespace-nowrap px-5 py-3 font-semibold text-slate-700">
                      {formatRupiah(trx.total_price)}
                    </td>

                    <td className="px-5 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 font-medium ${
                          status === 'LUNAS' || status === 'PAID' || status === 'SUCCESS'
                            ? 'bg-emerald-50 text-emerald-600'
                            : 'bg-amber-50 text-amber-600'
                        }`}
                      >
                        {status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};

export default TransactionTable;
