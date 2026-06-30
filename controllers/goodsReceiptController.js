// controllers/goodsReceiptController.js
const {
  GoodsReceipt, GoodsReceiptItem,
  PurchaseOrder, PurchaseOrderItem,
  Supplier, sequelize
} = require('../models');

// ── Helper: generate nomor GR ─────────────────────────────────────────────
async function generateReceiptNumber() {
  const year  = new Date().getFullYear();
  const count = await GoodsReceipt.count({
    where: sequelize.where(
      sequelize.fn('EXTRACT', sequelize.literal(`YEAR FROM "created_at"`)),
      year
    )
  });
  return `GR-${year}-${String(count + 1).padStart(4, '0')}`;
}

// ── GET /api/goods-receipts ───────────────────────────────────────────────
exports.getAllReceipts = async (req, res) => {
  try {
    const { store_id, supplier_id, status, po_id, page = 1, limit = 20 } = req.query;

    const where = {};
    if (store_id)   where.store_id   = store_id;
    if (supplier_id) where.supplier_id = supplier_id;
    if (status)     where.status     = status;
    if (po_id)      where.po_id      = po_id;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const { count, rows } = await GoodsReceipt.findAndCountAll({
      where,
      include: [
        { model: Supplier,       as: 'supplier',      attributes: ['supplier_id', 'supplier_name'] },
        { model: PurchaseOrder,  as: 'purchaseOrder', attributes: ['po_id', 'po_number'] }
      ],
      limit: parseInt(limit),
      offset,
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      data: rows,
      meta: { total: count, page: parseInt(page), limit: parseInt(limit), total_pages: Math.ceil(count / limit) }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/goods-receipts/:id ───────────────────────────────────────────
exports.getReceiptById = async (req, res) => {
  try {
    const receipt = await GoodsReceipt.findByPk(req.params.id, {
      include: [
        { model: Supplier,          as: 'supplier' },
        { model: PurchaseOrder,     as: 'purchaseOrder' },
        { model: GoodsReceiptItem,  as: 'items' }
      ]
    });
    if (!receipt) return res.status(404).json({ success: false, message: 'Data penerimaan tidak ditemukan' });
    res.json({ success: true, data: receipt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/goods-receipts ──────────────────────────────────────────────
exports.createReceipt = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { po_id, supplier_id, store_id, user_id, receipt_date, notes, items } = req.body;

    if (!supplier_id || !store_id || !user_id) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'supplier_id, store_id, dan user_id wajib diisi' });
    }
    if (!items || items.length === 0) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'Harus ada minimal 1 item yang diterima' });
    }

    // Validasi: kalau ada po_id, pastikan PO-nya ada dan bukan cancelled
    if (po_id) {
      const po = await PurchaseOrder.findByPk(po_id, { transaction: t });
      if (!po) {
        await t.rollback();
        return res.status(404).json({ success: false, message: 'Purchase Order tidak ditemukan' });
      }
      if (po.status === 'cancelled') {
        await t.rollback();
        return res.status(400).json({ success: false, message: 'PO sudah dibatalkan, tidak bisa menerima barang' });
      }
    }

    const receipt_number = await generateReceiptNumber();

    const receipt = await GoodsReceipt.create({
      receipt_number,
      po_id: po_id || null,
      store_id,
      supplier_id,
      user_id,
      receipt_date: receipt_date || new Date(),
      notes,
      status: 'pending'
    }, { transaction: t });

    const receiptItems = items.map(item => ({
      receipt_id:   receipt.receipt_id,
      po_item_id:   item.po_item_id   || null,
      variant_id:   item.variant_id,
      qty_received: item.qty_received,
      unit_price:   item.unit_price,
      condition:    item.condition    || 'good'
    }));

    await GoodsReceiptItem.bulkCreate(receiptItems, { transaction: t });

    await t.commit();

    const result = await GoodsReceipt.findByPk(receipt.receipt_id, {
      include: [
        { model: Supplier,         as: 'supplier' },
        { model: GoodsReceiptItem, as: 'items' }
      ]
    });

    res.status(201).json({ success: true, message: 'Penerimaan barang berhasil dicatat', data: result });
  } catch (err) {
    await t.rollback();
    res.status(400).json({ success: false, message: err.message });
  }
};

// ── PUT /api/goods-receipts/:id/verify ───────────────────────────────────
// Verifikasi → update qty_received di PO items & update status PO
exports.verifyReceipt = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const receipt = await GoodsReceipt.findByPk(req.params.id, {
      include: [{ model: GoodsReceiptItem, as: 'items' }],
      transaction: t
    });

    if (!receipt) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Data penerimaan tidak ditemukan' });
    }
    if (receipt.status !== 'pending') {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'Hanya penerimaan berstatus pending yang bisa diverifikasi' });
    }

    // Update qty_received di setiap PO item (hanya item kondisi 'good')
    for (const item of receipt.items) {
      if (item.condition === 'good' && item.po_item_id) {
        await PurchaseOrderItem.increment(
          { qty_received: item.qty_received },
          { where: { po_item_id: item.po_item_id }, transaction: t }
        );
      }
    }

    // Cek apakah semua item PO sudah diterima → update status PO
    if (receipt.po_id) {
      const allPOItems = await PurchaseOrderItem.findAll({
        where: { po_id: receipt.po_id },
        transaction: t
      });

      const semuaLengkap = allPOItems.every(
        item => parseInt(item.qty_received) >= parseInt(item.quantity)
      );
      const adaYangDiterima = allPOItems.some(item => parseInt(item.qty_received) > 0);

      const newPOStatus = semuaLengkap ? 'received'
                        : adaYangDiterima ? 'pending'   // partial
                        : 'approved';

      await PurchaseOrder.update(
        { status: newPOStatus },
        { where: { po_id: receipt.po_id }, transaction: t }
      );
    }

    // Update status GR
    await receipt.update({ status: 'verified' }, { transaction: t });

    await t.commit();
    res.json({ success: true, message: 'Penerimaan barang berhasil diverifikasi', data: receipt });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/goods-receipts/:id/reject ───────────────────────────────────
exports.rejectReceipt = async (req, res) => {
  try {
    const receipt = await GoodsReceipt.findByPk(req.params.id);
    if (!receipt) return res.status(404).json({ success: false, message: 'Data penerimaan tidak ditemukan' });

    if (receipt.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Hanya penerimaan berstatus pending yang bisa ditolak' });
    }

    await receipt.update({ status: 'rejected', notes: req.body.notes || receipt.notes });
    res.json({ success: true, message: 'Penerimaan barang ditolak', data: receipt });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
