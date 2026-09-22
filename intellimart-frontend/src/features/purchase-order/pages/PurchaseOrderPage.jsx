import React, { useState, useEffect } from 'react';
import {
  createPurchaseOrder,
  receivePOItem,
  getPurchaseOrders,
  getPODetail,
  getSuppliers,
  getProductVariants,
} from '../api/poApi';

export default function PurchaseOrderPage() {
  // State Master Data
  const [poList, setPoList] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [variants, setVariants] = useState([]);

  // State Detail Items PO (Disimpan per po_id)
  const [poDetails, setPoDetails] = useState({});
  const [loadingDetails, setLoadingDetails] = useState({});

  // State UI & Messages
  const [loading, setLoading] = useState(false);
  const [masterLoading, setMasterLoading] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [expandedPoId, setExpandedPoId] = useState(null);

  // State Form Buat PO
  const [supplierId, setSupplierId] = useState('');
  const [expectedDate, setExpectedDate] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [items, setItems] = useState([
    { _key: Date.now(), variant_id: '', qty_ordered: 10, unit_price: 0 },
  ]);

  // State Form Penerimaan Fisik
  const [selectedItemForReceive, setSelectedItemForReceive] = useState(null);
  const [receiveQty, setReceiveQty] = useState('');

  // Reset Form Buat PO
  const resetPoForm = (supplierList = suppliers, variantList = variants) => {
    if (supplierList && supplierList.length > 0) {
      setSupplierId(supplierList[0].id || supplierList[0].supplier_id);
    } else {
      setSupplierId('');
    }

    if (variantList && variantList.length > 0) {
      const firstVar = variantList[0];
      setItems([
        {
          _key: Date.now(),
          variant_id: firstVar.id || firstVar.variant_id,
          qty_ordered: 10,
          unit_price: firstVar.cost_price || firstVar.price || 0,
        },
      ]);
    } else {
      setItems([{ _key: Date.now(), variant_id: '', qty_ordered: 10, unit_price: 0 }]);
    }

    setExpectedDate(
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    );
  };

  // Fetch Initial Data
  const loadInitialData = async () => {
    try {
      setMasterLoading(true);

      const [fetchedPOs, fetchedSuppliers, fetchedVariants] = await Promise.all([
        getPurchaseOrders(1).catch(() => []),
        getSuppliers().catch(() => []),
        getProductVariants(1).catch(() => []),
      ]);

      setPoList(fetchedPOs || []);
      setSuppliers(fetchedSuppliers || []);
      setVariants(fetchedVariants || []);

      resetPoForm(fetchedSuppliers || [], fetchedVariants || []);
    } catch (err) {
      console.error('Gagal memuat data awal:', err);
      setMessage({ type: 'error', text: 'Gagal terhubung ke Database Backend.' });
    } finally {
      setMasterLoading(false);
    }
  };

  const refreshPOList = async () => {
    try {
      const fetchedPOs = await getPurchaseOrders(1);
      setPoList(fetchedPOs || []);
    } catch (err) {
      console.error('Gagal refresh daftar PO:', err);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Handler Multi-Item Form
  const handleAddItemRow = () => {
    const defaultVar = variants[0];
    const defaultVarId = defaultVar ? defaultVar.id || defaultVar.variant_id : '';
    setItems((prev) => [
      ...prev,
      {
        _key: Date.now() + Math.random(),
        variant_id: defaultVarId,
        qty_ordered: 1,
        unit_price: defaultVar ? defaultVar.cost_price || defaultVar.price || 0 : 0,
      },
    ]);
  };

  const handleRemoveItemRow = (index) => {
    if (items.length === 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleVariantSelect = (index, selectedVarId) => {
    const foundVar = variants.find(
      (v) => String(v.id || v.variant_id) === String(selectedVarId)
    );
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        return {
          ...item,
          variant_id: selectedVarId,
          unit_price: foundVar ? foundVar.cost_price || foundVar.price || 0 : item.unit_price,
        };
      })
    );
  };

  const handleItemChange = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        return {
          ...item,
          [field]: field === 'qty_ordered' || field === 'unit_price' ? (value === '' ? '' : Number(value)) : value,
        };
      })
    );
  };

  const totalPOAmount = items.reduce(
    (sum, item) => sum + (Number(item.qty_ordered) || 0) * (Number(item.unit_price) || 0),
    0
  );

  // Helper Resolving Nama
  const getSupplierDisplayName = (po) => {
    if (po.supplier_name) return po.supplier_name;
    const found = suppliers.find((s) => String(s.id || s.supplier_id) === String(po.supplier_id));
    return found ? found.name || found.supplier_name : `Supplier #${po.supplier_id}`;
  };

  const getVariantDisplayName = (item) => {
    if (!item) return '-';
    if (item.variant_name) return item.variant_name;
    const found = variants.find((v) => String(v.id || v.variant_id) === String(item.variant_id));
    return found ? found.name || found.variant_name : `Variant #${item.variant_id}`;
  };

  // Submit Buat PO
  const handleCreatePO = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (!supplierId) {
      setMessage({ type: 'error', text: 'Silakan pilih Supplier.' });
      return;
    }

    const hasInvalid = items.some((item) => !item.variant_id || Number(item.qty_ordered) <= 0);
    if (hasInvalid) {
      setMessage({ type: 'error', text: 'Pastikan memilih Varian dan Qty > 0.' });
      return;
    }

    setLoading(true);

    try {
      const payload = {
        po_number: `PO-${Date.now()}`,
        store_id: 1,
        supplier_id: Number(supplierId),
        created_by: 1,
        expected_date: expectedDate,
        items: items.map((item) => ({
          variant_id: Number(item.variant_id),
          qty_ordered: Number(item.qty_ordered),
          unit_price: Number(item.unit_price),
        })),
      };

      await createPurchaseOrder(payload);
      setMessage({ type: 'success', text: 'Purchase Order baru berhasil dibuat!' });
      resetPoForm();
      await refreshPOList();
    } catch (err) {
      setMessage({ type: 'error', text: `Gagal simpan PO: ${err.response?.data?.error || err.message}` });
    } finally {
      setLoading(false);
    }
  };

  // Expand PO Row & Fetch Items dari GET /api/po/:id
  const toggleExpandPo = async (poId) => {
    if (expandedPoId === poId) {
      setExpandedPoId(null);
      return;
    }

    setExpandedPoId(poId);

    // Ambil detail jika belum tersimpan di state local
    if (!poDetails[poId]) {
      try {
        setLoadingDetails((prev) => ({ ...prev, [poId]: true }));
        const res = await getPODetail(poId);
        if (res && res.items) {
          setPoDetails((prev) => ({ ...prev, [poId]: res.items }));
        }
      } catch (err) {
        console.error(`Gagal ambil detail PO #${poId}:`, err);
      } finally {
        setLoadingDetails((prev) => ({ ...prev, [poId]: false }));
      }
    }
  };

  // Refresh Detail PO Spesifik
  const refreshSinglePODetail = async (poId) => {
    try {
      const res = await getPODetail(poId);
      if (res && res.items) {
        setPoDetails((prev) => ({ ...prev, [poId]: res.items }));
      }
    } catch (err) {
      console.error(`Gagal refresh detail PO #${poId}:`, err);
    }
  };

  // Submit Penerimaan Barang (POST /api/po/receive)
  const handleReceiveBarang = async (e) => {
    e.preventDefault();
    if (!selectedItemForReceive) return;

    const qty = Number(receiveQty);
    if (!receiveQty || isNaN(qty) || qty <= 0) {
      setMessage({ type: 'error', text: 'Jumlah barang diterima harus > 0.' });
      return;
    }

    const detailId = Number(selectedItemForReceive.po_detail_id);
    if (!detailId) {
      setMessage({ type: 'error', text: 'Gagal: po_detail_id tidak valid.' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await receivePOItem({
        po_detail_id: detailId,
        qty_received: qty,
        user_id: 1,
      });

      setMessage({
        type: 'success',
        text: `Berhasil menerima ${qty} unit barang! Stok otomatis bertambah.`,
      });

      const activePoId = selectedItemForReceive.po_id;
      setSelectedItemForReceive(null);
      setReceiveQty('');

      // Refresh list utama & detail item
      await refreshPOList();
      if (activePoId) {
        await refreshSinglePODetail(activePoId);
      }
    } catch (err) {
      console.error('Error receivePOItem:', err);
      setMessage({
        type: 'error',
        text: `Gagal proses penerimaan: ${err.response?.data?.error || err.message}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredPOList = poList.filter((po) => {
    if (filterStatus === 'ALL') return true;
    const statusUpper = String(po.status || '').toUpperCase();
    if (filterStatus === 'PARTIALLY_RECEIVED') {
      return statusUpper === 'PARTIALLY_RECEIVED' || statusUpper === 'PARTIAL';
    }
    return statusUpper === filterStatus.toUpperCase();
  });

  const getStatusBadge = (status) => {
    const formattedStatus = String(status || '').toUpperCase();
    switch (formattedStatus) {
      case 'RECEIVED':
        return (
          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-full dark:bg-emerald-900/30 dark:text-emerald-400">
            RECEIVED
          </span>
        );
      case 'PARTIALLY_RECEIVED':
      case 'PARTIAL':
        return (
          <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-semibold rounded-full dark:bg-amber-900/30 dark:text-amber-400">
            PARTIAL
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 bg-zinc-100 text-zinc-800 text-xs font-semibold rounded-full dark:bg-zinc-700 dark:text-zinc-300">
            {formattedStatus || 'DRAFT'}
          </span>
        );
    }
  };

  if (masterLoading) {
    return (
      <div className="p-8 text-center text-zinc-500 animate-pulse">
        Menghubungkan ke Database & Mengambil Master Data...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Judul */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Modul Purchase Order & Penerimaan Stok
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Kelola pengadaan barang ke supplier dan pencatatan penerimaan fisik gudang.
        </p>
      </div>

      {/* Alert Pesan Status */}
      {message.text && (
        <div
          className={`p-4 rounded-lg border text-sm font-medium ${
            message.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/40 dark:border-emerald-800 dark:text-emerald-300'
              : 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950/40 dark:border-red-800 dark:text-red-300'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Container Utama */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel Left: Form Buat PO Multi-Item */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-800 rounded-xl p-5 border border-zinc-200 dark:border-zinc-700 shadow-sm space-y-5">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 border-b pb-3 border-zinc-200 dark:border-zinc-700">
            1. Buat Dokumen Purchase Order (PO)
          </h2>

          <form onSubmit={handleCreatePO} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1">
                  Pilih Supplier
                </label>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-600 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 dark:text-zinc-100"
                  required
                >
                  <option value="" disabled>-- Pilih Supplier --</option>
                  {suppliers.map((sup) => {
                    const sId = sup.id || sup.supplier_id;
                    return (
                      <option key={sId} value={sId}>
                        {sup.name || sup.supplier_name} (ID #{sId})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider mb-1">
                  Estimasi Tiba (Expected Date)
                </label>
                <input
                  type="date"
                  value={expectedDate}
                  onChange={(e) => setExpectedDate(e.target.value)}
                  className="w-full p-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-600 rounded-lg text-sm focus:ring-2 focus:ring-brand-500 dark:text-zinc-100"
                  required
                />
              </div>
            </div>

            {/* Tabel Baris Barang */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                  Daftar Barang Pesanan
                </label>
                <button
                  type="button"
                  onClick={handleAddItemRow}
                  className="text-xs text-brand-600 dark:text-brand-400 font-semibold hover:underline"
                >
                  + Tambah Baris Barang
                </button>
              </div>

              {items.map((item, index) => (
                <div
                  key={item._key || index}
                  className="grid grid-cols-12 gap-2 items-center bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-lg border border-zinc-200 dark:border-zinc-700"
                >
                  <div className="col-span-5">
                    <span className="text-[10px] text-zinc-400 block mb-0.5">Nama Produk / Variant</span>
                    <select
                      value={item.variant_id}
                      onChange={(e) => handleVariantSelect(index, e.target.value)}
                      className="w-full p-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded text-sm dark:text-zinc-100"
                      required
                    >
                      <option value="" disabled>-- Pilih Varian --</option>
                      {variants.map((v) => {
                        const vId = v.id || v.variant_id;
                        return (
                          <option key={vId} value={vId}>
                            {v.name || v.variant_name || `Variant #${vId}`}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="col-span-3">
                    <span className="text-[10px] text-zinc-400 block mb-0.5">Qty Pesan</span>
                    <input
                      type="number"
                      min="1"
                      value={item.qty_ordered}
                      onChange={(e) => handleItemChange(index, 'qty_ordered', e.target.value)}
                      className="w-full p-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded text-sm dark:text-zinc-100"
                      required
                    />
                  </div>

                  <div className="col-span-3">
                    <span className="text-[10px] text-zinc-400 block mb-0.5">Harga Beli (@Rp)</span>
                    <input
                      type="number"
                      min="0"
                      value={item.unit_price}
                      onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                      className="w-full p-2 bg-white dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-600 rounded text-sm dark:text-zinc-100"
                      required
                    />
                  </div>

                  <div className="col-span-1 text-right pt-4">
                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItemRow(index)}
                        className="text-red-500 hover:text-red-700 text-sm font-bold"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center p-3 bg-brand-50 dark:bg-brand-950/20 rounded-lg text-brand-900 dark:text-brand-200">
              <span className="text-sm font-semibold">Total Estimasi Nilai PO:</span>
              <span className="text-lg font-bold">Rp {totalPOAmount.toLocaleString('id-ID')}</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-lg shadow transition disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : 'Kirim & Terbitkan PO'}
            </button>
          </form>
        </div>

        {/* Panel Right: Form Penerimaan Fisik */}
        <div className="bg-white dark:bg-zinc-800 rounded-xl p-5 border border-zinc-200 dark:border-zinc-700 shadow-sm space-y-4">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 border-b pb-3 border-zinc-200 dark:border-zinc-700">
            2. Form Penerimaan Fisik
          </h2>

          {selectedItemForReceive ? (
            <form
              onSubmit={handleReceiveBarang}
              className="space-y-4 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 rounded-lg border border-emerald-200 dark:border-emerald-800"
            >
              <div className="text-xs space-y-1.5 text-zinc-700 dark:text-zinc-300">
                <p>
                  <strong>No. PO:</strong>{' '}
                  <span className="font-mono text-brand-600 dark:text-brand-400 font-bold">
                    {selectedItemForReceive.po_number || '-'}
                  </span>
                </p>
                <p>
                  <strong>Detail ID (`tt_purchase_order_detail`):</strong>{' '}
                  <span className="font-mono text-emerald-600 font-bold">
                    #{selectedItemForReceive.po_detail_id}
                  </span>
                </p>
                <p><strong>Produk:</strong> {getVariantDisplayName(selectedItemForReceive)}</p>
                <p><strong>Qty Dipesan:</strong> {selectedItemForReceive.qty_ordered}</p>
                <p><strong>Sudah Diterima:</strong> {selectedItemForReceive.qty_received || 0}</p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-600 dark:text-zinc-400 uppercase mb-1">
                  Jumlah Barang Diterima
                </label>
                <input
                  type="number"
                  min="1"
                  value={receiveQty}
                  onChange={(e) => setReceiveQty(e.target.value)}
                  placeholder="Masukkan Qty Diterima"
                  className="w-full p-2.5 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-600 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 dark:text-zinc-100"
                  required
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm rounded-lg shadow transition disabled:opacity-50"
                >
                  {loading ? 'Menyimpan...' : 'Konfirmasi Penerimaan'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedItemForReceive(null)}
                  className="px-3 py-2 bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-sm rounded-lg hover:bg-zinc-300 transition"
                >
                  Batal
                </button>
              </div>
            </form>
          ) : (
            <div className="p-6 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-400">
              <p className="text-sm">
                Klik tombol <strong>"Lihat Item / Terima"</strong> pada riwayat PO di bawah untuk memproses penerimaan fisik barang per produk.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Tabel Monitoring PO */}
      <div className="bg-white dark:bg-zinc-800 rounded-xl p-5 border border-zinc-200 dark:border-zinc-700 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            3. Monitoring & Riwayat Purchase Order
          </h2>

          <div className="flex items-center gap-2 text-xs flex-wrap">
            <span className="text-zinc-500">Filter Status:</span>
            {['ALL', 'DRAFT', 'PARTIALLY_RECEIVED', 'RECEIVED'].map((st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1 rounded-full font-medium transition ${
                  filterStatus === st
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                    : 'bg-zinc-100 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-300'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-100 dark:bg-zinc-700/50 text-zinc-600 dark:text-zinc-300 text-xs uppercase tracking-wider">
              <tr>
                <th className="p-3">No. PO</th>
                <th className="p-3">Supplier</th>
                <th className="p-3">Status Dokumen</th>
                <th className="p-3 text-right">Detail & Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
              {filteredPOList.length > 0 ? (
                filteredPOList.map((po) => {
                  const poId = po.po_id || po.id;

                  return (
                    <React.Fragment key={poId}>
                      <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-700/40">
                        <td className="p-3 font-mono font-medium text-brand-600 dark:text-brand-400">
                          {po.po_number}
                        </td>
                        <td className="p-3">{getSupplierDisplayName(po)}</td>
                        <td className="p-3">{getStatusBadge(po.status)}</td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => toggleExpandPo(poId)}
                            className="px-3 py-1 bg-zinc-200 dark:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-semibold rounded hover:bg-zinc-300 transition"
                          >
                            {expandedPoId === poId ? 'Sembunyikan Item' : 'Lihat Item / Terima'}
                          </button>
                        </td>
                      </tr>

                      {expandedPoId === poId && (
                        <tr>
                          <td
                            colSpan="4"
                            className="p-4 bg-zinc-50 dark:bg-zinc-900/60 border-y border-zinc-200 dark:border-zinc-700"
                          >
                            <div className="space-y-2">
                              <h4 className="text-xs font-bold uppercase text-zinc-500 tracking-wider">
                                Daftar Item Pesanan (PO #{po.po_number})
                              </h4>

                              {loadingDetails[poId] ? (
                                <p className="text-xs text-zinc-400 animate-pulse">
                                  Mengambil detail barang dari database...
                                </p>
                              ) : poDetails[poId] && poDetails[poId].length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {poDetails[poId].map((item) => (
                                    <div
                                      key={item.po_detail_id}
                                      className="p-3 bg-white dark:bg-zinc-800 rounded border border-zinc-200 dark:border-zinc-700 flex justify-between items-center text-xs"
                                    >
                                      <div>
                                        <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                                          {getVariantDisplayName(item)}
                                        </p>
                                        <p className="text-zinc-500">
                                          Qty Pesan: {item.qty_ordered} | Diterima: {item.qty_received || 0}
                                        </p>
                                      </div>

                                      {String(po.status).toUpperCase() !== 'RECEIVED' && (
                                        <button
                                          onClick={() => {
                                            setSelectedItemForReceive({
                                              ...item,
                                              po_id: poId,
                                              po_number: po.po_number,
                                            });
                                            setReceiveQty('');
                                          }}
                                          className="px-2.5 py-1 bg-emerald-600 text-white text-[11px] font-semibold rounded hover:bg-emerald-700 transition"
                                        >
                                          Terima Item
                                        </button>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-xs text-zinc-500">Belum ada item terdaftar pada PO ini.</p>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" className="p-6 text-center text-zinc-500">
                    Belum ada dokumen PO yang sesuai dari Database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}