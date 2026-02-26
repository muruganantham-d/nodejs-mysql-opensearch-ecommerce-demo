// HEADER: Axios API helper for calling backend search endpoint.
import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api'
});

export async function fetchSearchProducts(params) {
  const response = await apiClient.get('/search/products', { params });
  return response.data;
}

export async function fetchProducts(params) {
  const response = await apiClient.get('/products', { params });
  return response.data;
}

export async function createProduct(payload) {
  const response = await apiClient.post('/products', payload);
  return response.data;
}

export async function updateProduct(productId, payload) {
  const response = await apiClient.put(`/products/${productId}`, payload);
  return response.data;
}

export async function deleteProduct(productId) {
  const response = await apiClient.delete(`/products/${productId}`);
  return response.data;
}

export async function reindexProductsFromMySQL() {
  const response = await apiClient.post('/search/reindex');
  return response.data;
}

/*
BOTTOM EXPLANATION
- Responsibility: Centralizes HTTP calls so components stay focused on UI behavior.
- Key syntax: `axios.create({ baseURL })` avoids repeating server URL in every request.
- Common mistakes: Hardcoding full URLs across components makes environment switching harder.
*/
