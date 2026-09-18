import PropTypes from 'prop-types';

import { cn } from '@shared/lib/utils/cn';

/**
 * SectionHeading Component - Atomic Design: Molecule
 * Heading untuk sections dengan badge, title, dan description
 */
function SectionHeading({
  badge,
  title,
  description,
  align = 'center',
  className,
  ...props
}) {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  };

  return (
    <header className={cn(alignClasses[align], className)} {...props}>
      {badge && (
        <span
          className={cn(
            'inline-block px-3 py-1 mb-4',
            'text-sm font-medium',
            'text-brand-600 dark:text-brand-400',
            'bg-brand-50 dark:bg-brand-950/30',
            'rounded-full'
          )}
        >
          {badge}
        </span>
      )}

      {title && (
        <h2
          className={cn(
            'text-3xl md:text-4xl lg:text-5xl',
            'font-bold font-display',
            'text-zinc-900 dark:text-zinc-100',
            'mb-4'
          )}
        >
          {title}
        </h2>
      )}

      {description && (
        <p
          className={cn(
            'text-lg text-zinc-600 dark:text-zinc-400',
            'max-w-2xl',
            align === 'center' && 'mx-auto',
            align === 'right' && 'ml-auto'
          )}
        >
          {description}
        </p>
      )}
    </header>
  );
}

SectionHeading.propTypes = {
  badge: PropTypes.string,
  title: PropTypes.string,
  description: PropTypes.string,
  align: PropTypes.oneOf(['left', 'center', 'right']),
  className: PropTypes.string,
};

export default SectionHeading;
