import React, { useEffect, useState } from 'react';
import { getUpsellingRecommendations } from '../../services/salesAnalyticsService';

const formatRupiah = (value) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);
};

const UpsellRecommendations = ({ cart = [], storeId = 1 }) => {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const loadRecommendations = async () => {
      const variantIds = [
        ...new Set(
          cart
            .map((item) => Number(item.variant_id))
            .filter((id) => Number.isInteger(id) && id > 0)
        ),
      ];

      if (variantIds.length === 0) {
        setRecommendations([]);
        setError('');
        return;
      }

      setLoading(true);
      setError('');

      try {
        const responses = await Promise.all(
          variantIds.map((variantId) =>
            getUpsellingRecommendations(variantId, storeId)
          )
        );

        if (cancelled) return;

        const existingIds = new Set(variantIds);
        const uniqueRecommendations = new Map();

        responses.forEach((response) => {
          const rows = Array.isArray(response)
            ? response
            : response?.recommendations || response?.data || [];

          rows.forEach((item) => {
            const recommendedId = Number(
              item.recommended_variant_id ??
                item.target_variant_id ??
                item.variant_id
            );

            if (
              !recommendedId ||
              existingIds.has(recommendedId) ||
              uniqueRecommendations.has(recommendedId)
            ) {
              return;
            }

            uniqueRecommendations.set(recommendedId, item);
          });
        });

        setRecommendations(Array.from(uniqueRecommendations.values()));
      } catch (err) {
        if (!cancelled) {
          setRecommendations([]);
          setError(
            err.response?.data?.message ||
              err.message ||
              'Gagal memuat rekomendasi upselling.'
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadRecommendations();

    return () => {
      cancelled = true;
    };
  }, [cart, storeId]);

  if (cart.length === 0) return null;

  return (
    <section className="pos-upsell">
      <div className="pos-upsell-header">
        <h3>Rekomendasi Upselling</h3>
        <span>Produk dengan ukuran lebih besar</span>
      </div>

      {loading && (
        <p className="pos-upsell-message">Memuat rekomendasi produk...</p>
      )}

      {error && <p className="pos-upsell-message pos-upsell-error">{error}</p>}

      {!loading && !error && recommendations.length === 0 && (
        <p className="pos-upsell-message">
          Belum ada rekomendasi produk upselling untuk keranjang ini.
        </p>
      )}

      {recommendations.map((item, index) => (
        <div
          className="pos-upsell-item"
          key={
            item.recommended_variant_id ??
            item.target_variant_id ??
            item.variant_id ??
            index
          }
        >
          <div className="pos-upsell-info">
            <strong>{item.product_name || 'Produk rekomendasi'}</strong>

            <span>
              {item.variant_name || item.recommended_variant_name || ''}
            </span>

            <small>SKU: {item.sku || '-'}</small>

            <small>Stok: {item.stock ?? '-'}</small>
          </div>

          <div className="pos-upsell-price">
            {formatRupiah(
              item.retail_price ?? item.selling_price ?? item.price ?? 0
            )}
          </div>
        </div>
      ))}
    </section>
  );
};

export default UpsellRecommendations;
