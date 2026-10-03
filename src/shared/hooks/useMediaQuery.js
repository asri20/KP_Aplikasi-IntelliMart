import { useEffect, useState } from 'react';

import { BREAKPOINTS } from '@shared/lib/constants/app';

/**
 * Custom hook untuk media query
 * @param {string} query - Media query string atau breakpoint key
 * @returns {boolean} Match status
 * 
 * @example
 * const isMobile = useMediaQuery('(max-width: 768px)');
 * const isDesktop = useMediaQuery('LG'); // >= 1024px
 */
export function useMediaQuery(query) {
  // Convert breakpoint key to query string
  const mediaQuery =
    query in BREAKPOINTS
      ? `(min-width: ${BREAKPOINTS[query]}px)`
      : query;

  const [matches, setMatches] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.matchMedia(mediaQuery).matches;
    }
    return false;
  });

  useEffect(() => {
    const mediaQueryList = window.matchMedia(mediaQuery);
    
    const handleChange = (e) => setMatches(e.matches);
    
    // Modern browsers
    if (mediaQueryList.addEventListener) {
      mediaQueryList.addEventListener('change', handleChange);
      return () => mediaQueryList.removeEventListener('change', handleChange);
    }
    // Legacy browsers
    else {
      mediaQueryList.addListener(handleChange);
      return () => mediaQueryList.removeListener(handleChange);
    }
  }, [mediaQuery]);

  return matches;
}
