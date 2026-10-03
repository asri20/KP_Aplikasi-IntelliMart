const OwnerHeader = () => {
  return (
    <header className="flex h-20 items-center justify-between border-b border-orange-100 bg-white px-6 lg:px-8">
      {/* Search */}
      <div className="relative hidden w-full max-w-xl md:block">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          🔍
        </span>

        <input
          type="text"
          placeholder="Cari produk, kategori, atau transaksi..."
          className="w-full rounded-xl border border-orange-100 bg-orange-50/40 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-orange-300 focus:ring-2 focus:ring-orange-100"
        />
      </div>

      {/* Actions */}
      <div className="ml-auto flex items-center gap-5">
        <button
          type="button"
          className="relative text-xl text-slate-500 hover:text-orange-500"
        >
          🔔

          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange-500 px-1 text-[9px] font-bold text-white">
            3
          </span>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100">
            👤
          </div>

          <div className="hidden sm:block">
            <p className="text-sm font-semibold text-slate-800">Owner</p>

            <p className="text-xs text-slate-400">Administrator</p>
          </div>

          <span className="text-slate-400">⌄</span>
        </div>
      </div>
    </header>
  );
};

export default OwnerHeader;
