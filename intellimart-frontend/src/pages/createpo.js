// src/pages/CreatePO.js
import React, { useState, useEffect } from 'react';
import api from '../services/api';

const CreatePO = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [form, setForm] = useState({
    supplier_id: '',
    expected_delivery_date: '',
    notes: '',
    items: [{ variant_id: '', quantity: 1, unit_price: 0 }]
  });

  useEffect(() => {
    api.get('/suppliers')
      .then(res => setSuppliers(res.data.data))
      .catch(err => console.error(err));
  }, []);

  const addItem = () => {
    setForm({
      ...form,
      items: [...form.items, { variant_id: '', quantity: 1, unit_price: 0 }]
    });
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...form.items];
    newItems[index][field] = value;
    setForm({ ...form, items: newItems });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/purchase-orders', form);
      alert('PO berhasil dibuat!');
      console.log(res.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal membuat PO');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Buat Purchase Order Baru</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Supplier</label>
          <select 
            value={form.supplier_id} 
            onChange={(e) => setForm({ ...form, supplier_id: e.target.value })}
            required
          >
            <option value="">Pilih Supplier</option>
            {suppliers.map(s => (
              <option key={s.supplier_id} value={s.supplier_id}>
                {s.supplier_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Expected Delivery Date</label>
          <input 
            type="date" 
            value={form.expected_delivery_date}
            onChange={(e) => setForm({ ...form, expected_delivery_date: e.target.value })}
          />
        </div>

        <div>
          <label>Notes</label>
          <textarea 
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />
        </div>

        <h3>Items</h3>
        {form.items.map((item, index) => (
          <div key={index} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
            <input 
              type="number" 
              placeholder="Variant ID" 
              value={item.variant_id}
              onChange={(e) => handleItemChange(index, 'variant_id', e.target.value)}
            />
            <input 
              type="number" 
              placeholder="Quantity" 
              value={item.quantity}
              onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
            />
            <input 
              type="number" 
              placeholder="Unit Price" 
              value={item.unit_price}
              onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
            />
          </div>
        ))}

        <button type="button" onClick={addItem}>+ Tambah Item</button>
        <br /><br />
        <button type="submit">Buat Purchase Order</button>
      </form>
    </div>
  );
};

export default CreatePO;