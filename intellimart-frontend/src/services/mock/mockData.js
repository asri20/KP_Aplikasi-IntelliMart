export const mockUsers = [
  {
    id: 1,
    name: "Owner Toko",
    email: "owner@demo.com",
    password: "123456",
    role: "owner",
    avatar: "OT",
  },
  {
    id: 2,
    name: "Kasir Toko",
    email: "kasir@demo.com",
    password: "123456",
    role: "cashier",
    avatar: "KT",
  },
  {
    id: 3,
    name: "Manager Toko",
    email: "manager@demo.com",
    password: "123456",
    role: "manager",
    avatar: "MT",
  },
];

export const mockStores = [
  { id: 1, name: "Toko A", address: "Jl. Merdeka No. 1, Jakarta", phone: "021-1234567" },
  { id: 2, name: "Toko B", address: "Jl. Sudirman No. 45, Bandung", phone: "022-7654321" },
  { id: 3, name: "Toko C", address: "Jl. Diponegoro No. 10, Surabaya", phone: "031-9876543" },
];

export const rolePermissions = {
  owner: ["dashboard", "products", "pos", "customers", "suppliers", "finance", "ai", "users"],
  manager: ["dashboard", "products", "customers", "suppliers", "finance", "ai"],
  cashier: ["pos", "products"],
};