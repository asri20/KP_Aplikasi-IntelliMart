import PropTypes from 'prop-types';

import { cn } from '@shared/lib/utils/cn';

/**
 * Icon size map
 */
const ICON_SIZES = Object.freeze({
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
});

/**
 * Icon Component - Atomic Design: Atom
 * Wrapper untuk SVG icons dengan size presets
 */
function Icon({ children, size = 'md', className, label, ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className={cn(ICON_SIZES[size], className)}
      aria-label={label}
      aria-hidden={!label}
      role={label ? 'img' : undefined}
      {...props}
    >
      {children}
    </svg>
  );
}

Icon.propTypes = {
  children: PropTypes.node.isRequired,
  size: PropTypes.oneOf(Object.keys(ICON_SIZES)),
  className: PropTypes.string,
  label: PropTypes.string,
};

export default Icon;
