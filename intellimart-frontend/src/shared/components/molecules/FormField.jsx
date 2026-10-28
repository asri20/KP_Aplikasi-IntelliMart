import { forwardRef } from 'react';

import PropTypes from 'prop-types';

import { Input } from '@shared/components/atoms';
import { cn } from '@shared/lib/utils/cn';

/**
 * FormField Component - Atomic Design: Molecule
 * Kombinasi label, input, dan error message
 */
const FormField = forwardRef(
  (
    {
      label,
      error,
      helperText,
      required = false,
      fullWidth = false,
      className,
      id,
      ...inputProps
    },
    ref
  ) => {
    const fieldId = id || inputProps.name || `field-${Math.random()}`;
    const errorId = `${fieldId}-error`;
    const helperId = `${fieldId}-helper`;

    return (
      <div className={cn('space-y-1.5', fullWidth && 'w-full', className)}>
        {label && (
          <label
            htmlFor={fieldId}
            className="block text-sm font-medium text-zinc-900 dark:text-zinc-100"
          >
            {label}
            {required && (
              <span className="ml-1 text-red-500" aria-label="required">
                *
              </span>
            )}
          </label>
        )}

        <Input
          ref={ref}
          id={fieldId}
          error={!!error}
          fullWidth={fullWidth}
          aria-invalid={!!error}
          aria-describedby={
            error ? errorId : helperText ? helperId : undefined
          }
          {...inputProps}
        />

        {error && (
          <p
            id={errorId}
            className="text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {error}
          </p>
        )}

        {!error && helperText && (
          <p
            id={helperId}
            className="text-sm text-zinc-500 dark:text-zinc-400"
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';

FormField.propTypes = {
  label: PropTypes.string,
  error: PropTypes.string,
  helperText: PropTypes.string,
  required: PropTypes.bool,
  fullWidth: PropTypes.bool,
  className: PropTypes.string,
  id: PropTypes.string,
};

export default FormField;
