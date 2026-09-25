
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost';

const getAuthToken = () => {
  const token = localStorage.getItem('cloudeats_token');
  return token ? `Bearer ${token}` : '';
};

const fetchAuth = async (url, options = {}) => {
  const headers = { ...options.headers };
  const auth = getAuthToken();
  if (auth) {
    headers['Authorization'] = auth;
  }
  const r = await fetch(url, { ...options, headers });
  return r;
};

// ms-usuarios
export const login = async (credentials) => {
  const r = await fetch(`${BASE_URL}/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(credentials) });
  if(!r.ok) throw new Error("Credenciales inválidas");
  return r.json();
};
export const registerUser = async (userData) => {
  const r = await fetch(`${BASE_URL}/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(userData) });
  if(!r.ok) {
    const err = await r.json().catch(()=>({}));
    throw new Error(err.detail || err.error || "Error al registrarse");
  }
  return r.json();
};
export const fetchUsuarios = async () => {
  const r = await fetchAuth(`${BASE_URL}/usuarios`);
  return r.json();
};
export const fetchUsuarioById = async (userId) => {
  const r = await fetchAuth(`${BASE_URL}/usuarios/${userId}`);
  return r.json();
};

// ms-catalogo
export const fetchRestaurantes = async () => {
  const r = await fetchAuth(`${BASE_URL}/api/restaurantes`);
  return r.json();
};
export const fetchPlato = async (dishId) => {
  const r = await fetchAuth(`${BASE_URL}/api/restaurantes/platos/${dishId}`);
  return r.json();
};
export const createRestaurant = async (data) => {
  const r = await fetchAuth(`${BASE_URL}/api/restaurantes`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  return r.json();
};

// ms-pedidos
export const fetchMisPedidos = async (userId) => {
  const r = await fetchAuth(`${BASE_URL}/orders/user/${userId}`);
  return r.json();
};
export const createOrder = async (orderData) => {
  const r = await fetchAuth(`${BASE_URL}/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(orderData) });
  if(!r.ok) throw new Error("Error creando orden");
  return r.json();
};
export const fetchAllOrders = async () => {
  const r = await fetchAuth(`${BASE_URL}/orders`);
  return r.json();
};
export const fetchOrderById = async (id) => {
  const r = await fetchAuth(`${BASE_URL}/orders/${id}`);
  return r.json();
};
export const deleteOrder = async (id) => {
  const r = await fetchAuth(`${BASE_URL}/orders/${id}`, { method: 'DELETE' });
  return r.json();
};
export const updateOrderStatus = async (id, status) => {
  const r = await fetchAuth(`${BASE_URL}/orders/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
  return r.json();
};

// ms-historial
export const fetchDashboard = async (userId) => {
  const r = await fetchAuth(`${BASE_URL}/api/dashboard?userId=${userId}`);
  return r.json();
};

// ms-consultas
export const fetchVentasRestaurante = async (limit=5) => {
  const r = await fetchAuth(`${BASE_URL}/api/analitica/ventas-restaurante?limit=${limit}`);
  return r.json();
};
export const fetchUsuariosFrecuentes = async (limit=5) => {
  const r = await fetchAuth(`${BASE_URL}/api/analitica/usuarios-frecuentes?limit=${limit}`);
  return r.json();
};
