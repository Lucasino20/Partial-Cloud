import React, { useState, useEffect } from 'react';
import { fetchOrders, createOrder } from '../api';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('');

  useEffect(() => {
    // 1. Invocar GET /orders (ms-pedidos)
    fetchOrders().then(data => {
      setOrders(data.orders || []);
    }).catch(e => console.error(e));
  }, []);

  const handleCreateOrder = async () => {
    try {
      setStatus('Creando pedido...');
      // 2. Invocar POST /orders (ms-pedidos)
      const newOrder = {
        user_id: 1,
        restaurant_id: 1,
        address: "Av Test 123",
        items: [{ dish_id: "1", qty: 2 }]
      };
      const res = await createOrder(newOrder);
      setStatus(res.message ? `Pedido Creado! ID: ${res.id}` : 'Error al crear');
    } catch (e) {
      setStatus('Error al conectar con ms-pedidos');
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '40px 1.5rem' }}>
      <h1 className="section-title">Prueba de Microservicio Pedidos</h1>
      
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 style={{marginBottom: '16px'}}>Crear un Nuevo Pedido</h3>
        <button onClick={handleCreateOrder} className="btn btn-primary">Simular Compra</button>
        {status && <p style={{marginTop: '10px'}}>{status}</p>}
      </div>

      <div className="card">
        <h3 style={{marginBottom: '16px'}}>Últimos Pedidos Recibidos</h3>
        {orders && orders.length > 0 ? (
          <ul>
            {orders.map(o => (
              <li key={o.id} style={{padding: '8px 0', borderBottom: '1px solid #eee'}}>
                Pedido #{o.id} - Total: ${o.total} - Estado: {o.status}
              </li>
            ))}
          </ul>
        ) : (
          <p>No hay pedidos recientes.</p>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
