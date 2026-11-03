import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import { cn } from '@shared/lib/utils/cn';

/**
 * AuthLayout Component - Atomic Design: Organism
 * Consistent layout wrapper for auth pages
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Form content
 * @param {string} props.title - Page title
 * @param {string} [props.subtitle] - Page subtitle
 */
function AuthLayout({ children, title, subtitle }) {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900 flex flex-col">
      {/* Header with Logo */}
      <header className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">I</span>
            </div>
            <span className="text-xl font-bold font-display text-zinc-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
              InteliMart
            </span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white dark:bg-zinc-800 rounded-xl shadow-lg border border-zinc-200 dark:border-zinc-700 p-8">
            {/* Title Section */}
            <div className="mb-8 text-center">
              <h1 className={cn('text-2xl font-bold font-display text-zinc-900 dark:text-white', 'mb-2')}>{title}</h1>
              {subtitle && <p className="text-sm text-zinc-600 dark:text-zinc-400">{subtitle}</p>}
            </div>

            {/* Form Content */}
            {children}
          </div>

          {/* Footer Note */}
          <p className="mt-6 text-center text-xs text-zinc-500 dark:text-zinc-500">
            Dengan melanjutkan, Anda menyetujui{' '}
            <Link to="/terms" className="underline hover:text-zinc-700 dark:hover:text-zinc-300">
              Syarat & Ketentuan
            </Link>{' '}
            dan{' '}
            <Link to="/privacy" className="underline hover:text-zinc-700 dark:hover:text-zinc-300">
              Kebijakan Privasi
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

AuthLayout.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
};

export default AuthLayout;
