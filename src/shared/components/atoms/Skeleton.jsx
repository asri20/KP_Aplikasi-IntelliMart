import PropTypes from 'prop-types';

import { cn } from '@shared/lib/utils/cn';

/**
 * Skeleton Component - Atomic Design: Atom
 * Loading placeholder dengan animasi pulse
 */
function Skeleton({ className, ...props }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg',
        'bg-zinc-200 dark:bg-zinc-800',
        className
      )}
      aria-busy="true"
      aria-live="polite"
      {...props}
    />
  );
}

Skeleton.propTypes = {
  className: PropTypes.string,
};

export default Skeleton;
