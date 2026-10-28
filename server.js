const express = require('express');
const cors = require('cors');
const pool = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// 1. Endpoint mendapatkan semua pengguna, level, dan segmentasinya
app.get('/api/users', async (req, res) => {
    try {
        const query = `
            SELECT u.id, u.name, u.email, u.role, u.segmentation, c.level_name 
            FROM users u
            LEFT JOIN customer_levels c ON u.level_id = c.id
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// 2. Endpoint mencatat transaksi baru + otomatis update level pelanggan
app.post('/api/transactions', async (req, res) => {
    const { user_id, amount } = req.body;
    try {
        await pool.query('BEGIN');

        // Tambah riwayat transaksi
        const trxResult = await pool.query(
            'INSERT INTO transactions (user_id, amount) VALUES ($1, $2) RETURNING *',
            [user_id, amount]
        );

        // Update waktu aktif terakhir user
        await pool.query(
            'UPDATE users SET last_active = CURRENT_TIMESTAMP WHERE id = $1',
            [user_id]
        );

        // Hitung total belanja user untuk kalkulasi level terbaru
        const totalSpentResult = await pool.query(
            'SELECT SUM(amount) as total FROM transactions WHERE user_id = $1',
            [user_id]
        );
        const totalSpent = totalSpentResult.rows[0].total;

        // Cari level yang cocok berdasarkan total belanja
        const levelResult = await pool.query(
            'SELECT id FROM customer_levels WHERE min_transaction_amount <= $1 ORDER BY min_transaction_amount DESC LIMIT 1',
            [totalSpent]
        );
        
        if (levelResult.rows.length > 0) {
            const newLevelId = levelResult.rows[0].id;
            await pool.query('UPDATE users SET level_id = $1 WHERE id = $2', [newLevelId, user_id]);
        }

        await pool.query('COMMIT');
        res.status(201).json({ message: 'Transaksi berhasil dicatat.', transaction: trxResult.rows[0] });
    } catch (err) {
        await pool.query('ROLLBACK');
        res.status(500).json({ error: err.message });
    }
});

// 3. Endpoint update segmentasi (aktif, pasif, loyal, churn) berdasarkan keaktifan transaksi
app.post('/api/users/update-segmentation', async (req, res) => {
    try {
        const query = `
            UPDATE users
            SET segmentation = CASE
                WHEN last_active < NOW() - INTERVAL '6 months' THEN 'churn'
                WHEN last_active < NOW() - INTERVAL '3 months' THEN 'pasif'
                WHEN level_id >= 2 THEN 'loyal'
                ELSE 'aktif'
            END
            RETURNING id, name, segmentation;
        `;
        const result = await pool.query(query);
        res.json({ message: 'Segmentasi berhasil diperbarui', updated_users: result.rows });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server berjalan di port ${PORT}`);
});