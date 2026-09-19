import { Button } from '@shared/components/atoms';
import { useDisclosure, useTheme } from '@shared/hooks';
import { APP_NAME } from '@shared/lib/constants/app';
import { cn } from '@shared/lib/utils/cn';

import { CTA_LINKS, NAVIGATION_LINKS } from '../../constants';
import { NavLink } from '../molecules';

/**
 * Navbar Component - Atomic Design: Organism
 * Top navigation dengan logo, menu, theme toggle, dan mobile menu
 */
function Navbar() {
  const { theme, setTheme } = useTheme();
  const mobileMenu = useDisclosure();

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-fixed',
        'bg-white/80 dark:bg-zinc-900/80',
        'backdrop-blur-lg',
        'border-b border-zinc-200 dark:border-zinc-800'
      )}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="container-app">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 focus-ring rounded-lg">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">I</span>
            </div>
            <span className="font-display font-bold text-xl text-zinc-900 dark:text-zinc-100">
              {APP_NAME}
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {NAVIGATION_LINKS.map((link) => (
              <NavLink
                key={link.id}
                href={link.href}
                label={link.label}
              />
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className={cn(
                'p-2 rounded-lg',
                'text-zinc-700 dark:text-zinc-300',
                'hover:bg-zinc-100 dark:hover:bg-zinc-800',
                'focus-ring'
              )}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>

            <Button variant="ghost" size="sm" onClick={() => (window.location.href = CTA_LINKS.login.href)}>
              {CTA_LINKS.login.label}
            </Button>
            <Button variant="primary" size="sm" onClick={() => (window.location.href = CTA_LINKS.register.href)}>
              {CTA_LINKS.register.label}
            </Button>
          </div>

          {/* Mobile Menu Button - truncated, will append */}
          <button
            onClick={mobileMenu.toggle}
            className={cn('md:hidden p-2 rounded-lg', 'text-zinc-700 dark:text-zinc-300', 'hover:bg-zinc-100 dark:hover:bg-zinc-800', 'focus-ring')}
            aria-label="Toggle menu"
            aria-expanded={mobileMenu.isOpen}
          >
            {mobileMenu.isOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenu.isOpen && (
          <div className="md:hidden py-4 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex flex-col gap-2 mb-4">
              {NAVIGATION_LINKS.map((link) => (
                <NavLink key={link.id} href={link.href} label={link.label} onClick={mobileMenu.close} className="w-full" />
              ))}
            </div>
            <div className="flex flex-col gap-2 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <Button variant="ghost" fullWidth onClick={() => (window.location.href = CTA_LINKS.login.href)}>
                {CTA_LINKS.login.label}
              </Button>
              <Button variant="primary" fullWidth onClick={() => (window.location.href = CTA_LINKS.register.href)}>
                {CTA_LINKS.register.label}
              </Button>
              <button onClick={toggleTheme} className={cn('w-full p-3 rounded-lg text-left', 'text-zinc-700 dark:text-zinc-300', 'hover:bg-zinc-100 dark:hover:bg-zinc-800', 'focus-ring')}>
                {theme === 'light' ? '🌙 Dark Mode' : '☀️ Light Mode'}
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
