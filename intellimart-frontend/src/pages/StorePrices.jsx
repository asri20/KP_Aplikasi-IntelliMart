// src/pages/StorePrices.jsx

import { useState } from 'react';
import { Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react';

import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';

import priceService from '../services/priceService';
import variantService from '../services/variantService';
import { useFetch } from '../hooks/useFetch';
import { getErrorMessage } from '../utils/helpers';
import { formatCurrency } from '../utils/formatCurrency';

import './Products.css';

const emptyForm = {
  variant_id: '',
  pricing_mode: 'flat', // 'flat' | 'tier'
  base_price: '',
  price_code_id: '',
  discount_percent: 0,
};

export default function StorePrices() {

  // Sementara input manual — ganti ke StoreSwitcher global kalau sudah terhubung
  const [storeId, setStoreId] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const { data: prices, loading, error, refetch } = useFetch(
    () => (storeId ? priceService.getStorePrices(storeId) : Promise.resolve({ data: [] })),
    [storeId]
  );

  const { data: missing } = useFetch(
    () => (storeId ? priceService.getMissingPrices(storeId) : Promise.resolve({ data: [] })),
    [storeId]
  );

  const { data: variants } = useFetch(() => variantService.getAll(), []);
  const { data: priceCodes } = useFetch(() => priceService.getPriceCodes(), []);

  const variantOptions = (variants || []).map((v) => ({
    value: v.variant_id,
    label: `${v.product_name} — ${v.variant_name} (${v.sku})`,
  }));

  const priceCodeOptions = (priceCodes || []).map((pc) => ({
    value: pc.price_code_id,
    label: pc.price_code,
  }));

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      variant_id: row.variant_id,
      pricing_mode: row.price_code_id ? 'tier' : 'flat',
      base_price: row.base_price || '',
      price_code_id: row.price_code_id || '',
      discount_percent: row.discount_percent || 0,
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!storeId) {
      setFormError('Pilih toko terlebih dahulu.');
      return;
    }

    const payload = {
      variant_id: form.variant_id,
      discount_percent: form.discount_percent,
      base_price: form.pricing_mode === 'flat' ? form.base_price : null,
      price_code_id: form.pricing_mode === 'tier' ? form.price_code_id : null,
    };

    setSaving(true);
    setFormError('');

    try {
      if (editing) {
        await priceService.updateStorePrice(storeId, editing.id, payload);
      } else {
        await priceService.createStorePrice(storeId, payload);
      }
      setModalOpen(false);
      refetch();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (row) => {
    if (!confirm(`Hapus harga untuk "${row.variant_name}" di toko ini?`)) return;

    try {
      await priceService.deleteStorePrice(storeId, row.id);
      refetch();
    } catch (err) {
      alert(getErrorMessage(err));
    }
  };

  const columns = [
    { key: 'product_name', header: 'Produk' },
    { key: 'variant_name', header: 'Varian' },
    {
      key: 'pricing',
      header: 'Skema Harga',
      render: (row) =>
        row.price_code_id ? (
          <Badge tone="info">Tier: {row.price_code}</Badge>
        ) : (
          <span className="num">{formatCurrency(row.base_price)}</span>
        ),
    },
    {
      key: 'discount_percent',
      header: 'Diskon',
      align: 'right',
      render: (row) => <span className="num">{row.discount_percent}%</span>,
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
          <h1 className="page__title">Harga per Toko</h1>
          <p className="page__subtitle">
            Setiap toko wajib punya harga sendiri — tidak ada harga default/global.
          </p>
        </div>
        <Button icon={Plus} onClick={openCreate} disabled={!storeId}>Set Harga Baru</Button>
      </div>

      <div className="page__toolbar">
        <Input
          label="Toko (Store ID)"
          type="number"
          placeholder="Masukkan ID toko"
          value={storeId}
          onChange={(e) => setStoreId(e.target.value)}
          hint="Sementara input manual, ganti ke StoreSwitcher global kalau sudah terhubung"
        />
      </div>

      {!storeId && (
        <div className="table-state">Pilih toko dulu untuk melihat/mengatur harga.</div>
      )}

      {storeId && missing && missing.length > 0 && (
        <div className="page__error">
          <AlertTriangle size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
          {missing.length} produk aktif belum punya harga di toko ini dan tidak akan bisa dijual.
        </div>
      )}

      {storeId && error && <div className="page__error">{error}</div>}

      {storeId && (
        <Table columns={columns} data={prices} loading={loading} emptyMessage="Belum ada harga di-set untuk toko ini." />
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Edit Harga' : 'Set Harga Baru'}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setModalOpen(false)}>Batal</Button>
            <Button onClick={handleSubmit} loading={saving}>Simpan</Button>
          </>
        }
      >
        <form className="form-grid" onSubmit={handleSubmit}>
          <Select
            label="Varian"
            required
            options={variantOptions}
            value={form.variant_id}
            onChange={(e) => setForm({ ...form, variant_id: e.target.value })}
            disabled={!!editing}
          />

          <div>
            <label className="field__label" style={{ marginBottom: 8, display: 'block' }}>
              Skema Harga
            </label>
            <div className="row-actions" style={{ justifyContent: 'flex-start', gap: 8 }}>
              <Button
                type="button"
                variant={form.pricing_mode === 'flat' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setForm({ ...form, pricing_mode: 'flat' })}
              >
                Harga Flat
              </Button>
              <Button
                type="button"
                variant={form.pricing_mode === 'tier' ? 'primary' : 'secondary'}
                size="sm"
                onClick={() => setForm({ ...form, pricing_mode: 'tier' })}
              >
                Harga Bertingkat (Tier)
              </Button>
            </div>
          </div>

          {form.pricing_mode === 'flat' ? (
            <Input
              label="Harga Jual (Rp)"
              required
              type="number"
              min="0"
              value={form.base_price}
              onChange={(e) => setForm({ ...form, base_price: e.target.value })}
            />
          ) : (
            <Select
              label="Kode Harga (Tier)"
              required
              options={priceCodeOptions}
              value={form.price_code_id}
              onChange={(e) => setForm({ ...form, price_code_id: e.target.value })}
              hint="Kelola tier qty->harga di menu Kode Harga"
            />
          )}

          <Input
            label="Diskon Toko (%)"
            type="number"
            min="0"
            max="100"
            value={form.discount_percent}
            onChange={(e) => setForm({ ...form, discount_percent: e.target.value })}
            hint="Berlaku di atas harga flat maupun tier"
          />

          {formError && <div className="form-error">{formError}</div>}
        </form>
      </Modal>
    </div>
  );
}
