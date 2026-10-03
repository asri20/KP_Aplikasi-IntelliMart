import PropTypes from 'prop-types';

import { Badge } from '@shared/components/atoms';
import { formatCurrency, formatNumber } from '@shared/lib/utils/format';

// Warna badge per kategori. Fallback 'default' kalau kategori belum terdaftar di sini.
// TODO: pas integrasi API, tone ini bisa dipetakan dari tm_category (atau di-assign random/cycle).
const CATEGORY_TONES = Object.freeze({
  'Makanan Instan': 'primary',
  Minuman: 'info',
  Snack: 'purple',
  Sembako: 'success',
  'Perawatan Rumah': 'warning',
  'Perlengkapan Rumah': 'danger',
});

const ProductTable = ({ products }) => {
  return (
    <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-orange-50/50 text-xs font-semibold text-slate-500">
            <tr>
              <th className="px-5 py-3">No</th>
              <th className="px-5 py-3">Gambar</th>
              <th className="px-5 py-3">Nama Produk</th>
              <th className="px-5 py-3">SKU</th>
              <th className="px-5 py-3">Kategori</th>
              <th className="px-5 py-3">Harga Beli</th>
              <th className="px-5 py-3">Harga Jual</th>
              <th className="px-5 py-3">Satuan</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Aksi</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {products.map((product, index) => {
              const isOutOfStock = product.stock === 0;

              return (
                <tr key={product.sku} className="transition hover:bg-orange-50/30">
                  <td className="px-5 py-3 text-slate-400">{index + 1}</td>

                  <td className="px-5 py-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-lg">
                      {product.emoji}
                    </div>
                  </td>

                  <td className="whitespace-nowrap px-5 py-3 font-semibold text-slate-700">
                    {product.name}
                  </td>

                  <td className="whitespace-nowrap px-5 py-3 text-slate-400">
                    SKU{product.sku}
                  </td>

                  <td className="px-5 py-3">
                    <Badge variant={CATEGORY_TONES[product.category] ?? 'default'}>
                      {product.category}
                    </Badge>
                  </td>

                  <td className="whitespace-nowrap px-5 py-3 text-slate-500">
                    {formatCurrency(product.buyPrice)}
                  </td>

                  <td className="whitespace-nowrap px-5 py-3 font-semibold text-slate-700">
                    {formatCurrency(product.sellPrice)}
                  </td>

                  <td className="whitespace-nowrap px-5 py-3 text-slate-500">
                    {formatNumber(product.stock)} {product.unit}
                  </td>

                  <td className="whitespace-nowrap px-5 py-3">
                    <Badge variant={isOutOfStock ? 'danger' : 'success'}>
                      {isOutOfStock ? 'Stok Habis' : 'Aktif'}
                    </Badge>
                  </td>

                  <td className="whitespace-nowrap px-5 py-3">
                    <div className="flex items-center gap-2 text-sm">
                      <button type="button" aria-label="Edit produk" className="hover:opacity-70">
                        ✏️
                      </button>
                      <button type="button" aria-label="Lihat produk" className="hover:opacity-70">
                        👁️
                      </button>
                      <button type="button" aria-label="Hapus produk" className="hover:opacity-70">
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination - UI saja, logic pagination menyusul pas integrasi API */}
      <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <span>Menampilkan 1-{products.length} dari 28 produk</span>

        <div className="flex items-center gap-1">
          {[1, 2, 3, 4].map((page) => (
            <button
              key={page}
              type="button"
              className={`flex h-7 w-7 items-center justify-center rounded-lg font-medium transition ${
                page === 1
                  ? 'bg-orange-500 text-white'
                  : 'text-slate-500 hover:bg-orange-50'
              }`}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-orange-50"
            aria-label="Halaman berikutnya"
          >
            ›
          </button>
        </div>
      </div>
    </section>
  );
};

ProductTable.propTypes = {
  products: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      sku: PropTypes.string.isRequired,
      category: PropTypes.string.isRequired,
      buyPrice: PropTypes.number.isRequired,
      sellPrice: PropTypes.number.isRequired,
      stock: PropTypes.number.isRequired,
      unit: PropTypes.string.isRequired,
      emoji: PropTypes.string,
    })
  ).isRequired,
};

export default ProductTable;
