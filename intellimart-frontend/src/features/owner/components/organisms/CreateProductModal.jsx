import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import { Button } from '@shared/components/atoms';
import { FormField, Modal } from '@shared/components/molecules';

import {
  useCreateProduct,
  useUpdateProduct,
  useProductOptions,
} from '../../hooks';

const EMPTY = {
  name: '',
  description: '',
  categoryId: '',
  brandId: '',
  unitId: '',
  isActive: true,
};

const SELECT_CLASS =
  'w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-slate-700 outline-none focus:border-orange-300 focus:ring-2 focus:ring-orange-100';

const SelectField = ({
  label,
  name,
  value,
  onChange,
  query,
  placeholder,
}) => (
  <div className="space-y-1.5">
    <label htmlFor={name} className="block text-sm font-medium text-zinc-900">
      {label}
    </label>

    <select
      id={name}
      name={name}
      value={value}
      onChange={onChange}
      className={SELECT_CLASS}
    >
      <option value="">
        {query.isLoading ? 'Memuat...' : placeholder}
      </option>

      {(query.data ?? []).map((o) => (
        <option key={o.id} value={o.id}>
          {o.name}
        </option>
      ))}
    </select>

    {query.isError && (
      <p className="text-xs text-red-600">
        Gagal memuat {label.toLowerCase()}.
      </p>
    )}
  </div>
);

SelectField.propTypes = {
  label: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  query: PropTypes.shape({
    isLoading: PropTypes.bool,
    isError: PropTypes.bool,
    data: PropTypes.array,
  }).isRequired,
  placeholder: PropTypes.string.isRequired,
};

const toForm = (product) => {
  if (!product) return { ...EMPTY };

  return {
    name: product.name ?? '',
    description: product.description ?? '',
    categoryId:
      product.categoryId == null ? '' : String(product.categoryId),
    brandId: product.brandId == null ? '' : String(product.brandId),
    unitId: product.unitId == null ? '' : String(product.unitId),
    isActive: product.isActive ?? true,
  };
};

const CreateProductModal = ({ isOpen, onClose, product, mode }) => {
  const [form, setForm] = useState({ ...EMPTY });
  const [error, setError] = useState('');

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const { categories, brands, units } = useProductOptions(isOpen);

  const isEdit = mode === 'edit' && Boolean(product);
  const isSaving =
    createProduct.isPending || updateProduct.isPending;

  useEffect(() => {
    if (isOpen) {
      setForm(toForm(isEdit ? product : null));
      setError('');
    }
  }, [isOpen, isEdit, product]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleClose = () => {
    setForm({ ...EMPTY });
    setError('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) {
      setError('Nama produk wajib diisi.');
      return;
    }

    try {
      const payload = {
        ...form,
        name: form.name.trim(),
        description: form.description.trim(),
        categoryId: form.categoryId || null,
        brandId: form.brandId || null,
        unitId: form.unitId || null,
      };

      if (isEdit) {
        if (product.ownerId == null) {
          setError(
            'Produk bawaan tidak dapat diedit. Hanya produk milik Owner yang bisa diubah.'
          );
          return;
        }

        await updateProduct.mutateAsync({
          id: product.id,
          ...payload,
        });
      } else {
        await createProduct.mutateAsync(payload);
      }

      handleClose();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          'Gagal menyimpan produk.'
      );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isEdit ? 'Edit Produk' : 'Tambah Produk'}
      description={
        isEdit
          ? 'Ubah informasi produk yang dipilih.'
          : 'Produk akan tersimpan sebagai milik akun Owner Anda.'
      }
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

        <FormField
          label="Nama Produk"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Indomie Goreng"
          required
          fullWidth
        />

        <FormField
          label="Deskripsi (opsional)"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Keterangan singkat produk"
          fullWidth
        />

        <SelectField
          label="Kategori"
          name="categoryId"
          value={form.categoryId}
          onChange={handleChange}
          query={categories}
          placeholder="Pilih kategori"
        />

        <SelectField
          label="Brand"
          name="brandId"
          value={form.brandId}
          onChange={handleChange}
          query={brands}
          placeholder="Pilih brand"
        />

        <SelectField
          label="Satuan"
          name="unitId"
          value={form.unitId}
          onChange={handleChange}
          query={units}
          placeholder="Pilih satuan"
        />

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            name="isActive"
            checked={form.isActive}
            onChange={handleChange}
            className="h-4 w-4 accent-orange-500"
          />
          Produk aktif
        </label>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={handleClose}>
            Batal
          </Button>

          <Button type="submit" loading={isSaving}>
            {isEdit ? 'Simpan Perubahan' : 'Simpan Produk'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

CreateProductModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  product: PropTypes.object,
  mode: PropTypes.oneOf(['create', 'edit']),
};

CreateProductModal.defaultProps = {
  product: null,
  mode: 'create',
};

export default CreateProductModal;