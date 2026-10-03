import { OwnerSidebar, OwnerHeader, ProductTable } from '@features/owner/components/organisms';
import { StatCard } from '@features/owner/components/molecules';
import { Button } from '@shared/components/atoms';

// TODO: ganti dummy data ini dengan data dari tm_product + ms_product_variant + tr_product_stock
// (via productService) pas tahap integrasi API.
const products = [
  { name: 'Indomie Goreng', sku: 'IND001', category: 'Makanan Instan', buyPrice: 3000, sellPrice: 3500, stock: 245, unit: 'pcs', emoji: '🍜' },
  { name: 'Ultra Milk 1L', sku: 'ULM001', category: 'Minuman', buyPrice: 16000, sellPrice: 18500, stock: 120, unit: 'pcs', emoji: '🥛' },
  { name: 'Chitato Rasa Keju', sku: 'CHI001', category: 'Snack', buyPrice: 7500, sellPrice: 9000, stock: 80, unit: 'pcs', emoji: '🍟' },
  { name: 'Beras 5kg', sku: 'BR001', category: 'Sembako', buyPrice: 58000, sellPrice: 62000, stock: 45, unit: 'pcs', emoji: '🌾' },
  { name: 'Aqua 600ml', sku: 'AQU001', category: 'Minuman', buyPrice: 3500, sellPrice: 4500, stock: 0, unit: 'pcs', emoji: '💧' },
  { name: 'Rinso Deterjen 1kg', sku: 'RIN001', category: 'Perawatan Rumah', buyPrice: 12000, sellPrice: 15000, stock: 60, unit: 'pcs', emoji: '🧴' },
  { name: 'Kopi Good Day', sku: 'KOP001', category: 'Minuman', buyPrice: 11000, sellPrice: 14000, stock: 30, unit: 'pcs', emoji: '☕' },
  { name: 'Tisu Paseo', sku: 'TIS001', category: 'Perlengkapan Rumah', buyPrice: 8500, sellPrice: 11000, stock: 50, unit: 'pcs', emoji: '🧻' },
];

const ProdukPage = () => {
  return (
    <div className="min-h-screen bg-[#FFFDFC]">
      <div className="flex min-h-screen">
        <OwnerSidebar />

        <div className="flex min-w-0 flex-1 flex-col">
          <OwnerHeader />

          <main className="flex-1 p-6 lg:p-8">
            {/* Title + CTA */}
            <div className="mb-7 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-100 text-2xl">
                  📦
                </div>

                <div>
                  <h1 className="text-2xl font-bold text-slate-900 lg:text-3xl">
                    Produk
                  </h1>

                  <p className="mt-1 text-sm text-slate-500">
                    Kelola semua produk di toko Anda. Tambah, edit, dan atur stok dengan mudah.
                  </p>
                </div>
              </div>

              <Button variant="primary">+ Tambah Produk</Button>
            </div>

            {/* Statistics */}
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                icon="📦"
                tone="orange"
                title="Total Produk"
                value="28"
                description="Produk aktif di semua toko"
              />

              <StatCard
                icon="🏷️"
                tone="green"
                title="Kategori"
                value="8"
                description="Kategori produk"
              />

              <StatCard
                icon="📊"
                tone="blue"
                title="Stok Total"
                value="1.250 pcs"
                description="Total seluruh stok"
              />

              <StatCard
                icon="💎"
                tone="purple"
                title="Nilai Produk"
                value="Rp 18.500.000"
                description="Total nilai stok (HPP)"
              />
            </div>

            {/* Search + Filter */}
            <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  🔍
                </span>

                <input
                  type="text"
                  placeholder="Cari nama produk, SKU, atau kategori..."
                  className="w-full rounded-xl border border-orange-100 bg-white py-2.5 pl-11 pr-4 text-sm outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <select className="rounded-xl border border-orange-100 bg-white px-4 py-2.5 text-sm text-slate-600 outline-none">
                <option>Semua Kategori</option>
                <option>Makanan Instan</option>
                <option>Minuman</option>
                <option>Snack</option>
                <option>Sembako</option>
                <option>Perawatan Rumah</option>
                <option>Perlengkapan Rumah</option>
              </select>

              <select className="rounded-xl border border-orange-100 bg-white px-4 py-2.5 text-sm text-slate-600 outline-none">
                <option>Semua Status</option>
                <option>Aktif</option>
                <option>Stok Habis</option>
              </select>

              <button
                type="button"
                className="flex items-center justify-center gap-2 rounded-xl border border-orange-100 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-orange-50"
              >
                🔧 Filter
              </button>
            </div>

            {/* Product Table */}
            <div className="mt-6">
              <ProductTable products={products} />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ProdukPage;
