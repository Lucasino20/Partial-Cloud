
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ user, onLogout }) => {
  const nav = useNavigate();
  return (
    <nav className="navbar">
      <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary-color)' }}>
        CloudEats
      </div>
      <div className="nav-links">
        <Link to="/restaurantes">Restaurantes</Link>
        <Link to="/pedidos">Mis Pedidos</Link>
        <Link to="/dashboard">Dashboard</Link>
        {user.role === 'admin' && (
          <Link to="/admin" style={{color: '#3b82f6'}}>Admin Panel</Link>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Hola, {user.nombre}</span>
          <span style={{ background: 'var(--primary-color)', color: 'white', padding: '2px 8px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: 'bold', textTransform: 'uppercase' }}>
            {user.role || 'CLIENTE'}
          </span>
        </div>
        <button className="btn btn-outline" style={{ padding: '8px 16px' }} onClick={() => { onLogout(); nav('/'); }}>Salir</button>
      </div>
    </nav>
  );
};
export default Navbar;
