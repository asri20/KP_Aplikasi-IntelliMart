const pool = require('./db'); // sesuaikan path kalau perlu

async function listTables() {
  try {
    const [tables] = await pool.query('SHOW TABLES');
    console.log(`Total tabel: ${tables.length}\n`);
    tables.forEach((row, i) => {
      const name = Object.values(row)[0];
      console.log(`${i + 1}. ${name}`);
    });
  } catch (err) {
    console.error('Gagal ambil daftar tabel:', err.message);
  } finally {
    process.exit();
  }
}

listTables();