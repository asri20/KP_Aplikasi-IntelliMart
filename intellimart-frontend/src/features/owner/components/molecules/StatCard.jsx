import PropTypes from 'prop-types';

/**
 * StatCard - Molecule
 * Kartu ringkasan angka untuk halaman-halaman Owner (Toko Saya, Produk, Inventory, dll).
 * Beda dari DashboardCard: description di sini teks polos (bukan indikator delta hijau).
 */
const TONES = Object.freeze({
  orange: { icon: 'bg-orange-100 text-orange-500' },
  green: { icon: 'bg-emerald-100 text-emerald-600' },
  blue: { icon: 'bg-blue-100 text-blue-600' },
  purple: { icon: 'bg-purple-100 text-purple-500' },
  red: { icon: 'bg-red-100 text-red-500' },
});

const StatCard = ({ icon, title, value, description, tone = 'orange' }) => {
  const style = TONES[tone] ?? TONES.orange;

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl ${style.icon}`}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-sm text-slate-500">{title}</p>

          <h2 className="mt-1 text-2xl font-bold text-slate-900">{value}</h2>

          {description && (
            <p className="mt-2 text-xs font-medium text-slate-400">
              {description}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

StatCard.propTypes = {
  icon: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  description: PropTypes.string,
  tone: PropTypes.oneOf(Object.keys(TONES)),
};

export default StatCard;
