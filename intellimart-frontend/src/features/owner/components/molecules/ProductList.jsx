import { useNavigate } from 'react-router-dom';

const formatRupiah = (val) =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(val) || 0);

const ProductList = ({ products = [] }) => {
  const navigate = useNavigate();

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold text-slate-900">🔥 Produk Terlaris</h3>

        <button
          type="button"
          onClick={() => navigate('/produk')}
          className="text-xs font-semibold text-orange-500 hover:text-orange-600"
        >
          Lihat Semua →
        </button>
      </div>

      {products.length === 0 ? (
        <p className="py-8 text-center text-sm text-slate-400">
          Belum ada data penjualan produk pada toko ini.
        </p>
      ) : (
        <div className="divide-y divide-slate-100">
          {products.map((product, index) => {
            const name =
              product.product_name ||
              product.variant_name ||
              product.name ||
              'Produk';
            const qty = Number(
              product.total_qty_sold ?? product.quantity ?? 0
            );
            const revenue = Number(
              product.total_revenue ?? product.revenue ?? 0
            );

            return (
              <div
                key={`${name}-${index}`}
                className="flex items-center gap-3 py-3"
              >
                <span className="w-5 text-center text-sm font-bold text-orange-500">
                  {index + 1}
                </span>

                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50 text-lg">
                  🛍️
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-700">
                    {name}
                  </p>
                  <p className="text-xs text-slate-400">Terjual {qty} item</p>
                </div>

                <p className="text-sm font-bold text-orange-500">
                  {formatRupiah(revenue)}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default ProductList;
