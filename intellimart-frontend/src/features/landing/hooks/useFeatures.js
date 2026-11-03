import { useQuery } from '@tanstack/react-query';

import { QUERY_KEYS } from '@shared/lib/constants/queryKeys';

import { fetchFeatures } from '../services/landingService';

/**
 * Custom hook untuk fetch features data
 * Menggunakan React Query untuk caching dan state management
 * 
 * @returns {Object} Query result
 * @property {Array} data - Features data
 * @property {boolean} isLoading - Loading state
 * @property {boolean} isError - Error state
 * @property {Error} error - Error object
 * @property {function} refetch - Refetch function
 * 
 * @example
 * const { data: features, isLoading, isError } = useFeatures();
 */
export function useFeatures() {
  return useQuery({
    queryKey: QUERY_KEYS.FEATURES,
    queryFn: fetchFeatures,
    staleTime: 10 * 60 * 1000, // 10 minutes (features jarang berubah)
  });
}
