
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost';

// ms-usuarios
export const login = async (credentials) => {
  const r = await fetch(`${BASE_URL}/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(credentials) });
  if(!r.ok) throw new Error("Credenciales inválidas");
  return r.json();
};
export const fetchUsuarios = async () => {
  const r = await fetch(`${BASE_URL}/usuarios`);
  return r.json();
};

// ms-catalogo
export const fetchRestaurantes = async () => {
  const r = await fetch(`${BASE_URL}/api/restaurantes`);
  return r.json();
};
export const fetchPlato = async (dishId) => {
  const r = await fetch(`${BASE_URL}/api/restaurantes/platos/${dishId}`);
  return r.json();
};

// ms-pedidos
export const fetchMisPedidos = async (userId) => {
  const r = await fetch(`${BASE_URL}/orders/user/${userId}`);
  return r.json();
};
export const createOrder = async (orderData) => {
  const r = await fetch(`${BASE_URL}/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(orderData) });
  if(!r.ok) throw new Error("Error creando orden");
  return r.json();
};

// ms-historial
export const fetchDashboard = async (userId) => {
  const r = await fetch(`${BASE_URL}/api/dashboard?userId=${userId}`);
  return r.json();
};

// ms-consultas
export const fetchPlatosPopulares = async (limit=5) => {
  const r = await fetch(`${BASE_URL}/api/analitica/platos-populares?limit=${limit}`);
  return r.json();
};
