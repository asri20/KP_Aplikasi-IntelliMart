import { Skeleton } from '@shared/components/atoms';
import { ErrorState } from '@shared/components/feedback';

import { useFeatures } from '../../hooks';
import { FeatureCard, SectionHeading } from '../molecules';

/**
 * FeaturesSection Component - Atomic Design: Organism
 */
function FeaturesSection() {
  const { data: features, isLoading, isError, error, refetch } = useFeatures();

  return (
    <section id="features" className="section-padding bg-zinc-50 dark:bg-zinc-950/50">
      <div className="container-app">
        <SectionHeading
          badge="Fitur Unggulan"
          title="Semua yang Anda Butuhkan untuk Bisnis Modern"
          description="Kelola bisnis UMKM Anda dengan lebih efisien menggunakan fitur-fitur canggih yang mudah digunakan"
        />

        <div className="mt-16">
          {isLoading && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <Skeleton key={i} className="h-64 rounded-xl" />
              ))}
            </div>
          )}

          {isError && (
            <ErrorState
              title="Gagal Memuat Fitur"
              message={error?.message || 'Terjadi kesalahan saat memuat data fitur'}
              onRetry={refetch}
            />
          )}

          {features && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature) => (
                <FeatureCard key={feature.id} {...feature} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default FeaturesSection;
