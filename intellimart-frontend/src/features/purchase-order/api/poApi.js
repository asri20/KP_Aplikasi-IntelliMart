import api from '../../../core/config/axios';

// Helper penanganan array response
const parseArrayResponse = (res) => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.data?.data)) return res.data.data;
  return [];
};

// 1. Buat Purchase Order Baru (POST /po)
export const createPurchaseOrder = async (poData) => {
  const response = await api.post('/po', poData);
  return response.data;
};

// 2. Fetch Daftar PO berdasarkan Store ID (GET /po?store_id=x)
export const getPurchaseOrders = async (storeId = 1) => {
  const response = await api.get(`/po?store_id=${storeId}`);
  return parseArrayResponse(response.data);
};

// 3. Fetch Detail PO Spesifik beserta Items (GET /po/:id)
export const getPODetail = async (poId) => {
  const response = await api.get(`/po/${poId}`);
  return response.data; // { purchase_order, items }
};

// 4. Penerimaan Barang Fisik (POST /po/receive)
export const receivePOItem = async (receiveData) => {
  const payload = {
    po_detail_id: Number(receiveData.po_detail_id),
    qty_received: Number(receiveData.qty_received),
    user_id: Number(receiveData.user_id || 1),
  };

  const response = await api.post('/po/receive', payload);
  return response.data;
};

// 5. Fetch Master Supplier (GET /suppliers)
export const getSuppliers = async () => {
  const response = await api.get('/suppliers');
  return parseArrayResponse(response.data);
};

// 6. Fetch Master Varian Produk (GET /products/variants?store_id=x)
export const getProductVariants = async (storeId = 1) => {
  const response = await api.get(`/products/variants?store_id=${storeId}`);
  return parseArrayResponse(response.data);
};