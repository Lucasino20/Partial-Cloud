
import React, { useState, useEffect } from 'react';
import { fetchMisPedidos } from '../api';

const Pedidos = ({ user }) => {
  const [pedidos, setPedidos] = useState([]);
  
  useEffect(() => {
    fetchMisPedidos(user.id).then(data => setPedidos(data.orders || []));
  }, [user.id]);

  return (
    <div className="container animate-fade-in">
      <h1>Mis Pedidos Realizados</h1>
      <p style={{marginBottom: '32px'}}>Aquí ves todo lo que has consumido de la DB PostgreSQL</p>
      
      {pedidos.length === 0 ? <p>No tienes pedidos.</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {pedidos.map(p => (
            <div key={p.id} className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h3 style={{color:'white'}}>Pedido #{p.id}</h3>
                <p>Fecha: {new Date(p.created_at).toLocaleString()}</p>
                <p>Dirección: {p.address}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ display:'inline-block', background: 'rgba(249,115,22,0.2)', color: 'var(--primary-color)', padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', marginBottom:'8px'}}>{p.status}</span>
                <h2 style={{color: 'var(--primary-color)', margin:0}}>S/ {p.total}</h2>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default Pedidos;
