import { useState } from 'react';

import PropTypes from 'prop-types';

import { Button } from '@shared/components/atoms';
import { FormField, Modal } from '@shared/components/molecules';

import { useCreateStore } from '../../hooks';

const EMPTY = { name: '', location: '', phone: '' };

const CreateStoreModal = ({ isOpen, onClose }) => {
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');
  const createStore = useCreateStore();

  const handleChange = (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleClose = () => {
    setForm(EMPTY);
    setError('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim() || !form.location.trim()) {
      setError('Nama toko dan alamat wajib diisi.');
      return;
    }

    try {
      await createStore.mutateAsync(form);
      handleClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Tambah Toko Baru"
      description="Toko akan terhubung ke akun Owner Anda."
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {error && (
          <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

        <FormField
          label="Nama Toko"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="IntelliMart Dago"
          fullWidth
        />
        <FormField
          label="Alamat"
          name="location"
          value={form.location}
          onChange={handleChange}
          placeholder="Jl. Ir. H. Djuanda No. 88, Bandung"
          fullWidth
        />
        <FormField
          label="No. Telepon (opsional)"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          placeholder="08123456789"
          fullWidth
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={handleClose}>
            Batal
          </Button>
          <Button type="submit" loading={createStore.isPending}>
            Simpan Toko
          </Button>
        </div>
      </form>
    </Modal>
  );
};

CreateStoreModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default CreateStoreModal;
