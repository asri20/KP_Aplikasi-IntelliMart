
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { QUERY_KEYS } from '@shared/lib/constants/queryKeys';

import {
  getBrands,
  getCategories,
  getUnits,
} from '../services/lookupService';

import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from '../services/productService';

export function useProducts() {
  return useQuery({
    queryKey: QUERY_KEYS.PRODUCTS,
    queryFn: () => getProducts(),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProduct,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.PRODUCTS,
      }),
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateProduct,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.PRODUCTS,
      }),
  });
}

/** Menghapus produk dan memperbarui daftar produk. */
export function useDeleteProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.PRODUCTS,
      }),
  });
}

/** Pilihan dropdown aktif ketika modal dibuka. */
export function useProductOptions(enabled = true) {
  const opts = {
    staleTime: 5 * 60 * 1000,
    enabled,
    retry: false,
  };

  const categories = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
    ...opts,
  });

  const brands = useQuery({
    queryKey: ['brands'],
    queryFn: getBrands,
    ...opts,
  });

  const units = useQuery({
    queryKey: ['units'],
    queryFn: getUnits,
    ...opts,
  });

  return { categories, brands, units };
}
