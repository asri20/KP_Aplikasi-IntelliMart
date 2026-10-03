const variants = {
  orange: {
    wrapper: 'border-orange-100 bg-orange-50/50',
    icon: 'bg-orange-100 text-orange-500',
    description: 'text-emerald-500',
  },

  yellow: {
    wrapper: 'border-amber-100 bg-amber-50/50',
    icon: 'bg-amber-100 text-amber-500',
    description: 'text-emerald-500',
  },

  red: {
    wrapper: 'border-red-100 bg-red-50/40',
    icon: 'bg-red-100 text-red-500',
    description: 'text-orange-500',
  },

  purple: {
    wrapper: 'border-purple-100 bg-purple-50/40',
    icon: 'bg-purple-100 text-purple-500',
    description: 'text-emerald-500',
  },
};

const DashboardCard = ({
  icon,
  title,
  value,
  description,
  variant = 'orange',
}) => {
  const style = variants[variant];

  return (
    <div
      className={`rounded-2xl border p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${style.wrapper}`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl ${style.icon}`}
        >
          {icon}
        </div>

        <div className="min-w-0">
          <p className="text-sm text-slate-500">{title}</p>

          <h2 className="mt-1 text-2xl font-bold text-slate-900">
            {value}
          </h2>

          <p className={`mt-2 text-xs font-medium ${style.description}`}>
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

export default DashboardCard;