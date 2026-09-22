import { forwardRef } from 'react';

import PropTypes from 'prop-types';

import { cn } from '@shared/lib/utils/cn';

/**
 * Input Component - Atomic Design: Atom
 * Text input yang accessible dengan error state
 */
const Input = forwardRef(
  (
    {
      type = 'text',
      placeholder,
      disabled = false,
      error = false,
      fullWidth = false,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <input
        ref={ref}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={error}
        className={cn(
          // Base styles
          'px-4 py-2 rounded-lg',
          'border-2 transition-colors duration-200',
          'text-zinc-900 dark:text-zinc-100',
          'placeholder:text-zinc-400 dark:placeholder:text-zinc-500',
          'focus-ring',
          // States
          error
            ? 'border-red-500 bg-red-50 dark:bg-red-950/20'
            : 'border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900',
          'hover:border-zinc-400 dark:hover:border-zinc-600',
          'focus:border-brand-500 dark:focus:border-brand-400',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          fullWidth && 'w-full',
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

Input.propTypes = {
  type: PropTypes.string,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  error: PropTypes.bool,
  fullWidth: PropTypes.bool,
  className: PropTypes.string,
};

export default Input;
