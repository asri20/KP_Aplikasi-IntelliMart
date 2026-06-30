// controllers/supplierController.js
const { Supplier, PurchaseOrder, sequelize } = require('../models');
const { Op } = require('sequelize');

// ── GET /api/suppliers ────────────────────────────────────────────────────
exports.getAllSuppliers = async (req, res) => {
  try {
    const { search, city, is_active, page = 1, limit = 20 } = req.query;
    const store_id = req.user.store_id;   // Dari JWT

    const where = { store_id };

    if (is_active !== undefined) {
      where.is_active = is_active === 'true';
    } else {
      where.is_active = true;
    }

    if (search) {
      where[Op.or] = [
        { supplier_name: { [Op.iLike]: `%${search}%` } },
        { contact_person: { [Op.iLike]: `%${search}%` } }
      ];
    }
    if (city) where.city = { [Op.iLike]: `%${city}%` };

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows } = await Supplier.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset,
      order: [['supplier_name', 'ASC']]
    });

    res.json({
      success: true,
      data: rows,
      meta: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        total_pages: Math.ceil(count / limit)
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/suppliers/:id ────────────────────────────────────────────────
exports.getSupplierById = async (req, res) => {
  try {
    const store_id = req.user.store_id;
    const supplier = await Supplier.findByPk(req.params.id, {
      where: { store_id },   // Pastikan supplier milik toko user
      include: [{
        model: PurchaseOrder,
        as: 'purchaseOrders',
        attributes: ['po_id', 'po_number', 'order_date', 'status', 'total_amount'],
        limit: 5,
        order: [['order_date', 'DESC']]
      }]
    });
    if (!supplier) return res.status(404).json({ success: false, message: 'Supplier tidak ditemukan' });
    res.json({ success: true, data: supplier });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/suppliers ───────────────────────────────────────────────────
exports.createSupplier = async (req, res) => {
  try {
    const { supplier_name, contact_person, phone, email, address, city, lead_time_days } = req.body;
    const store_id = req.user.store_id;

    if (!supplier_name) {
      return res.status(400).json({ success: false, message: 'supplier_name wajib diisi' });
    }

    const supplier = await Supplier.create({
      supplier_name,
      contact_person,
      phone,
      email,
      address,
      city,
      lead_time_days,
      store_id   // ← Penting
    });

    res.status(201).json({ success: true, message: 'Supplier berhasil ditambahkan', data: supplier });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ── PUT /api/suppliers/:id ────────────────────────────────────────────────
exports.updateSupplier = async (req, res) => {
  try {
    const store_id = req.user.store_id;
    const supplier = await Supplier.findByPk(req.params.id);
    if (!supplier) return res.status(404).json({ success: false, message: 'Supplier tidak ditemukan' });

    if (supplier.store_id !== store_id) {
      return res.status(403).json({ success: false, message: 'Akses ditolak' });
    }

    await supplier.update(req.body);
    res.json({ success: true, message: 'Supplier berhasil diupdate', data: supplier });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ── DELETE /api/suppliers/:id ─────────────────────────────────────────────
exports.deleteSupplier = async (req, res) => {
  try {
    const store_id = req.user.store_id;
    const supplier = await Supplier.findByPk(req.params.id);
    if (!supplier) return res.status(404).json({ success: false, message: 'Supplier tidak ditemukan' });

    if (supplier.store_id !== store_id) {
      return res.status(403).json({ success: false, message: 'Akses ditolak' });
    }

    await supplier.update({ is_active: false });
    res.json({ success: true, message: 'Supplier berhasil dinonaktifkan' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/suppliers/best ───────────────────────────────────────────────
exports.getBestSuppliers = async (req, res) => {
  try {
    const store_id = req.user.store_id;

    const suppliers = await Supplier.findAll({
      where: { store_id, is_active: true },
      order: [
        ['rating', 'DESC'],
        ['lead_time_days', 'ASC']
      ],
      limit: 5,
      attributes: ['supplier_id', 'supplier_name', 'contact_person', 'phone', 'rating', 'lead_time_days', 'city']
    });

    res.json({ success: true, data: suppliers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};