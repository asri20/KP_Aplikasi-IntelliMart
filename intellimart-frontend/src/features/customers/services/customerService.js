import axios from 'axios';

// Mengambil base URL dari file .env atau fallback ke localhost:5000
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const customerService = {
  async getAllCustomers() {
    const response = await fetch(`${API_BASE_URL}/customers`);
    if (!response.ok) throw new Error('Gagal mengambil data pelanggan');
    return response.json();
  },

  async createCustomer(customerData) {
    const response = await fetch(`${API_BASE_URL}/customers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customerData),
    });
    if (!response.ok) throw new Error('Gagal menambahkan pelanggan baru');
    return response.json();
  }
};