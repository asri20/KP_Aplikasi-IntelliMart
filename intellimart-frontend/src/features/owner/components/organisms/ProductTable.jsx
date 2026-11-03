import PropTypes from 'prop-types';

import { Badge } from '@shared/components/atoms';
import { formatCurrency, formatNumber } from '@shared/lib/utils/format';

const CATEGORY_TONES = Object.freeze({
  'Makanan Instan': 'primary',
  Minuman: 'info',
  Snack: 'purple',
  Sembako: 'success',
  'Perawatan Rumah': 'warning',
  'Perlengkapan Rumah': 'danger',
});

const ProductTable = ({
  products,
  total,
  onEdit,
  onView,
  onDelete,
}) => {
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
            {products.length === 0 ? (
              <tr>
                <td
                  colSpan={10}
                  className="px-5 py-10 text-center text-slate-400"
                >
                  Belum ada produk.
                </td>
              </tr>
            ) : (
              products.map((product, index) => {
                const hasStock =
                  product.stock !== null &&
                  product.stock !== undefined;

                const isOutOfStock =
                  hasStock && Number(product.stock) === 0;

                const statusLabel = !product.isActive
                  ? 'Nonaktif'
                  : isOutOfStock
                    ? 'Stok Habis'
                    : 'Aktif';

                const statusVariant = !product.isActive
                  ? 'default'
                  : isOutOfStock
                    ? 'danger'
                    : 'success';

                // Produk bawaan memiliki ownerId null.
                const isOwnerProduct = product.ownerId != null;

                return (
                  <tr
                    key={product.id}
                    className="transition hover:bg-orange-50/30"
                  >
                    <td className="px-5 py-3 text-slate-400">
                      {index + 1}
                    </td>

                    <td className="px-5 py-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50 text-lg">
                        {product.emoji || '📦'}
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-5 py-3 font-semibold text-slate-700">
                      {product.name}
                    </td>

                    <td className="whitespace-nowrap px-5 py-3 text-slate-400">
                      {product.sku ?? '-'}
                    </td>

                    <td className="px-5 py-3">
                      <Badge
                        variant={
                          CATEGORY_TONES[product.category] ?? 'default'
                        }
                      >
                        {product.category ?? '-'}
                      </Badge>
                    </td>

                    <td className="whitespace-nowrap px-5 py-3 text-slate-500">
                      {product.buyPrice == null
                        ? '-'
                        : formatCurrency(product.buyPrice)}
                    </td>

                    <td className="whitespace-nowrap px-5 py-3 font-semibold text-slate-700">
                      {product.sellPrice == null
                        ? '-'
                        : formatCurrency(product.sellPrice)}
                    </td>

                    <td className="whitespace-nowrap px-5 py-3 text-slate-500">
                      {hasStock
                        ? `${formatNumber(product.stock)} `
                        : ''}
                      {product.unit ?? '-'}
                    </td>

                    <td className="whitespace-nowrap px-5 py-3">
                      <Badge variant={statusVariant}>
                        {statusLabel}
                      </Badge>
                    </td>

                    <td className="whitespace-nowrap px-5 py-3">
                      <div className="flex items-center gap-3 text-sm">
                        {isOwnerProduct ? (
                          <button
                            type="button"
                            aria-label={`Edit ${product.name}`}
                            title={`Edit ${product.name}`}
                            onClick={() => onEdit?.(product)}
                            className="cursor-pointer hover:opacity-70"
                          >
                            ✏️
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled
                            aria-label="Produk bawaan tidak dapat diedit"
                            title="Produk bawaan tidak dapat diedit"
                            className="cursor-not-allowed opacity-30"
                          >
                            ✏️
                          </button>
                        )}

                        <button
                          type="button"
                          aria-label={`Lihat ${product.name}`}
                          title={`Lihat ${product.name}`}
                          onClick={() => onView?.(product)}
                          className="cursor-pointer hover:opacity-70"
                        >
                          👁️
                        </button>

                        {isOwnerProduct ? (
                          <button
                            type="button"
                            aria-label={`Hapus ${product.name}`}
                            title={`Hapus ${product.name}`}
                            onClick={() => onDelete?.(product)}
                            className="cursor-pointer hover:opacity-70"
                          >
                            🗑️
                          </button>
                        ) : (
                          <button
                            type="button"
                            disabled
                            aria-label="Produk bawaan tidak dapat dihapus"
                            title="Produk bawaan tidak dapat dihapus"
                            className="cursor-not-allowed opacity-30"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
        <span>
          Menampilkan {products.length} dari {total ?? products.length} produk
        </span>

        <div className="flex items-center gap-1">
          {[1, 2, 3, 4].map((page) => (
            <button
              key={page}
              type="button"
              disabled
              className={`flex h-7 w-7 items-center justify-center rounded-lg font-medium transition ${
                page === 1
                  ? 'bg-orange-500 text-white'
                  : 'text-slate-500'
              }`}
              aria-label={`Halaman ${page}`}
            >
              {page}
            </button>
          ))}

          <button
            type="button"
            disabled
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500"
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
      id: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
      ]).isRequired,
      name: PropTypes.string.isRequired,
      ownerId: PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.string,
      ]),
      sku: PropTypes.string,
      category: PropTypes.string,
      buyPrice: PropTypes.number,
      sellPrice: PropTypes.number,
      stock: PropTypes.number,
      unit: PropTypes.string,
      isActive: PropTypes.bool,
      emoji: PropTypes.string,
    })
  ).isRequired,
  total: PropTypes.number,
  onEdit: PropTypes.func,
  onView: PropTypes.func,
  onDelete: PropTypes.func,
};

export default ProductTable;