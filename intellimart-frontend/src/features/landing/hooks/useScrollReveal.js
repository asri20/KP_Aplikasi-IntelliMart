import { useEffect, useRef, useState } from 'react';

/**
 * Custom hook untuk scroll reveal animation
 * Menggunakan Intersection Observer API
 * 
 * @param {Object} options - Intersection Observer options
 * @param {number} options.threshold - Threshold (0-1)
 * @param {string} options.rootMargin - Root margin
 * @returns {Object} Hook result
 * @property {React.RefObject} ref - Ref untuk element yang di-observe
 * @property {boolean} isVisible - Visibility state
 * 
 * @example
 * const { ref, isVisible } = useScrollReveal();
 * <div ref={ref} className={isVisible ? 'animate-fade-in' : 'opacity-0'}>
 */
export function useScrollReveal(options = {}) {
  const { threshold = 0.1, rootMargin = '0px' } = options;
  
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          // Unobserve setelah visible (animasi hanya sekali)
          observer.unobserve(element);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [threshold, rootMargin]);

  return { ref, isVisible };
}
