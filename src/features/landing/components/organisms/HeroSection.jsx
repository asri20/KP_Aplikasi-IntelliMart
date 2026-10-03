import { Badge, Button } from '@shared/components/atoms';
import { APP_TAGLINE } from '@shared/lib/constants/app';
import { cn } from '@shared/lib/utils/cn';

import { CTA_LINKS, HERO_FEATURES } from '../../constants';

/**
 * HeroSection Component - Atomic Design: Organism
 */
function HeroSection() {
  return (
    <section className={cn('relative pt-32 pb-20 lg:pt-40 lg:pb-28', 'overflow-hidden')} aria-labelledby="hero-heading">
      <div className="absolute inset-0 -z-10 opacity-30 dark:opacity-20" aria-hidden="true">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-to-br from-brand-300 to-brand-100 dark:from-brand-900 dark:to-brand-950 rounded-full blur-3xl" />
      </div>

      <div className="container-app">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="text-center lg:text-left">
            <Badge variant="primary" className="mb-6 text-sm">
              🎉 Gratis 30 Hari, Tanpa Kartu Kredit
            </Badge>

            <h1 id="hero-heading" className={cn('text-4xl md:text-5xl lg:text-6xl', 'font-bold font-display', 'text-zinc-900 dark:text-zinc-100', 'mb-6 leading-tight')}>
              POS Modern untuk <span className="text-brand-500 dark:text-brand-400">UMKM Indonesia</span>
            </h1>

            <p className={cn('text-lg md:text-xl', 'text-zinc-600 dark:text-zinc-400', 'mb-8 max-w-2xl', 'lg:mx-0 mx-auto')}>
              {APP_TAGLINE}. Kelola penjualan, stok, dan laporan bisnis Anda dengan mudah. Mode offline, multi-outlet, laporan real-time.
            </p>

            <div className="flex flex-wrap gap-4 justify-center lg:justify-start mb-8">
              {HERO_FEATURES.map((feature) => (
                <div key={feature.id} className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                  <svg className="w-5 h-5 text-brand-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>{feature.label}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button variant="primary" size="lg" onClick={() => (window.location.href = CTA_LINKS.register.href)}>
                Daftar Gratis Sekarang
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Button>
              <Button variant="outline" size="lg" onClick={() => document.querySelector('#features')?.scrollIntoView({ behavior: 'smooth' })}>
                Lihat Fitur
              </Button>
            </div>

          
          </div>

          <div className="relative lg:block hidden">
            <div className={cn('aspect-square rounded-2xl', 'bg-gradient-to-br from-brand-100 to-brand-50', 'dark:from-brand-950/30 dark:to-brand-950/10', 'border border-brand-200 dark:border-brand-900', 'flex items-center justify-center', 'shadow-2xl')}>
              <div className="text-center p-8">
                <svg className="w-64 h-64 mx-auto text-brand-500/20 dark:text-brand-400/10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-zinc-400 dark:text-zinc-600 mt-4">[Dashboard Illustration]</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default HeroSection;
