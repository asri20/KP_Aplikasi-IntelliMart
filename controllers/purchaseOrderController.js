// controllers/purchaseOrderController.js
const { PurchaseOrder, PurchaseOrderItem, Supplier, sequelize } = require('../models');

// ── Helper: generate nomor PO ─────────────────────────────────────────────
async function generatePONumber() {
  const year = new Date().getFullYear();
  const count = await PurchaseOrder.count({
    where: sequelize.where(
      sequelize.fn('EXTRACT', sequelize.literal(`YEAR FROM "created_at"`)),
      year
    )
  });
  return `PO-${year}-${String(count + 1).padStart(4, '0')}`;
}

// ── GET /api/purchase-orders ───────────────────────────────────────────────
exports.getAllPOs = async (req, res) => {
  try {
    const { status } = req.query;
    // Gunakan store_id dari JWT, atau fallback ke 1 jika tidak ditemukan
    const store_id = req.user?.store_id || 1;

    const where = {};
    if (store_id) where.store_id = store_id;
    if (status) where.status = status;

    const pos = await PurchaseOrder.findAll({
      where,
      include: [
        { model: Supplier, as: 'supplier' },
        { model: PurchaseOrderItem, as: 'items' } // Wajib di-include agar item PO muncul di tabel
      ],
      order: [['created_at', 'DESC']]
    });

    res.json({ success: true, data: pos });
  } catch (err) {
    console.error('Error getAllPOs Backend:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/purchase-orders/:id ──────────────────────────────────────────
exports.getPOById = async (req, res) => {
  try {
    const store_id = req.user.store_id;
    const po = await PurchaseOrder.findByPk(req.params.id, {
      where: { store_id },   // Pastikan PO milik toko user
      include: [
        { model: Supplier, as: 'supplier' },
        { model: PurchaseOrderItem, as: 'items' }
      ]
    });
    if (!po) return res.status(404).json({ success: false, message: 'Purchase Order tidak ditemukan' });
    res.json({ success: true, data: po });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/purchase-orders ─────────────────────────────────────────────
exports.createPO = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { supplier_id, user_id, expected_delivery_date, notes, items } = req.body;
    const store_id = req.user.store_id;

    if (!supplier_id || !user_id) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'supplier_id dan user_id wajib diisi' });
    }
    if (!items || items.length === 0) {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'PO harus memiliki minimal 1 item' });
    }

    const total_amount = items.reduce((sum, item) => sum + (parseFloat(item.quantity) * parseFloat(item.unit_price)), 0);

    const po_number = await generatePONumber();

    const po = await PurchaseOrder.create({
      po_number,
      store_id,
      supplier_id,
      user_id,
      expected_delivery_date,
      notes,
      total_amount,
      status: 'draft'
    }, { transaction: t });

    const poItems = items.map(item => ({
      po_id: po.po_id,
      variant_id: item.variant_id,
      quantity: item.quantity,
      unit_price: item.unit_price   // Sesuai model kamu (unit_price)
    }));

    await PurchaseOrderItem.bulkCreate(poItems, { transaction: t });
    await t.commit();

    const result = await PurchaseOrder.findByPk(po.po_id, {
      include: [
        { model: Supplier, as: 'supplier', attributes: ['supplier_id', 'supplier_name'] },
        { model: PurchaseOrderItem, as: 'items' }
      ]
    });

    res.status(201).json({ success: true, message: 'Purchase Order berhasil dibuat', data: result });
  } catch (err) {
    await t.rollback();
    res.status(400).json({ success: false, message: err.message });
  }
};

