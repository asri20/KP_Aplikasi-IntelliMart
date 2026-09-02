// src/pages/Stock.jsx

import { useState } from 'react';
import { ArrowDownCircle, ArrowUpCircle, History } from 'lucide-react';

import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Table from '../components/ui/Table';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import { StatCard } from '../components/ui/Card';

import stockService from '../services/stockService';
import { useFetch } from '../hooks/useFetch';
import { getErrorMessage } from '../utils/helpers';
import { getStockStatus, STOCK_STATUS_LABEL, STOCK_STATUS_TONE } from '../utils/constants';

import './Products.css';

export default function Stock() {

  const [tab, setTab] = useState('balance'); // 'balance' | 'history'
  const [movementModal, setMovementModal] = useState(null); // 'in' | 'out' | null
  const [form, setForm] = useState({ store_id: '', variant_id: '', quantity: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const { data: stocks, loading, error, refetch } = useFetch(() => stockService.getAll(), []);
  const { data: movements, loading: loadingHistory } = useFetch(
    () => stockService.getMovementHistory(),
    [tab]
  );

  const lowStockCount = (stocks || []).filter(
    (s) => getStockStatus(s.quantity_available, s.min_stock) !== 'safe'
  ).length;

  const openMovementModal = (type) => {
    setMovementModal(type);
    setForm({ store_id: '', variant_id: '', quantity: '', notes: '' });
    setFormError('');
  };

  const handleSubmitMovement = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');

    try {
      if (movementModal === 'in') {
        await stockService.stockIn(form);
      } else {
        await stockService.stockOut(form);
      }
      setMovementModal(null);
      refetch();
    } catch (err) {
      setFormError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const balanceColumns = [
    { key: 'store_name', header: 'Toko' },
    { key: 'variant_name', header: 'Varian' },
    {
      key: 'quantity_available',
      header: 'Stok Tersedia',
      align: 'right',
      render: (row) => <span className="num">{row.quantity_available}</span>,
    },
    {
      key: 'min_stock',
      header: 'Stok Minimum',
      align: 'right',
      render: (row) => <span className="num">{row.min_stock}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        const status = getStockStatus(row.quantity_available, row.min_stock);
        return <Badge tone={STOCK_STATUS_TONE[status]}>{STOCK_STATUS_LABEL[status]}</Badge>;
      },
    },
  ];

  const movementColumns = [
    { key: 'created_at', header: 'Waktu', render: (row) => new Date(row.created_at).toLocaleString('id-ID') },
    { key: 'store_name', header: 'Toko' },
    { key: 'variant_name', header: 'Varian' },
    {
      key: 'movement_type',
      header: 'Tipe',
      render: (row) => (
        <Badge tone={row.movement_type === 'in' ? 'success' : row.movement_type === 'out' ? 'danger' : 'info'}>
          {row.movement_type === 'in' ? 'Masuk' : row.movement_type === 'out' ? 'Keluar' : 'Penyesuaian'}
        </Badge>
      ),
    },
    { key: 'quantity', header: 'Qty', align: 'right', render: (row) => <span className="num">{row.quantity}</span> },
    { key: 'notes', header: 'Catatan' },
  ];

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <h1 className="page__title">Stok</h1>
          <p className="page__subtitle">Saldo stok per toko dan riwayat pergerakan barang.</p>
        </div>
        <div className="row-actions">
          <Button variant="secondary" icon={ArrowDownCircle} onClick={() => openMovementModal('in')}>
            Stock In
          </Button>
          <Button variant="secondary" icon={ArrowUpCircle} onClick={() => openMovementModal('out')}>
            Stock Out
          </Button>
        </div>
      </div>

      <div className="stat-row">
        <StatCard label="Total Varian Distok" value={(stocks || []).length} />
        <StatCard label="Perlu Perhatian" value={lowStockCount} tone={lowStockCount > 0 ? 'warning' : 'success'} />
      </div>

      <div className="page__toolbar">
        <Button variant={tab === 'balance' ? 'primary' : 'ghost'} size="sm" onClick={() => setTab('balance')}>
          Saldo Stok
        </Button>
        <Button variant={tab === 'history' ? 'primary' : 'ghost'} size="sm" icon={History} onClick={() => setTab('history')}>
          Riwayat Pergerakan
        </Button>
      </div>

      {error && <div className="page__error">{error}</div>}

      {tab === 'balance' ? (
        <Table columns={balanceColumns} data={stocks} loading={loading} emptyMessage="Belum ada data stok." />
      ) : (
        <Table columns={movementColumns} data={movements} loading={loadingHistory} emptyMessage="Belum ada riwayat pergerakan." />
      )}

      <Modal
        open={!!movementModal}
        onClose={() => setMovementModal(null)}
        title={movementModal === 'in' ? 'Stock In (Barang Masuk)' : 'Stock Out (Barang Keluar)'}
        footer={
          <>
            <Button variant="secondary" onClick={() => setMovementModal(null)}>Batal</Button>
            <Button onClick={handleSubmitMovement} loading={saving}>Simpan</Button>
          </>
        }
      >
        <form className="form-grid" onSubmit={handleSubmitMovement}>
          <Input
            label="Store ID"
            required
            type="number"
            hint="Sementara input manual ID toko, ganti ke dropdown kalau modul Toko sudah tersedia di sini"
            value={form.store_id}
            onChange={(e) => setForm({ ...form, store_id: e.target.value })}
          />
          <Input
            label="Variant ID"
            required
            type="number"
            value={form.variant_id}
            onChange={(e) => setForm({ ...form, variant_id: e.target.value })}
          />
          <Input
            label="Quantity"
            required
            type="number"
            min="1"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
          />
          <Input
            label="Catatan"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
          {formError && <div className="form-error">{formError}</div>}
        </form>
      </Modal>
    </div>
  );
}
