import PropTypes from 'prop-types';

import { Badge, Button } from '@shared/components/atoms';
import { cn } from '@shared/lib/utils/cn';
import { formatCurrency } from '@shared/lib/utils/format';

/**
 * PricingCard Component - Atomic Design: Molecule
 * Card untuk menampilkan paket harga
 */
function PricingCard({ plan, className, ...props }) {
  const {
    name,
    tagline,
    price,
    period,
    description,
    popular,
    features,
    limitations = [],
    cta,
    discount,
  } = plan;

  return (
    <article
      className={cn(
        'relative p-8 rounded-2xl',
        'border-2 transition-all duration-300',
        popular
          ? 'border-brand-500 bg-gradient-to-b from-brand-50 to-white dark:from-brand-950/20 dark:to-zinc-900 shadow-xl scale-105'
          : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-brand-300 dark:hover:border-brand-700',
        className
      )}
      {...props}
    >
      {/* Popular Badge */}
      {popular && (
        <Badge
          variant="primary"
          className="absolute -top-3 left-1/2 -translate-x-1/2"
        >
          {tagline}
        </Badge>
      )}

      {/* Header */}
      <header className="mb-6">
        <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
          {name}
        </h3>
        {!popular && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">{tagline}</p>
        )}
      </header>

      {/* Price */}
      <div className="mb-6">
        <div className="flex items-baseline gap-2">
          <span className="text-5xl font-bold text-zinc-900 dark:text-zinc-100">
            {price === 0 ? 'Gratis' : formatCurrency(price)}
          </span>
          {price > 0 && (
            <span className="text-zinc-600 dark:text-zinc-400">/ {period}</span>
          )}
        </div>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          {description}
        </p>
      </div>

      {/* Discount Info */}
      {discount?.annual && (
        <div className="mb-6 p-3 rounded-lg bg-brand-50 dark:bg-brand-950/20 border border-brand-200 dark:border-brand-900">
          <p className="text-sm text-brand-700 dark:text-brand-400">
            💰 {discount.annual}
          </p>
        </div>
      )}

      {/* CTA Button */}
      <Button
        variant={popular ? 'primary' : 'outline'}
        size="lg"
        fullWidth
        className="mb-8"
        onClick={() => (window.location.href = cta.href)}
      >
        {cta.label}
      </Button>

      {/* Features List */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
          Fitur Termasuk
        </h4>
        <ul className="space-y-3">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-brand-500 flex-shrink-0 mt-0.5"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="text-sm text-zinc-700 dark:text-zinc-300">
                {feature}
              </span>
            </li>
          ))}
        </ul>

        {/* Limitations */}
        {limitations.length > 0 && (
          <div className="pt-4 mt-4 border-t border-zinc-200 dark:border-zinc-800">
            <ul className="space-y-3">
              {limitations.map((limitation, index) => (
                <li key={index} className="flex items-start gap-3">
                  <svg
                    className="w-5 h-5 text-zinc-400 flex-shrink-0 mt-0.5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-sm text-zinc-500 dark:text-zinc-400">
                    {limitation}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </article>
  );
}

PricingCard.propTypes = {
  plan: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    tagline: PropTypes.string.isRequired,
    price: PropTypes.number.isRequired,
    period: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    popular: PropTypes.bool.isRequired,
    features: PropTypes.arrayOf(PropTypes.string).isRequired,
    limitations: PropTypes.arrayOf(PropTypes.string),
    cta: PropTypes.shape({
      label: PropTypes.string.isRequired,
      href: PropTypes.string.isRequired,
    }).isRequired,
    discount: PropTypes.shape({
      annual: PropTypes.string,
    }),
  }).isRequired,
  className: PropTypes.string,
};

export default PricingCard;
