import React, { useState, useEffect } from 'react';
import { fetchAllOrders, deleteOrder, updateOrderStatus, createRestaurant } from '../api';

const Admin = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  // Form para restaurante
  const [restNombre, setRestNombre] = useState('');
  const [restDistrito, setRestDistrito] = useState('');

  const loadOrders = () => {
    fetchAllOrders().then(data => {
      setOrders(data.orders || []);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleDelete = async (id) => {
    if(!window.confirm("¿Eliminar pedido?")) return;
    await deleteOrder(id);
    loadOrders();
  };

  const handleStatusChange = async (id, status) => {
    await updateOrderStatus(id, status);
    loadOrders();
  };

  const handleCreateRestaurant = async (e) => {
    e.preventDefault();
    try {
      await createRestaurant({ nombre: restNombre, distrito: restDistrito, platos: [], reseñas: [] });
      setMsg('Restaurante creado correctamente');
      setRestNombre(''); setRestDistrito('');
      setTimeout(() => setMsg(''), 3000);
    } catch(err) {
      setMsg('Error creando restaurante');
    }
  };

  if(loading) return <div className="container" style={{textAlign:'center'}}>Cargando Panel Admin...</div>;

  return (
    <div className="container animate-fade-in">
      <h1 style={{color: 'var(--primary-color)'}}>Panel de Administración</h1>
      <p style={{marginBottom: '32px'}}>Gestión de todas las órdenes y catálogo (Consumiendo endpoints REST adicionales)</p>
      
      {msg && <div style={{ background: 'rgba(34,197,94,0.2)', color: '#22c55e', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>{msg}</div>}

      <div className="grid-responsive" style={{marginBottom: '40px'}}>
        <div className="glass-panel">
          <h2>Crear Nuevo Restaurante</h2>
          <form onSubmit={handleCreateRestaurant}>
            <div className="form-group">
              <label>Nombre del Restaurante</label>
              <input type="text" required className="form-control" value={restNombre} onChange={e=>setRestNombre(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Distrito</label>
              <input type="text" required className="form-control" value={restDistrito} onChange={e=>setRestDistrito(e.target.value)} />
            </div>
            <button className="btn" style={{width: '100%'}}>Añadir Restaurante</button>
          </form>
        </div>
      </div>

      <h2>Todas las Órdenes Generales</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
        {orders.map(o => (
          <div key={o.id} className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{color:'white'}}>Pedido #{o.id} - Usuario #{o.user_id}</h3>
              <p>Total: S/ {o.total}</p>
              <p>Dirección: {o.address}</p>
            </div>
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <select className="form-control" style={{width: 'auto', padding: '4px 8px'}} value={o.status} onChange={(e) => handleStatusChange(o.id, e.target.value)}>
                <option value="CREATED">CREATED</option>
                <option value="PREPARING">PREPARING</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
              <button className="btn btn-outline" style={{padding: '4px 8px', color: '#ef4444', borderColor: '#ef4444'}} onClick={() => handleDelete(o.id)}>Eliminar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Admin;
