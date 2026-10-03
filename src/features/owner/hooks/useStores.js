import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { QUERY_KEYS } from '@shared/lib/constants/queryKeys';

import { createStore, getStores } from '../services/storeService';

export function useStores() {
  return useQuery({ queryKey: QUERY_KEYS.STORES, queryFn: getStores });
}

export function useCreateStore() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createStore,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: QUERY_KEYS.STORES }),
  });
}
