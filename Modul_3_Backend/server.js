const express = require('express');
const cors = require('cors');
require('dotenv').config();

const customerRoutes = require('./routes/customerRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api', customerRoutes);

// Root endpoint
app.get('/', (req, res) => {
    res.json({ message: "Server Modul 3 Backend Intellimart Berjalan!" });
});

// Jalankan server
app.listen(PORT, () => {
    console.log(`Server aktif di port ${PORT}`);
});