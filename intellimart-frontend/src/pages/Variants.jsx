// src/pages/Variants.jsx

import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';

import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';

import variantService from '../services/variantService';
import productService from '../services/productService';
import { useFetch } from '../hooks/useFetch';
import { getErrorMessage } from '../utils/helpers';

import './Products.css';

const emptyForm = {
  product_id: '',
  sku: '',
  barcode: '',
  variant_name: '',
  cost_price: 0,
  weight: '',
  is_active: true,
};

export default function Variants() {

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const { data: variants, loading, error, refetch } = useFetch(() => variantService.getAll(), []);
  const { data: products } = useFetch(() => productService.getAll(), []);

  const productOptions = (products || []).map((p) => ({
    value: p.product_id,
    label: p.product_name,
  }));

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (variant) => {
    setEditing(variant);
    setForm({
      product_id: variant.product_id || '',
      sku: variant.sku || '',
      barcode: variant.barcode || '',
      variant_name: variant.variant_name || '',
      cost_price: variant.cost_price || 0,
      weight: variant.weight || '',
      is_active: variant.is_active,
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');

    try {
      if (editing) {
        await variantService.update(editing.variant_id, form);
      } else {
        await variantService.create(form);
      }
      setModalOpen(false);
      refetch();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (variant) => {
    if (!confirm(`Hapus varian "${variant.variant_name}"?`)) return;

    try {
      await variantService.delete(variant.variant_id);
      refetch();
    } catch (err) {
      alert(getErrorMessage(err, 'Varian tidak dapat dihapus karena masih dipakai.'));
    }
  };

  const columns = [
    { key: 'sku', header: 'SKU' },
    { key: 'variant_name', header: 'Varian' },
    { key: 'product_name', header: 'Produk' },
    {
      key: 'cost_price',
      header: 'Harga Modal',
      align: 'right',
      render: (row) => <span className="num">Rp {Number(row.cost_price).toLocaleString('id-ID')}</span>,
    },
    {
      key: 'is_active',
      header: 'Status',
      render: (row) => (
        <Badge tone={row.is_active ? 'success' : 'neutral'}>
          {row.is_active ? 'Aktif' : 'Nonaktif'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      render: (row) => (
        <div className="row-actions">
          <Button variant="ghost" size="sm" icon={Pencil} onClick={() => openEdit(row)}>Edit</Button>
          <Button variant="ghost" size="sm" icon={Trash2} onClick={() => handleDelete(row)}>Hapus</Button>
        </div>
      ),
    },
  ];

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h1 className="page__title">Varian Produk</h1>
          <p className="page__subtitle">
            Harga jual TIDAK diatur di sini — buka menu <strong>Harga Toko</strong> untuk set harga per cabang.
          </p>
        </div>
        <Button icon={Plus} onClick={openCreate}>Tambah Varian</Button>
      </div>

      {error && <div className="page__error">{error}</div>}

      <Table columns={columns} data={variants} loading={loading} emptyMessage="Belum ada varian." />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Varian' : 'Tambah Varian'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button onClick={handleSubmit} loading={saving}>
              {editing ? 'Simpan Perubahan' : 'Tambah Varian'}
            </Button>
          </>
        }
      >
        <form className="form-grid" onSubmit={handleSubmit}>
          <Select
            label="Produk"
            required
            options={productOptions}
            value={form.product_id}
            onChange={(e) => setForm({ ...form, product_id: e.target.value })}
          />

          <div className="form-grid--2col">
            <Input
              label="SKU"
              required
              value={form.sku}
              onChange={(e) => setForm({ ...form, sku: e.target.value })}
            />
            <Input
              label="Barcode"
              value={form.barcode}
              onChange={(e) => setForm({ ...form, barcode: e.target.value })}
            />
          </div>

          <Input
            label="Nama Varian"
            required
            value={form.variant_name}
            onChange={(e) => setForm({ ...form, variant_name: e.target.value })}
          />

          <div className="form-grid--2col">
            <Input
              label="Harga Modal (cost price)"
              type="number"
              min="0"
              value={form.cost_price}
              onChange={(e) => setForm({ ...form, cost_price: e.target.value })}
            />
            <Input
              label="Berat (gram)"
              type="number"
              min="0"
              value={form.weight}
              onChange={(e) => setForm({ ...form, weight: e.target.value })}
            />
          </div>

          {formError && <div className="form-error">{formError}</div>}
        </form>
      </Modal>
    </div>
  );
}
