import { forwardRef } from 'react';

import PropTypes from 'prop-types';

import { cn } from '@shared/lib/utils/cn';

/**
 * Variant map untuk Button styles
 * Menggunakan Object.freeze untuk immutability
 */
const BUTTON_VARIANTS = Object.freeze({
  primary: 'bg-brand-500 text-white hover:bg-brand-600 active:bg-brand-700',
  secondary:
    'bg-zinc-100 text-zinc-900 hover:bg-zinc-200 active:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700',
  outline:
    'border-2 border-brand-500 text-brand-600 hover:bg-brand-50 active:bg-brand-100 dark:text-brand-400 dark:hover:bg-brand-950/30',
  ghost:
    'text-zinc-700 hover:bg-zinc-100 active:bg-zinc-200 dark:text-zinc-300 dark:hover:bg-zinc-800',
  danger: 'bg-red-500 text-white hover:bg-red-600 active:bg-red-700',
});

const BUTTON_SIZES = Object.freeze({
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg',
});

/**
 * Button Component - Atomic Design: Atom
 * Tombol yang accessible dengan berbagai variant dan size
 */
const Button = forwardRef(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      disabled = false,
      loading = false,
      fullWidth = false,
      type = 'button',
      className,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center gap-2',
          'rounded-lg font-medium',
          'transition-colors duration-200',
          'focus-ring',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          // Variant & Size
          BUTTON_VARIANTS[variant],
          BUTTON_SIZES[size],
          fullWidth && 'w-full',
          className
        )}
        aria-busy={loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

Button.propTypes = {
  children: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(Object.keys(BUTTON_VARIANTS)),
  size: PropTypes.oneOf(Object.keys(BUTTON_SIZES)),
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  fullWidth: PropTypes.bool,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  className: PropTypes.string,
};

export default Button;
