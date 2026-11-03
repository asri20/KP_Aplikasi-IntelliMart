import PropTypes from 'prop-types';

import { cn } from '@shared/lib/utils/cn';

/**
 * EmptyState Component - Feedback
 * State ketika tidak ada data untuk ditampilkan
 */
function EmptyState({
  icon,
  title,
  description,
  action,
  className,
  ...props
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center',
        'py-12 px-4 text-center',
        className
      )}
      role="status"
      aria-live="polite"
      {...props}
    >
      {icon && (
        <div className="mb-4 text-zinc-400 dark:text-zinc-600">{icon}</div>
      )}
      
      {title && (
        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
          {title}
        </h3>
      )}
      
      {description && (
        <p className="text-zinc-600 dark:text-zinc-400 max-w-md mb-6">
          {description}
        </p>
      )}
      
      {action && action}
    </div>
  );
}

EmptyState.propTypes = {
  icon: PropTypes.node,
  title: PropTypes.string,
  description: PropTypes.string,
  action: PropTypes.node,
  className: PropTypes.string,
};

export default EmptyState;
