import PropTypes from 'prop-types';

import { Button } from '@shared/components/atoms';
import { cn } from '@shared/lib/utils/cn';

/**
 * ErrorState Component - Feedback
 * State ketika terjadi error
 */
function ErrorState({
  title = 'Terjadi Kesalahan',
  message = 'Maaf, terjadi kesalahan. Silakan coba lagi.',
  onRetry,
  showRetry = true,
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
      role="alert"
      aria-live="assertive"
      {...props}
    >
      {/* Error Icon */}
      <div className="mb-4 text-red-500">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-16 h-16"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
          />
        </svg>
      </div>

      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
        {title}
      </h3>

      <p className="text-zinc-600 dark:text-zinc-400 max-w-md mb-6">
        {message}
      </p>

      {showRetry && onRetry && (
        <Button onClick={onRetry} variant="primary">
          Coba Lagi
        </Button>
      )}
    </div>
  );
}

ErrorState.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string,
  onRetry: PropTypes.func,
  showRetry: PropTypes.bool,
  className: PropTypes.string,
};

export default ErrorState;
