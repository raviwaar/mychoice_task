import axios from 'axios';

const API_URL = import.meta.env.VITE_BASE_URL || 'http://localhost:8000/api/v1/items/';

export const getItems = (params, config = {}) => axios.get(API_URL, { params, ...config });

export const getItem = (id, config = {}) => axios.get(`${API_URL}${id}/`, config);
export const createItem = (data) => axios.post(API_URL, data);
export const updateItem = (id, data) => axios.patch(`${API_URL}${id}/`, data);
export const deleteItem = (id) => axios.delete(`${API_URL}${id}/`);