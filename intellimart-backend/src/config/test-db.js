const pool = require('./db'); // sesuaikan path kalau db.js ada di folder lain, misal './src/db'

async function testConnection() {
  try {
    const [rows] = await pool.query('SELECT NOW() AS waktu_sekarang');
    console.log('✅ Berhasil konek ke database!');
    console.log('Waktu server database:', rows[0].waktu_sekarang);

    const [tables] = await pool.query('SHOW TABLES');
    console.log(`✅ Ketemu ${tables.length} tabel di database ini.`);
  } catch (err) {
    console.error('❌ Gagal konek ke database:', err.message);
  } finally {
    process.exit();
  }
}

testConnection();