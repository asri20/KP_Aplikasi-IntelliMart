import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { cn } from '@shared/lib/utils/cn';

/**
 * NavLink Component - Atomic Design: Molecule
 * Navigation link dengan active state
 */
function NavLink({ href, label, isActive = false, onClick, className }) {
  const linkClasses = cn(
    'px-3 py-2 text-sm font-medium rounded-lg',
    'transition-colors duration-200',
    'focus-ring',
    isActive
      ? 'text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-950/30'
      : 'text-zinc-700 dark:text-zinc-300 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-zinc-100 dark:hover:bg-zinc-800',
    className
  );

  // Internal link (hash atau path)
  if (href.startsWith('#') || href.startsWith('/')) {
    if (href.startsWith('#')) {
      // Smooth scroll untuk anchor
      return (
        <a
          href={href}
          onClick={(e) => {
            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
              target.scrollIntoView({ behavior: 'smooth' });
            }
            onClick?.();
          }}
          className={linkClasses}
        >
          {label}
        </a>
      );
    }

    // React Router Link
    return (
      <Link to={href} className={linkClasses} onClick={onClick}>
        {label}
      </Link>
    );
  }

  // External link
  return (
    <a
      href={href}
      className={linkClasses}
      target="_blank"
      rel="noopener noreferrer"
      onClick={onClick}
    >
      {label}
    </a>
  );
}

NavLink.propTypes = {
  href: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  isActive: PropTypes.bool,
  onClick: PropTypes.func,
  className: PropTypes.string,
};

export default NavLink;
