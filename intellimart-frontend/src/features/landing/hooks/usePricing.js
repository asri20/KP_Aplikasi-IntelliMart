import { useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '@shared/lib/constants/queryKeys';

import { fetchPricingPlans } from '../services/landingService';

/**
 * Custom hook untuk fetch pricing plans data
 * Menggunakan React Query untuk caching dan state management
 * 
 * @returns {Object} Query result
 * @property {Array} data - Pricing plans data
 * @property {boolean} isLoading - Loading state
 * @property {boolean} isError - Error state
 * @property {Error} error - Error object
 * @property {function} refetch - Refetch function
 * 
 * @example
 * const { data: plans, isLoading, isError } = usePricing();
 */
export function usePricing() {
  return useQuery({
    queryKey: QUERY_KEYS.PRICING,
    queryFn: fetchPricingPlans,
    staleTime: 10 * 60 * 1000, // 10 minutes (pricing jarang berubah)
  });
}
