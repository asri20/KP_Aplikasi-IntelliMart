const products = [
  {
    name: 'Aqua 600ml',
    sold: 'Terjual 48 pcs',
    total: 'Rp 288.000',
  },
  {
    name: 'Indomie Goreng',
    sold: 'Terjual 42 pcs',
    total: 'Rp 294.000',
  },
  {
    name: 'Kopi Kapal Api',
    sold: 'Terjual 38 pcs',
    total: 'Rp 266.000',
  },
  {
    name: 'Chitato',
    sold: 'Terjual 35 pcs',
    total: 'Rp 245.000',
  },
  {
    name: 'Ultra Milk',
    sold: 'Terjual 28 pcs',
    total: 'Rp 196.000',
  },
];

const ProductList = () => {
  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-bold text-slate-900">
          🔥 Produk Terlaris
        </h3>

        <button className="text-xs font-semibold text-orange-500 hover:text-orange-600">
          Lihat Semua →
        </button>
      </div>

      <div className="divide-y divide-slate-100">
        {products.map((product, index) => (
          <div
            key={product.name}
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
                {product.name}
              </p>

              <p className="text-xs text-slate-400">
                {product.sold}
              </p>
            </div>

            <p className="text-sm font-bold text-orange-500">
              {product.total}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ProductList;