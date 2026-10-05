import PropTypes from 'prop-types';

import { cn } from '@shared/lib/utils/cn';

/**
 * Badge variant map
 */
const BADGE_VARIANTS = Object.freeze({
  default:
    'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300',
  primary: 'bg-brand-100 text-brand-700 dark:bg-brand-950/50 dark:text-brand-400',
  success:
    'bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400',
  warning:
    'bg-yellow-100 text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-400',
  danger: 'bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400',
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400',
});

/**
 * Badge Component - Atomic Design: Atom
 * Label kecil untuk status, kategori, atau highlight
 */
function Badge({ children, variant = 'default', className, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2.5 py-0.5',
        'text-xs font-medium rounded-full',
        BADGE_VARIANTS[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}

Badge.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(Object.keys(BADGE_VARIANTS)),
  className: PropTypes.string,
};

export default Badge;
