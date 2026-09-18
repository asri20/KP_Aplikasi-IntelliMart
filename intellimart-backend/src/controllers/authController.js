const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
const sessionModel = require("../models/sessionModel");
const { logActivity } = require("../helpers/loggerHelper");

const JWT_SECRET = process.env.JWT_SECRET || "secret_key_intellimart_super_aman";

async function register(req, res) {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, dan password wajib diisi"
      });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existingUser = await userModel.findByEmail(normalizedEmail);

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email sudah terdaftar"
      });
    }

    const ownerRole = await userModel.findRoleByName("Owner");

    if (!ownerRole) {
      return res.status(500).json({
        success: false,
        message: "Role Owner tidak ditemukan di database"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await userModel.createUser({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      phone: phone || null,
      role_id: ownerRole.id,
      is_active: 1
    });

    await logActivity(
      newUser.id,
      "REGISTER_OWNER",
      "tm_users",
      newUser.id
    );

    return res.status(201).json({
      success: true,
      message: "Registrasi Owner berhasil",
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        role_id: ownerRole.id,
        role_name: ownerRole.role_name || "Owner",
        is_active: 1
      }
    });
  } catch (error) {
    console.error("Register error:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server saat registrasi",
      ...(process.env.NODE_ENV === "development" ? { detail: error.message } : {})
    });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email dan password wajib diisi"
      });
    }

    const user = await userModel.findByIdentity(email.trim());

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Email atau password salah"
      });
    }

    if (Number(user.is_active) === 0) {
      return res.status(403).json({
        success: false,
        message: "Akun Anda dinonaktifkan"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Email atau password salah"
      });
    }

    const role = await userModel.findRoleByName(
      user.role_id === 1 ? "Owner" :
      user.role_id === 2 ? "Manager" :
      user.role_id === 3 ? "Cashier" : "Customer"
    );

    const roleName = role?.role_name || (
      Number(user.role_id) === 1 ? "Owner" :
      Number(user.role_id) === 2 ? "Manager" :
      Number(user.role_id) === 3 ? "Cashier" : "Customer"
    );

    const token = jwt.sign(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role_id: user.role_id,
        role_name: roleName
      },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    await sessionModel.createSession(
      user.id,
      token,
      req.headers["user-agent"]
    );

    await logActivity(
      user.id,
      "LOGIN",
      "tm_users",
      user.id
    );

    return res.status(200).json({
      success: true,
      message: "Login berhasil",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || null,
        role_id: user.role_id,
        role_name: roleName
      }
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server saat login",
      ...(process.env.NODE_ENV === "development" ? { detail: error.message } : {})
    });
  }
}

async function logout(req, res) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
      await sessionModel.deleteSessionByToken(token);
    }

    await logActivity(
      req.user.id,
      "LOGOUT",
      "tm_users",
      req.user.id
    );

    return res.status(200).json({
      success: true,
      message: "Berhasil logout. Sesi telah diakhiri."
    });
  } catch (error) {
    console.error("Logout error:", error);
    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan server saat logout"
    });
  }
}

module.exports = { register, login, logout };
