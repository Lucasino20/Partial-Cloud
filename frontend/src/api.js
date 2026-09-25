const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost';

// ms-catalogo (2 endpoints)
export const fetchHealthCatalogo = () => fetch(`${BASE_URL}/health/catalogo`).then(r => r.json());
export const fetchRestaurantes = () => fetch(`${BASE_URL}/api/restaurantes`).then(r => r.json());

// ms-pedidos (2 endpoints)
export const fetchOrders = () => fetch(`${BASE_URL}/orders`).then(r => r.json());
export const createOrder = (order) => fetch(`${BASE_URL}/orders`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(order)
}).then(r => r.json());

// ms-usuarios (2 endpoints)
export const fetchUsuarios = () => fetch(`${BASE_URL}/usuarios`).then(r => r.json());
export const login = (credentials) => fetch(`${BASE_URL}/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(credentials)
}).then(r => r.json());

// ms-historial (2 endpoints)
export const fetchHealthHistorial = () => fetch(`${BASE_URL}/health/historial`).then(r => r.json());
export const fetchDashboard = (userId) => fetch(`${BASE_URL}/api/dashboard?userId=${userId}`).then(r => r.json());

// ms-consultas (2 endpoints)
export const fetchPlatosPopulares = (limit = 5) => fetch(`${BASE_URL}/api/analitica/platos-populares?limit=${limit}`).then(r => r.json());
export const fetchVentasMensuales = () => fetch(`${BASE_URL}/api/analitica/ventas-mensuales`).then(r => r.json());
