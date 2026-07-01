const express = require('express');
const sequelize = require('./config/database');

// Panggil semua model dan relasi
require('./models');

require('dotenv').config();

const authRoutes = require('./routes/authRoutes');

const app = express();

app.use(express.json());

app.use('/api/auth', authRoutes);

sequelize.sync({ alter: true })
  .then(() => {
    console.log('Tables synced');
  })
  .catch(err => {
    console.log(err);
  });

app.listen(3000, () => {
  console.log('Server running');
});