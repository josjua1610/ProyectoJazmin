import axios from 'axios';

const API_PRODUCTS_URL = 'http://localhost:8001/api'; // Laravel backend

export const getProducts = async () => {
  const res = await axios.get(`${API_PRODUCTS_URL}/products`);
  return res.data;
};

export const getProductById = async (id) => {
  const res = await axios.get(`${API_PRODUCTS_URL}/products/${id}`);
  return res.data;
};

export const createProduct = async (product, token) => {
  const res = await axios.post(`${API_PRODUCTS_URL}/products`, product, {
    headers: { Authorization: `Bearer ${token}` }
  });
  return res.data;
};
