import React, { useState, useEffect } from 'react';
import { fetchPedidosByRestaurant, updateOrderStatus } from '../api';

const PanelRestaurante = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    try {
      if (!user.restaurant_id) return;
      const data = await fetchPedidosByRestaurant(user.restaurant_id);
      setOrders(data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [user.restaurant_id]);

  const handleUpdate = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      loadOrders();
    } catch (e) {
      alert("Error actualizando estado");
    }
  };

  if (loading) return <div className="container" style={{display:'flex', justifyContent:'center', marginTop:'50px'}}><div className="loading-spinner"></div></div>;

  if (!user.restaurant_id) {
    return <div className="container" style={{ textAlign: 'center', marginTop: '50px' }}><h2>No tienes un restaurante asignado.</h2></div>;
  }

  return (
    <div className="container animate-fade-in" style={{ padding: '40px 20px', maxWidth: '1000px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ fontSize: '2.5rem', color: '#111827', marginBottom: '10px' }}>Cocina / Panel de Pedidos</h1>
        <p style={{ color: '#4b5563' }}>Gestiona los pedidos entrantes de tu restaurante.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {orders.length === 0 ? <p style={{ textAlign: 'center', color: '#6b7280' }}>No hay pedidos aún.</p> : null}
        {orders.map(o => (
          <div key={o.id} className="card" style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#1f2937' }}>Pedido #{o.id}</h3>
                <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>Dirección: {o.address}</span>
              </div>
              <span style={{ background: o.status === 'ENTREGADO' ? '#dcfce7' : o.status === 'CANCELADO' ? '#fee2e2' : '#fef3c7', color: o.status === 'ENTREGADO' ? '#166534' : o.status === 'CANCELADO' ? '#991b1b' : '#d97706', padding: '6px 14px', borderRadius: '20px', fontWeight: 'bold', fontSize: '0.85rem' }}>
                {o.status}
              </span>
            </div>
            
            <div style={{ background: '#f9fafb', padding: '15px', borderRadius: '12px', marginBottom: '20px' }}>
              {o.items?.map(it => (
                <div key={it.id} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', padding: '8px 0' }}>
                  <span>{it.qty}x {it.name}</span>
                  <span style={{ fontWeight: 'bold' }}>S/ {Number(it.price).toFixed(2)}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', fontWeight: 'bold', fontSize: '1.1rem', color: '#111827' }}>
                <span>Total:</span>
                <span>S/ {Number(o.total).toFixed(2)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              {o.status !== 'ENTREGADO' && o.status !== 'CANCELADO' && (
                <>
                  <button className="btn" style={{ background: '#f59e0b', color: 'white', padding: '8px 16px' }} onClick={() => handleUpdate(o.id, 'EN_PREPARACION')}>En Preparación</button>
                  <button className="btn" style={{ background: '#3b82f6', color: 'white', padding: '8px 16px' }} onClick={() => handleUpdate(o.id, 'EN_CAMINO')}>En Camino</button>
                  <button className="btn" style={{ background: '#10b981', color: 'white', padding: '8px 16px' }} onClick={() => handleUpdate(o.id, 'ENTREGADO')}>Entregado</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default PanelRestaurante;
