// src/pages/Products.jsx

import { useState } from 'react';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';

import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';

import productService from '../services/productService';
import { useFetch } from '../hooks/useFetch';
import { debounce, getErrorMessage } from '../utils/helpers';

import './Products.css';

const emptyForm = {
  product_name: '',
  description: '',
  category_id: '',
  brand_id: '',
  unit_id: '',
  is_active: true,
};

export default function Products() {

  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const { data: products, loading, error, refetch } = useFetch(
    () => productService.getAll({ search }),
    [search]
  );

  const handleSearchChange = debounce((value) => setSearch(value), 400);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (product) => {
    setEditing(product);
    setForm({
      product_name: product.product_name || '',
      description: product.description || '',
      category_id: product.category_id || '',
      brand_id: product.brand_id || '',
      unit_id: product.unit_id || '',
      is_active: product.is_active,
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
        await productService.update(editing.product_id, form);
      } else {
        await productService.create(form);
      }
      setModalOpen(false);
      refetch();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (product) => {
    if (!confirm(`Hapus produk "${product.product_name}"?`)) return;

    try {
      await productService.delete(product.product_id);
      refetch();
    } catch (err) {
      alert(getErrorMessage(err, 'Produk tidak dapat dihapus karena masih dipakai varian.'));
    }
  };

  const columns = [
    { key: 'product_name', header: 'Nama Produk' },
    { key: 'category_name', header: 'Kategori' },
    { key: 'brand_name', header: 'Brand' },
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
          <Button variant="ghost" size="sm" icon={Pencil} onClick={() => openEdit(row)}>
            Edit
          </Button>
          <Button variant="ghost" size="sm" icon={Trash2} onClick={() => handleDelete(row)}>
            Hapus
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h1 className="page__title">Produk</h1>
          <p className="page__subtitle">Kelola master produk. Harga & stok diatur per toko di menu terkait.</p>
        </div>
        <Button icon={Plus} onClick={openCreate}>Tambah Produk</Button>
      </div>

      <div className="page__toolbar">
        <div className="search-box">
          <Search size={16} />
          <input
            placeholder="Cari nama produk..."
            onChange={(e) => handleSearchChange(e.target.value)}
          />
        </div>
      </div>

      {error && <div className="page__error">{error}</div>}

      <Table columns={columns} data={products} loading={loading} emptyMessage="Belum ada produk. Tambahkan produk pertama kamu." />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Produk' : 'Tambah Produk'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button onClick={handleSubmit} loading={saving}>
              {editing ? 'Simpan Perubahan' : 'Tambah Produk'}
            </Button>
          </>
        }
      >
        <form className="form-grid" onSubmit={handleSubmit}>
          <Input
            label="Nama Produk"
            required
            value={form.product_name}
            onChange={(e) => setForm({ ...form, product_name: e.target.value })}
          />
          <Input
            label="Deskripsi"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          {formError && <div className="form-error">{formError}</div>}
        </form>
      </Modal>
    </div>
  );
}
