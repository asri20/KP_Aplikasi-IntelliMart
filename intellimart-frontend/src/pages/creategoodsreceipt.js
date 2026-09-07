// src/pages/CreateGoodsReceipt.js
import React, { useState } from 'react';
import api from '../services/api';

const CreateGoodsReceipt = () => {
  const [form, setForm] = useState({
    po_id: '',
    supplier_id: '',
    store_id: 1,
    user_id: 1,
    notes: '',
    items: [{ po_item_id: '', variant_id: '', qty_received: 1, unit_price: 0 }]
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/goods-receipts', form);
      alert('Goods Receipt berhasil!');
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal');
    }
  };

  return (
    <div>
      <h2>Goods Receipt</h2>
      <form onSubmit={handleSubmit}>
        <input type="number" placeholder="PO ID" onChange={(e) => setForm({...form, po_id: e.target.value})} />
        <input type="number" placeholder="Supplier ID" onChange={(e) => setForm({...form, supplier_id: e.target.value})} />
        <textarea placeholder="Notes" onChange={(e) => setForm({...form, notes: e.target.value})} />
        <button type="submit">Simpan Receipt</button>
      </form>
    </div>
  );
};

export default CreateGoodsReceipt;