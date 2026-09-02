import axios from "axios";

const API_URL = "http://localhost:5000/api/transactions";

export const getTransactions = async () => {
  const response = await axios.get(API_URL);
  return response.data;
};

export const checkoutTransaction = async (data) => {
  const response = await axios.post(`${API_URL}/checkout`, data);
  return response.data;
};
