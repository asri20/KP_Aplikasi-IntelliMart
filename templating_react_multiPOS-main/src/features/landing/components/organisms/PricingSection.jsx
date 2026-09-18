import { Skeleton } from '@shared/components/atoms';
import { ErrorState } from '@shared/components/feedback';

import { usePricing } from '../../hooks';
import { PricingCard, SectionHeading } from '../molecules';

/**
 * PricingSection Component - Atomic Design: Organism
 */
function PricingSection() {
  const { data: plans, isLoading, isError, error, refetch } = usePricing();

  return (
    <section id="pricing" className="section-padding">
      <div className="container-app">
        <SectionHeading
          badge="Harga Transparan"
          title="Pilih Paket yang Sesuai dengan Bisnis Anda"
          description="Mulai gratis, upgrade kapan saja. Tanpa kontrak, tanpa biaya tersembunyi."
        />

        <div className="mt-16">
          {isLoading && (
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-[600px] rounded-2xl" />
              ))}
            </div>
          )}

          {isError && (
            <ErrorState
              title="Gagal Memuat Harga"
              message={error?.message || 'Terjadi kesalahan saat memuat data harga'}
              onRetry={refetch}
            />
          )}

          {plans && (
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {plans.map((plan) => (
                <PricingCard key={plan.id} plan={plan} />
              ))}
            </div>
          )}
        </div>

        {/* FAQ Note */}
        <div className="mt-16 text-center">
          <p className="text-zinc-600 dark:text-zinc-400">
            Punya pertanyaan? Lihat{' '}
            <a href="#faq" className="text-brand-600 dark:text-brand-400 hover:underline">
              FAQ
            </a>{' '}
            atau{' '}
            <a href="#contact" className="text-brand-600 dark:text-brand-400 hover:underline">
              hubungi kami
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}

export default PricingSection;
