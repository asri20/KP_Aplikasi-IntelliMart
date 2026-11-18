import React from 'react';

/**
 * @typedef {Object} ReceiptItem
 * @property {string} [name]
 * @property {string} [product_name]
 * @property {string} [variant_name]
 * @property {string} [sku]
 * @property {number} qty
 * @property {number} price
 * @property {number} [subtotal]
 */

/**
 * @typedef {Object} TransactionData
 * @property {string} [invoice_number]
 * @property {string} [invoice_no]
 * @property {number|string} [transaction_id]
 * @property {string} [payment_method]
 * @property {number} [amount_received]
 * @property {number} [amount_paid]
 * @property {number} [change_amount]
 * @property {string} [reference_no]
 * @property {string} [created_at]
 */

/**
 * @param {Object} props
 * @param {boolean} props.isOpen
 * @param {() => void} props.onClose
 * @param {TransactionData|null} props.transactionData
 * @param {ReceiptItem[]} props.cart
 * @param {number} props.grandTotal
 * @param {number} props.subtotal
 * @param {number} props.discountAmount
 */
export default function PaymentModal({
  isOpen,
  onClose,
  transactionData,
  cart = [],
  grandTotal = 0,
  subtotal = 0,
  discountAmount = 0,
}) {
  if (!isOpen) return null;

  const formatRupiah = (value) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(Number(value) || 0);
  };

  const invoiceNumber =
    transactionData?.invoice_number ||
    transactionData?.invoice_no ||
    `#${transactionData?.transaction_id || '-'}`;

  const paymentMethod = transactionData?.payment_method || '-';

  const amountReceived = Number(transactionData?.amount_received || 0);
  const amountPaid = Number(transactionData?.amount_paid ?? grandTotal);
  const changeAmount = Number(transactionData?.change_amount || 0);

  const isCash = paymentMethod.toLowerCase() === 'cash';

  const transactionDate = transactionData?.created_at
    ? new Date(transactionData.created_at)
    : new Date();

  const formattedDate = Number.isNaN(transactionDate.getTime())
    ? '-'
    : transactionDate.toLocaleString('id-ID', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

  return (
    <>
      <style>
        {`
          @media print {
            @page {
              size: 80mm auto;
              margin: 4mm;
            }

            html,
            body {
              width: 80mm !important;
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
            }

            body * {
              visibility: hidden !important;
            }

            .receipt-print-area,
            .receipt-print-area * {
              visibility: visible !important;
            }

            .receipt-modal-overlay {
              position: absolute !important;
              inset: 0 !important;
              display: block !important;
              width: 100% !important;
              height: auto !important;
              padding: 0 !important;
              background: white !important;
              backdrop-filter: none !important;
            }

            .receipt-print-area {
              position: absolute !important;
              top: 0 !important;
              left: 0 !important;
              width: 72mm !important;
              max-width: 72mm !important;
              margin: 0 !important;
              padding: 2mm !important;
              border: none !important;
              border-radius: 0 !important;
              box-shadow: none !important;
              color: black !important;
              background: white !important;
              font-family: Arial, sans-serif !important;
            }

            .receipt-actions {
              display: none !important;
            }

            .receipt-print-area * {
              color: black !important;
              box-shadow: none !important;
            }
          }
        `}
      </style>

      <div className="receipt-modal-overlay fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
        <div
          className="receipt-print-area w-full max-w-md rounded-2xl border border-orange-100 bg-white p-6 shadow-xl"
          style={{
            boxSizing: 'border-box',
            color: '#1f2937',
            fontFamily: 'Arial, sans-serif',
          }}
        >
          {/* HEADER TOKO */}
          <div
            style={{
              textAlign: 'center',
              paddingBottom: '14px',
              borderBottom: '1px dashed #9ca3af',
            }}
          >
            <h2
              style={{
                margin: '0',
                fontSize: '22px',
                fontWeight: 'bold',
                letterSpacing: '1px',
              }}
            >
              INTELLIMART
            </h2>

            <p style={{ margin: '5px 0', fontSize: '13px' }}>
              Toko Testing Modul 1
            </p>

            <p style={{ margin: '10px 0 0', fontWeight: 'bold' }}>
              STRUK PEMBELIAN
            </p>

            <div
              className="receipt-actions"
              style={{
                margin: '12px auto 0',
                width: '42px',
                height: '42px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                background: '#dcfce7',
                color: '#15803d',
                fontSize: '24px',
                fontWeight: 'bold',
              }}
            >
              ✓
            </div>

            <h3
              className="receipt-actions"
              style={{
                margin: '8px 0',
                fontSize: '18px',
                color: '#15803d',
              }}
            >
              Transaksi Berhasil!
            </h3>
          </div>

          {/* INFORMASI TRANSAKSI */}
          <div
            style={{
              padding: '12px 0',
              borderBottom: '1px dashed #9ca3af',
              fontSize: '12px',
              lineHeight: '1.8',
            }}
          >
            <div>
              <strong>No. Invoice:</strong> {invoiceNumber}
            </div>

            <div>
              <strong>Tanggal:</strong> {formattedDate}
            </div>

            <div>
              <strong>Kasir:</strong> #1
            </div>

            <div>
              <strong>Metode Pembayaran:</strong> {paymentMethod}
            </div>

            {transactionData?.reference_no && (
              <div>
                <strong>No. Referensi:</strong> {transactionData.reference_no}
              </div>
            )}
          </div>

          {/* DETAIL BARANG */}
          <div
            style={{
              padding: '12px 0',
              borderBottom: '1px dashed #9ca3af',
            }}
          >
            <p
              style={{
                margin: '0 0 10px',
                fontSize: '13px',
                fontWeight: 'bold',
              }}
            >
              DETAIL PEMBELIAN
            </p>

            {cart.map((item, index) => {
              const quantity = Number(item.qty) || 0;
              const price = Number(item.price) || 0;
              const itemSubtotal = Number(item.subtotal ?? quantity * price);

              return (
                <div
                  key={`${item.sku || item.name || 'item'}-${index}`}
                  style={{
                    marginBottom: '12px',
                    fontSize: '12px',
                  }}
                >
                  <div style={{ fontWeight: 'bold' }}>
                    {item.product_name || item.name || 'Produk'}
                  </div>

                  {item.variant_name && (
                    <div style={{ color: '#6b7280' }}>
                      Varian: {item.variant_name}
                    </div>
                  )}

                  {item.sku && (
                    <div style={{ color: '#6b7280' }}>SKU: {item.sku}</div>
                  )}

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginTop: '4px',
                    }}
                  >
                    <span>
                      {quantity} x {formatRupiah(price)}
                    </span>

                    <strong>{formatRupiah(itemSubtotal)}</strong>
                  </div>
                </div>
              );
            })}
          </div>

          {/* RINCIAN PEMBAYARAN */}
          <div
            style={{
              padding: '12px 0',
              borderBottom: '1px dashed #9ca3af',
              fontSize: '12px',
              lineHeight: '1.9',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Subtotal</span>
              <span>{formatRupiah(subtotal)}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Diskon</span>
              <span>- {formatRupiah(discountAmount)}</span>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '8px',
                paddingTop: '8px',
                borderTop: '1px solid #d1d5db',
                fontSize: '15px',
                fontWeight: 'bold',
              }}
            >
              <span>TOTAL BAYAR</span>
              <span>{formatRupiah(grandTotal)}</span>
            </div>
          </div>

          {/* INFORMASI UANG DITERIMA */}
          <div
            style={{
              padding: '12px 0',
              fontSize: '12px',
              lineHeight: '1.9',
            }}
          >
            {isCash ? (
              <>
                <div
                  style={{ display: 'flex', justifyContent: 'space-between' }}
                >
                  <span>Uang Diterima</span>
                  <span>{formatRupiah(amountReceived)}</span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontWeight: 'bold',
                  }}
                >
                  <span>Kembalian</span>
                  <span>{formatRupiah(changeAmount)}</span>
                </div>
              </>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Jumlah Dibayar</span>
                <span>{formatRupiah(amountPaid)}</span>
              </div>
            )}
          </div>

          {/* FOOTER */}
          <div
            style={{
              paddingTop: '12px',
              borderTop: '1px dashed #9ca3af',
              textAlign: 'center',
              fontSize: '12px',
              lineHeight: '1.7',
            }}
          >
            <strong>Terima kasih telah berbelanja!</strong>

            <p style={{ margin: '4px 0' }}>
              Simpan struk ini sebagai bukti transaksi.
            </p>

            <p style={{ margin: '8px 0 0', fontSize: '10px' }}>
              INTELLIMART - Sistem Informasi Penjualan
            </p>
          </div>

          {/* TOMBOL */}
          <div
            className="receipt-actions"
            style={{
              display: 'flex',
              gap: '10px',
              marginTop: '20px',
            }}
          >
            <button
              type="button"
              onClick={() => window.print()}
              style={{
                flex: 1,
                padding: '11px',
                border: '1px solid #ff6b00',
                borderRadius: '8px',
                background: 'white',
                color: '#ff6b00',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              🖨 Cetak Struk
            </button>

            <button
              type="button"
              onClick={onClose}
              style={{
                flex: 1,
                padding: '11px',
                border: 'none',
                borderRadius: '8px',
                background: '#ff6b00',
                color: 'white',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              Transaksi Baru
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
