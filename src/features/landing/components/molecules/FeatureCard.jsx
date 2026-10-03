import PropTypes from 'prop-types';

import { Badge } from '@shared/components/atoms';
import { cn } from '@shared/lib/utils/cn';

/**
 * Icon map untuk features
 * Menggunakan Heroicons outline
 */
const ICON_PATHS = Object.freeze({
  'building-storefront': (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M13.5 21v-7.5a.75.75 0 01.75-.75h3a.75.75 0 01.75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349m-16.5 11.65V9.35m0 0a3.001 3.001 0 003.75-.615A2.993 2.993 0 009.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 002.25 1.016c.896 0 1.7-.393 2.25-1.016a3.001 3.001 0 003.75.614m-16.5 0a3.004 3.004 0 01-.621-4.72L4.318 3.44A1.5 1.5 0 015.378 3h13.243a1.5 1.5 0 011.06.44l1.19 1.189a3 3 0 01-.621 4.72m-13.5 8.65h3.75a.75.75 0 00.75-.75V13.5a.75.75 0 00-.75-.75H6.75a.75.75 0 00-.75.75v3.75c0 .415.336.75.75.75z"
    />
  ),
  wifi: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z"
    />
  ),
  'chart-bar': (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z"
    />
  ),
  cube: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
    />
  ),
  'credit-card': (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z"
    />
  ),
  users: (
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z"
    />
  ),
});

/**
 * FeatureCard Component - Atomic Design: Molecule
 * Card untuk menampilkan fitur dengan icon, title, description
 */
function FeatureCard({
  icon,
  title,
  description,
  highlight,
  className,
  ...props
}) {
  return (
    <article
      className={cn(
        'group relative p-6 rounded-xl',
        'bg-white dark:bg-zinc-900',
        'border border-zinc-200 dark:border-zinc-800',
        'hover:border-brand-500 dark:hover:border-brand-500',
        'transition-all duration-300',
        'hover:shadow-lg dark:hover:shadow-brand-500/10',
        className
      )}
      {...props}
    >
      {/* Icon */}
      <div className="mb-4">
        <div
          className={cn(
            'inline-flex items-center justify-center',
            'w-12 h-12 rounded-lg',
            'bg-brand-50 dark:bg-brand-950/30',
            'text-brand-600 dark:text-brand-400',
            'group-hover:bg-brand-100 dark:group-hover:bg-brand-950/50',
            'transition-colors duration-300'
          )}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-6 h-6"
            aria-hidden="true"
          >
            {ICON_PATHS[icon]}
          </svg>
        </div>
      </div>

      {/* Content */}
      <h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
        {title}
      </h3>

      <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed mb-3">
        {description}
      </p>

      {/* Highlight Badge */}
      {highlight && (
        <Badge variant="primary" className="text-xs">
          {highlight}
        </Badge>
      )}
    </article>
  );
}

FeatureCard.propTypes = {
  icon: PropTypes.oneOf(Object.keys(ICON_PATHS)).isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  highlight: PropTypes.string,
  className: PropTypes.string,
};

export default FeatureCard;
