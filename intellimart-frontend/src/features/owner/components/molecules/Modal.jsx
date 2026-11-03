import { useEffect } from 'react';

import PropTypes from 'prop-types';

/**
 * Modal - Molecule
 * Dialog sederhana: tutup via Esc, klik overlay, atau tombol ×.
 */
function Modal({ isOpen, onClose, title, description, children }) {
  useEffect(() => {
    if (!isOpen) return undefined;
    const onKeyDown = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Tutup"
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-slate-900/40"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-xl"
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{title}</h2>
            {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="text-2xl leading-none text-slate-400 hover:text-slate-600"
          >
            ×
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  children: PropTypes.node,
};

export default Modal;