// ── PUT /api/purchase-orders/:id ──────────────────────────────────────────
exports.updatePO = async (req, res) => {
  try {
    const store_id = req.user.store_id;
    const po = await PurchaseOrder.findByPk(req.params.id);
    if (!po) return res.status(404).json({ success: false, message: 'Purchase Order tidak ditemukan' });

    // Cek apakah PO milik toko user ini
    if (po.store_id !== store_id) {
      return res.status(403).json({ success: false, message: 'Akses ditolak' });
    }

    if (po.status !== 'draft') {
      return res.status(400).json({ success: false, message: `PO berstatus '${po.status}' tidak bisa diedit` });
    }

    await po.update(req.body);
    res.json({ success: true, message: 'Purchase Order berhasil diupdate', data: po });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ── PATCH /api/purchase-orders/:id/status ────────────────────────────────
exports.updateStatus = async (req, res) => {
  try {
    const store_id = req.user.store_id;
    const { status, notes } = req.body;
    const allowed = ['draft', 'pending', 'approved', 'received', 'cancelled'];

    if (!allowed.includes(status)) {
      return res.status(400).json({ success: false, message: `Status tidak valid. Pilihan: ${allowed.join(', ')}` });
    }

    const po = await PurchaseOrder.findByPk(req.params.id);
    if (!po) return res.status(404).json({ success: false, message: 'Purchase Order tidak ditemukan' });

    if (po.store_id !== store_id) {
      return res.status(403).json({ success: false, message: 'Akses ditolak' });
    }

    await po.update({ status, ...(notes && { notes }) });
    res.json({ success: true, message: `Status PO diubah menjadi '${status}'`, data: po });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/purchase-orders/:id/receive ─────────────────────────────────
exports.receivePO = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const store_id = req.user.store_id;
    const po_id = req.params.id; // Mengambil ID dari URL Parameter (:id)
    const { po_detail_id, qty_received, items } = req.body;

    const po = await PurchaseOrder.findByPk(po_id, { transaction: t });
    if (!po) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Purchase Order tidak ditemukan' });
    }

    if (po.store_id !== store_id) {
      await t.rollback();
      return res.status(403).json({ success: false, message: 'Akses ditolak' });
    }

    if (po.status === 'cancelled') {
      await t.rollback();
      return res.status(400).json({ success: false, message: 'PO yang dibatalkan tidak bisa diterima' });
    }

    // 1. Update status tabel Header (tt_purchase_order)
    await po.update({ status: 'RECEIVED' }, { transaction: t });

    // 2. Update qty_received di tabel Detail (tt_purchase_order_detail)
    if (po_detail_id && qty_received !== undefined) {
      // Update item spesifik berdasarkan po_detail_id
      await PurchaseOrderItem.update(
        { qty_received: Number(qty_received) },
        { where: { id: po_detail_id, po_id: po.po_id }, transaction: t }
      );
    } else if (items && Array.isArray(items) && items.length > 0) {
      // Update jika dikirim array items
      for (const item of items) {
        await PurchaseOrderItem.update(
          { qty_received: Number(item.qty_received || item.quantity) },
          { where: { id: item.po_detail_id || item.id, po_id: po.po_id }, transaction: t }
        );
      }
    } else {
      // Fallback: Jika tidak mengirim ID detail, set qty_received = quantity untuk semua item PO ini
      const poItems = await PurchaseOrderItem.findAll({ where: { po_id: po.po_id }, transaction: t });
      for (const item of poItems) {
        await item.update({ qty_received: item.quantity }, { transaction: t });
      }
    }

    await t.commit();

    // Fetch data terbaru untuk dikembalikan ke frontend
    const updatedPO = await PurchaseOrder.findByPk(po.po_id, {
      include: [
        { model: Supplier, as: 'supplier' },
        { model: PurchaseOrderItem, as: 'items' }
      ]
    });

    res.json({ success: true, message: 'Purchase Order berhasil diterima', data: updatedPO });
  } catch (err) {
    await t.rollback();
    console.error('Error receivePO:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/purchase-orders/summary ─────────────────────────────────────
exports.getSummary = async (req, res) => {
  try {
    const store_id = req.user.store_id;

    const rows = await PurchaseOrder.findAll({
      where: { store_id },
      attributes: [
        'status',
        [sequelize.fn('COUNT', sequelize.col('po_id')), 'total_orders'],
        [sequelize.fn('SUM', sequelize.col('total_amount')), 'total_value']
      ],
      group: ['status'],
      raw: true
    });
    res.json({ success: true, data: rows });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── DELETE /api/purchase-orders/:id ─────────────────────────────────────
exports.deletePO = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const store_id = req.user.store_id;
    const po = await PurchaseOrder.findByPk(req.params.id, { transaction: t });
    if (!po) {
      await t.rollback();
      return res.status(404).json({ success: false, message: 'Purchase Order tidak ditemukan' });
    }

    if (po.store_id !== store_id) {
      await t.rollback();
      return res.status(403).json({ success: false, message: 'Akses ditolak' });
    }

    await po.update({ status: 'cancelled' }, { transaction: t });

    await t.commit();
    res.json({ 
      success: true, 
      message: `Purchase Order ${po.po_number} berhasil di-cancel` 
    });
  } catch (err) {
    await t.rollback();
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};