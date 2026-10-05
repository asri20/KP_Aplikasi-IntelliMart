import React from 'react';

export default function PaymentModal({
  isOpen,
  onClose,
  transactionData,
  cart,
  grandTotal,
  subtotal,
  discountAmount,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md p-6 duration-200 bg-white border border-orange-100 shadow-xl animate-in fade-in zoom-in rounded-2xl">
        {/* Header Struk */}
        <div className="pb-4 text-center border-b border-gray-200 border-dashed">
          <div className="flex items-center justify-center w-12 h-12 mx-auto mb-2 text-xl font-bold rounded-full bg-emerald-100 text-emerald-600">
            ✓
          </div>
          <h3 className="text-xl font-bold text-gray-800">
            Transaksi Berhasil!
          </h3>
          <p className="mt-1 text-xs text-gray-500">
            No. Invoice:{' '}
            <span className="font-mono font-bold text-gray-700">
              {transactionData?.invoice_number ||
                `#${transactionData?.transaction_id}`}
            </span>
          </p>
        </div>

        {/* List Item Belanja */}
        <div className="py-4 my-2 space-y-2 overflow-y-auto text-sm border-b border-gray-200 border-dashed max-h-48">
          {cart.map((item, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between text-gray-700"
            >
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-xs text-gray-400">
                  {item.qty} x Rp {item.price.toLocaleString('id-ID')}
                </p>
              </div>
              <p className="font-semibold">
                Rp {(item.qty * item.price).toLocaleString('id-ID')}
              </p>
            </div>
          ))}
        </div>

        {/* Rincian Total */}
        <div className="space-y-1.5 border-b border-gray-100 pb-4 text-xs text-gray-600">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>Rp {subtotal.toLocaleString('id-ID')}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between font-medium text-emerald-600">
              <span>Diskon</span>
              <span>- Rp {discountAmount.toLocaleString('id-ID')}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 text-base font-bold text-[#FF6B00]">
            <span>Total Bayar</span>
            <span>Rp {grandTotal.toLocaleString('id-ID')}</span>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={() => window.print()}
            className="flex-1 rounded-xl border border-orange-200 py-2.5 text-sm font-semibold text-[#FF6B00] transition hover:bg-orange-50"
          >
            🖨️ Cetak Struk
          </button>
          <button
            onClick={onClose}
            className="flex-1 rounded-xl bg-[#FF6B00] py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#e05d00]"
          >
            Transaksi Baru
          </button>
        </div>
      </div>
    </div>
  );
}
