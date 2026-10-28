import React, { useState } from 'react';

const CustomerModal = ({ isOpen, onClose, onSaveSuccess }) => {
    const [formData, setFormData] = useState({
        user_id: 17, // Kamu bisa sesuaikan user_id sesuai akun yang sedang aktif/login
        address: '', 
        customer_type: 'RESELLER'
    });
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Mengirim data ke backend endpoint upgrade-reseller
            const response = await fetch('http://localhost:5000/api/upgrade-reseller', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: formData.user_id,
                    address: formData.address
                }),
            });

            const data = await response.json();

            if (data.success) {
                alert(data.message);
                if (onSaveSuccess) onSaveSuccess(); // Refresh data tabel/halaman
                onClose();
            } else {
                alert('Gagal menyimpan: ' + data.message);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Terjadi kesalahan koneksi ke server.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
                <h2 className="text-xl font-bold mb-4 text-gray-800">Form Buka Toko / Reseller</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">ID Pengguna (User ID)</label>
                        <input 
                            type="number" 
                            name="user_id" 
                            value={formData.user_id} 
                            onChange={handleChange} 
                            required 
                            className="mt-1 block w-full border border-gray-300 rounded-xl p-2 bg-gray-50"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Alamat Toko</label>
                        <textarea 
                            name="address" 
                            value={formData.address} 
                            onChange={handleChange} 
                            rows="3"
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-xl p-2"
                            placeholder="Contoh: Jl. Merdeka No. 17, Bandung"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tipe / Segmen</label>
                        <select 
                            name="customer_type" 
                            value={formData.customer_type} 
                            onChange={handleChange}
                            className="mt-1 block w-full border border-gray-300 rounded-xl p-2 bg-gray-50"
                            disabled
                        >
                            <option value="RESELLER">Reseller / Wholesale</option>
                        </select>
                    </div>

                    <div className="flex justify-end space-x-2 pt-2">
                        <button 
                            type="button" 
                            onClick={onClose}
                            className="px-4 py-2 bg-gray-100 rounded-xl text-gray-700 hover:bg-gray-200 transition-colors"
                        >
                            Batal
                        </button>
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="px-4 py-2 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors disabled:opacity-50"
                        >
                            {loading ? 'Menyimpan...' : 'Simpan & Buka Toko'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CustomerModal;