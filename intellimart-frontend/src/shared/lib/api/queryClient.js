import { QueryClient } from '@tanstack/react-query';

import { env } from '@core/config/env';

/**
 * React Query Client Configuration
 * Default options untuk caching dan refetching
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time: data dianggap fresh selama 5 menit
      staleTime: 5 * 60 * 1000, // 5 minutes
      
      // Cache time: data disimpan di cache selama 10 menit
      cacheTime: 10 * 60 * 1000, // 10 minutes
      
      // Retry failed requests
      retry: (failureCount, error) => {
        // Jangan retry untuk 4xx errors
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // Max 2 retries untuk errors lainnya
        return failureCount < 2;
      },
      
      // Retry delay dengan exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Refetch on window focus (hanya di production)
      refetchOnWindowFocus: env.isProduction,
      
      // Refetch on reconnect
      refetchOnReconnect: true,
      
      // Refetch on mount jika data sudah stale
      refetchOnMount: true,
    },
    mutations: {
      // Retry failed mutations
      retry: 1,
      
      // Retry delay
      retryDelay: 1000,
    },
  },
});
