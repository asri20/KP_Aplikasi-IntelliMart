import React, { useState, useEffect } from 'react';
import api from '../services/api';

const SupplierList = () => {
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    api.get('/suppliers')
      .then(res => setSuppliers(res.data.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      <h2>Daftar Supplier</h2>
      <ul>
        {suppliers.map(s => (
          <li key={s.supplier_id}>
            {s.supplier_name} - {s.contact_person}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default SupplierList;