// Shim: modul dari backend-lengkap memakai require('../config/db') dan db.query / db.getConnection.
// Arahkan ke pool MySQL yang sama dengan Modul 10 agar hanya ada satu koneksi database.
module.exports = require('./database').pool;
