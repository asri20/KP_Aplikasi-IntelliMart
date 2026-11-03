import { useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useQuery } from '@tanstack/react-query';

import { Button } from '@shared/components/atoms';
import { FormField, Modal } from '@shared/components/molecules';
import { useProducts } from '@features/owner/hooks';

import {
  addProductToStore,
  getProductVariants,
} from '../../services/storeProductService';

const SELECT_CLASS =
  'w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100';

const EMPTY_NEW_VARIANT = {
  name: 'Default',
  sku: '',
  barcode: '',
  costPrice: '',
};

const AddProductToStoreModal = ({
  isOpen,
  onClose,
  storeId,
  existingVariantIds = [],
  onSuccess,
}) => {
  const [productId, setProductId] = useState('');
  const [variantChoice, setVariantChoice] = useState('');
  const [newVariant, setNewVariant] = useState({ ...EMPTY_NEW_VARIANT });
  const [sellPrice, setSellPrice] = useState('');
  const [minStock, setMinStock] = useState('');
  const [initialStock, setInitialStock] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const { data: products = [], isLoading: productsLoading } = useProducts();

  const variantsQuery = useQuery({
    queryKey: ['product-variants', productId],
    queryFn: () => getProductVariants(productId),
    enabled: isOpen && Boolean(productId),
    staleTime: 0,
    retry: false,
  });

  const variants = variantsQuery.data ?? [];

  const activeProducts = useMemo(
    () => products.filter((p) => p.isActive && p.ownerId != null),
    [products]
  );

  const inStoreIds = useMemo(
    () => new Set(existingVariantIds.map((id) => String(id))),
    [existingVariantIds]
  );

  // Produk tanpa varian otomatis memakai form "varian baru".
  const hasNoVariants =
    Boolean(productId) &&
    variantsQuery.isSuccess &&
    variants.length === 0;

  const isNewVariant = variantChoice === 'new' || hasNoVariants;

  // Kosongkan form setiap kali modal dibuka.
  useEffect(() => {
    if (isOpen) {
      setProductId('');
      setVariantChoice('');
      setNewVariant({ ...EMPTY_NEW_VARIANT });
      setSellPrice('');
      setMinStock('');
      setInitialStock('');
      setError('');
      setSaving(false);
    }
  }, [isOpen]);

  const handleProductChange = (e) => {
    setProductId(e.target.value);
    setVariantChoice('');
    setNewVariant({ ...EMPTY_NEW_VARIANT });
    setError('');
  };

  const handleNewVariantChange = (e) => {
    const { name, value } = e.target;
    setNewVariant((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (saving) return;

    setError('');

    if (!productId) {
      setError('Pilih produk terlebih dahulu.');
      return;
    }

    if (variantsQuery.isLoading) {
      setError('Varian produk masih dimuat. Coba lagi sebentar.');
      return;
    }

    if (variantsQuery.isError) {
      setError('Gagal memuat varian produk. Tutup lalu buka form ini lagi.');
      return;
    }

    if (isNewVariant) {
      if (!newVariant.name.trim()) {
        setError('Nama varian wajib diisi (boleh "Default").');
        return;
      }

      if (!newVariant.sku.trim()) {
        setError('SKU wajib diisi.');
        return;
      }

      if (
        newVariant.costPrice !== '' &&
        Number(newVariant.costPrice) < 0
      ) {
        setError('Harga beli tidak boleh negatif.');
        return;
      }
    } else {
      if (!variantChoice) {
        setError('Pilih varian produk.');
        return;
      }

      if (inStoreIds.has(String(variantChoice))) {
        setError('Varian ini sudah ada di toko ini.');
        return;
      }
    }

    if (sellPrice === '' || Number(sellPrice) < 0) {
      setError('Harga jual toko wajib diisi dan tidak boleh negatif.');
      return;
    }

    if (minStock !== '' && Number(minStock) < 0) {
      setError('Stok minimum tidak boleh negatif.');
      return;
    }

    if (
      initialStock !== '' &&
      (Number(initialStock) < 0 || !Number.isInteger(Number(initialStock)))
    ) {
      setError('Stok awal harus berupa bilangan bulat, minimal 0.');
      return;
    }

    setSaving(true);

    try {
      await addProductToStore({
        storeId,
        productId,
        variantId: isNewVariant ? undefined : Number(variantChoice),
        newVariant,
        sellPrice,
        minStock,
        initialStock,
      });

      onSuccess?.();
      onClose();
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'Gagal menambahkan produk ke toko.'
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tambah Produk ke Toko"
      description="Pilih produk dari katalog Anda, lalu tentukan harga dan stok khusus toko ini."
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && (
          <p
            role="alert"
            className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
          >
            {error}
          </p>
        )}

        <div className="space-y-1.5">
          <label
            htmlFor="addProductId"
            className="block text-sm font-medium text-zinc-900"
          >
            Produk
          </label>

          <select
            id="addProductId"
            value={productId}
            onChange={handleProductChange}
            className={SELECT_CLASS}
          >
            <option value="">
              {productsLoading ? 'Memuat...' : 'Pilih produk'}
            </option>

            {activeProducts.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          {!productsLoading && activeProducts.length === 0 && (
            <p className="text-xs text-slate-500">
              Belum ada produk aktif di katalog Anda. Tambahkan dulu di
              halaman Produk.
            </p>
          )}
        </div>

        {productId && variantsQuery.isLoading && (
          <p className="text-sm text-slate-500">Memuat varian produk...</p>
        )}

        {productId && variantsQuery.isError && (
          <p className="text-xs text-red-600">Gagal memuat varian produk.</p>
        )}

        {productId && variantsQuery.isSuccess && variants.length > 0 && (
          <div className="space-y-1.5">
            <label
              htmlFor="addVariantId"
              className="block text-sm font-medium text-zinc-900"
            >
              Varian
            </label>

            <select
              id="addVariantId"
              value={variantChoice}
              onChange={(e) => {
                setVariantChoice(e.target.value);
                setError('');
              }}
              className={SELECT_CLASS}
            >
              <option value="">Pilih varian</option>

              {variants.map((v) => {
                const alreadyInStore = inStoreIds.has(String(v.id));

                return (
                  <option key={v.id} value={v.id} disabled={alreadyInStore}>
                    {v.name} ({v.sku})
                    {alreadyInStore ? ' - sudah ada di toko ini' : ''}
                  </option>
                );
              })}

              <option value="new">+ Buat varian baru</option>
            </select>
          </div>
        )}

        {productId && isNewVariant && (
          <div className="space-y-4 rounded-xl border border-orange-100 bg-orange-50/40 p-4">
            <p className="text-sm font-semibold text-slate-700">
              Varian baru
            </p>

            <FormField
              label="Nama Varian"
              name="name"
              value={newVariant.name}
              onChange={handleNewVariantChange}
              placeholder="Default"
              required
              fullWidth
            />

            <FormField
              label="SKU"
              name="sku"
              value={newVariant.sku}
              onChange={handleNewVariantChange}
              placeholder="Contoh: MIE-SEDAP-GRG"
              helperText="SKU harus unik di seluruh database."
              required
              fullWidth
            />

            <FormField
              label="Barcode (opsional)"
              name="barcode"
              value={newVariant.barcode}
              onChange={handleNewVariantChange}
              fullWidth
            />

            <FormField
              label="Harga Beli (opsional)"
              name="costPrice"
              type="number"
              min="0"
              value={newVariant.costPrice}
              onChange={handleNewVariantChange}
              placeholder="0"
              fullWidth
            />
          </div>
        )}

        <FormField
          label="Harga Jual di Toko Ini"
          name="sellPrice"
          type="number"
          min="0"
          value={sellPrice}
          onChange={(e) => setSellPrice(e.target.value)}
          placeholder="0"
          required
          fullWidth
        />

        <FormField
          label="Stok Awal (opsional)"
          name="initialStock"
          type="number"
          min="0"
          value={initialStock}
          onChange={(e) => setInitialStock(e.target.value)}
          placeholder="0"
          helperText="Dicatat sebagai stok masuk awal untuk toko ini."
          fullWidth
        />

        <FormField
          label="Stok Minimum (opsional)"
          name="minStock"
          type="number"
          min="0"
          value={minStock}
          onChange={(e) => setMinStock(e.target.value)}
          placeholder="0"
          fullWidth
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>
            Batal
          </Button>

          <Button type="submit" loading={saving}>
            Tambahkan ke Toko
          </Button>
        </div>
      </form>
    </Modal>
  );
};

AddProductToStoreModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  storeId: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
    .isRequired,
  existingVariantIds: PropTypes.arrayOf(
    PropTypes.oneOfType([PropTypes.string, PropTypes.number])
  ),
  onSuccess: PropTypes.func,
};

export default AddProductToStoreModal;