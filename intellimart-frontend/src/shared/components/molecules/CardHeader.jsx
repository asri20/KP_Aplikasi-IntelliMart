import PropTypes from 'prop-types';

import { cn } from '@shared/lib/utils/cn';

/**
 * CardHeader Component - Atomic Design: Molecule
 * Header untuk card dengan title dan optional description
 */
function CardHeader({ title, description, action, className, ...props }) {
  return (
    <div
      className={cn('flex items-start justify-between gap-4', className)}
      {...props}
    >
      <div className="flex-1">
        {title && (
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {title}
          </h3>
        )}
        {description && (
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {description}
          </p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

CardHeader.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  action: PropTypes.node,
  className: PropTypes.string,
};

export default CardHeader;
