import { Button } from '@shared/components/atoms';
import { cn } from '@shared/lib/utils/cn';

import { CTA_LINKS } from '../../constants';

/**
 * CTASection Component - Atomic Design: Organism
 */
function CTASection() {
  return (
    <section className="section-padding bg-gradient-to-br from-brand-500 to-brand-600 dark:from-brand-700 dark:to-brand-800">
      <div className="container-app">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className={cn('text-3xl md:text-4xl lg:text-5xl', 'font-bold font-display', 'mb-6')}>
            Siap Beralih ke POS Modern?
          </h2>

          <p className="text-lg md:text-xl text-brand-50 mb-8 max-w-2xl mx-auto">
            Bergabunglah dengan ribuan UMKM yang sudah mempercayai InteliMart untuk mengelola bisnis mereka. Gratis 30 hari, tanpa kartu kredit.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="secondary"
              size="lg"
              onClick={() => (window.location.href = CTA_LINKS.register.href)}
              className="bg-white text-brand-600 hover:bg-brand-50"
            >
              Daftar Gratis Sekarang
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => (window.location.href = '/contact')}
              className="border-white text-white hover:bg-white/10"
            >
              Hubungi Sales
            </Button>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-brand-100">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Tanpa Kontrak</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Cancel Kapan Saja</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span>Support 24/7</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CTASection;
