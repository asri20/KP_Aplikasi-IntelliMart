import PropTypes from 'prop-types';

import { Badge, Button } from '@shared/components/atoms';

/**
 * StoreCard - Molecule
 * Kartu untuk satu toko di halaman "Toko Saya".
 */
const StoreCard = ({ store }) => {
  const hasManager = Boolean(store.manager);

  return (
    <div className="overflow-hidden rounded-2xl border border-orange-100 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      {/* Banner */}
      <div className="relative h-32 bg-gradient-to-br from-orange-400 to-orange-500">
        <div className="absolute inset-0 flex items-center justify-center text-4xl">
          🏪
        </div>

        <div className="absolute right-3 top-3">
          <Badge variant={hasManager ? 'success' : 'warning'}>
            {hasManager ? 'Aktif' : 'Tanpa Manager'}
          </Badge>
        </div>
      </div>

      <div className="px-5 pb-5">
        {/* Icon avatar overlap banner */}
        <div className="-mt-6 mb-3 flex h-12 w-12 items-center justify-center rounded-xl border-4 border-white bg-orange-500 text-xl text-white shadow-sm">
          🏬
        </div>

        <h3 className="truncate text-base font-bold text-slate-900">
          {store.name}
        </h3>

        <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
          <span>📍</span>
          <span className="truncate">{store.location}</span>
        </p>

        {/* Manager */}
        <button
          type="button"
          className="mt-4 flex w-full items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 px-3 py-2.5 text-left transition hover:bg-slate-50"
        >
          <div className="flex min-w-0 items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-sm">
              {hasManager ? '🧑' : '👤'}
            </div>

            <div className="min-w-0">
              <p className="text-[11px] text-slate-400">Manager</p>

              <p
                className={`truncate text-xs font-semibold ${
                  hasManager ? 'text-slate-700' : 'text-orange-500'
                }`}
              >
                {store.manager ?? 'Belum ada manager'}
              </p>
            </div>
          </div>

          <span className="shrink-0 text-slate-300">›</span>
        </button>

        {/* Stats */}
        <div className="mt-4 flex items-center gap-5 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            📦
            <b className="font-semibold text-slate-700">{store.totalProduk}</b>
            Total Produk
          </span>

          <span className="flex items-center gap-1.5">
            🧾
            <b className="font-semibold text-slate-700">
              {store.totalTransaksi}
            </b>
            Total Transaksi
          </span>
        </div>

        {/* Actions */}
        <div className="mt-5 flex gap-2">
          {!hasManager && (
            <Button variant="primary" size="sm" fullWidth>
              👥 Assign Manager
            </Button>
          )}

          <Button variant="outline" size="sm" fullWidth>
            Lihat Detail →
          </Button>
        </div>
      </div>
    </div>
  );
};

StoreCard.propTypes = {
  store: PropTypes.shape({
    name: PropTypes.string.isRequired,
    location: PropTypes.string.isRequired,
    manager: PropTypes.string,
    totalProduk: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    totalTransaksi: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  }).isRequired,
};

export default StoreCard;
