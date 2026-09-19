require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const storeRoutes = require("./routes/storeRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
const brandRoutes = require("./routes/brandRoutes");
const unitRoutes = require("./routes/unitRoutes");
const productRoutes = require("./routes/productRoutes");
const variantRoutes = require("./routes/variantRoutes");
const stockRoutes = require("./routes/stockRoutes");
const priceCodeRoutes = require("./routes/priceCodeRoutes");
const tierPriceRoutes = require("./routes/tierPriceRoutes");
const stockMovementRoutes = require("./routes/stockMovementRoutes");
const unitConversionRoutes = require("./routes/unitConversionRoutes");
const productImageRoutes = require("./routes/productImageRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const reportRoutes = require("./routes/reportRoutes");

const app = express();

app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "IntelliMart API berjalan dengan baik",
    version: "1.0.0",
  });
});

app.get("/api", (req, res) => {
  res.json({
    success: true,
    message: "IntelliMart REST API v1.0",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/stores", storeRoutes);

app.use("/api/categories", categoryRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/units", unitRoutes);
app.use("/api/products", productRoutes);
app.use("/api/variants", variantRoutes);
app.use("/api/stocks", stockRoutes);
app.use("/api/price-codes", priceCodeRoutes);
app.use("/api/tier-prices", tierPriceRoutes);
app.use("/api/stock-movements", stockMovementRoutes);
app.use("/api/unit-conversions", unitConversionRoutes);
app.use("/api/product-images", productImageRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/reports", reportRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route '${req.method} ${req.url}' tidak ditemukan`,
    error: "NOT_FOUND",
  });
});

app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Terjadi kesalahan pada server",
    error: process.env.NODE_ENV === "development" ? err.stack : "INTERNAL_SERVER_ERROR",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("===============================================");
  console.log(`IntelliMart Backend berjalan di port ${PORT}`);
  console.log(`URL : http://localhost:${PORT}`);
  console.log(`API : http://localhost:${PORT}/api`);
  console.log("===============================================");
});

module.exports = app;
