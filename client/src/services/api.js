import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Configurar la URL base para todas las peticiones
const api = axios.create({
  baseURL: API_URL,
});

// Interceptor para añadir el token a todas las peticiones
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Servicios para cada entidad
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
};

export const userService = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (userData) => api.put('/users/me', userData),
  getUsers: () => api.get('/users'),
  createUser: (userData) => api.post('/users', userData),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
};

export const categoryService = {
  getCategories: () => api.get('/categories'),
  getCategory: (id) => api.get(`/categories/${id}`),
  createCategory: (categoryData) => api.post('/categories', categoryData),
  updateCategory: (id, categoryData) => api.put(`/categories/${id}`, categoryData),
  deleteCategory: (id) => api.delete(`/categories/${id}`),
};

export const productService = {
  getProducts: () => api.get('/products'),
  getProduct: (id) => api.get(`/products/${id}`),
  createProduct: (productData) => {
    const config = productData instanceof FormData ? 
      { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    return api.post('/products', productData, config);
  },
  updateProduct: (id, productData) => {
    const config = productData instanceof FormData ? 
      { headers: { 'Content-Type': 'multipart/form-data' } } : {};
    return api.put(`/products/${id}`, productData, config);
  },
  deleteProduct: (id) => api.delete(`/products/${id}`),
};

export const tableService = {
  getTables: () => api.get('/tables'),
  getTable: (id) => api.get(`/tables/${id}`),
  createTable: (tableData) => api.post('/tables', tableData),
  updateTable: (id, tableData) => api.put(`/tables/${id}`, tableData),
  deleteTable: (id) => api.delete(`/tables/${id}`),
};

export const orderService = {
  getOrders: () => api.get('/orders'),
  getOrder: (id) => api.get(`/orders/${id}`),
  createOrder: (orderData) => api.post('/orders', orderData),
  updateOrder: (id, orderData) => api.put(`/orders/${id}`, orderData),
  deleteOrder: (id) => api.delete(`/orders/${id}`),
  updateOrderStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
};

// Exportación por defecto con estructura compatible con las páginas
const apiServices = {
  product: {
    getAll: () => productService.getProducts(),
    create: (data) => productService.createProduct(data),
    update: (id, data) => productService.updateProduct(id, data),
    delete: (id) => productService.deleteProduct(id),
  },
  category: {
    getAll: () => categoryService.getCategories(),
    create: (data) => categoryService.createCategory(data),
    update: (id, data) => categoryService.updateCategory(id, data),
    delete: (id) => categoryService.deleteCategory(id),
  },
  order: {
    getAll: () => orderService.getOrders(),
    create: (data) => orderService.createOrder(data),
    update: (id, data) => orderService.updateOrder(id, data),
    delete: (id) => orderService.deleteOrder(id),
    updateStatus: (id, status) => orderService.updateOrderStatus(id, status),
  },
  user: {
    getAll: () => userService.getUsers(),
    create: (data) => userService.createUser(data),
    update: (id, data) => userService.updateUser(id, data),
    delete: (id) => userService.deleteUser(id),
  },
  table: {
    getAll: () => tableService.getTables(),
    create: (data) => tableService.createTable(data),
    update: (id, data) => tableService.updateTable(id, data),
    delete: (id) => tableService.deleteTable(id),
  }
};

export default apiServices;