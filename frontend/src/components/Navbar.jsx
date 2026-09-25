
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ user, onLogout }) => {
  const nav = useNavigate();
  return (
    <nav className="navbar">
      <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--primary-color)' }}>
        CloudEats 🍕
      </div>
      <div className="nav-links">
        <Link to="/restaurantes">Restaurantes</Link>
        <Link to="/pedidos">Mis Pedidos</Link>
        <Link to="/dashboard">Dashboard</Link>
        <Link to="/admin" style={{color: '#3b82f6'}}>Admin Panel</Link>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ color: 'var(--text-secondary)' }}>Hola, {user.nombre}</span>
        <button className="btn btn-outline" style={{ padding: '8px 16px' }} onClick={() => { onLogout(); nav('/'); }}>Salir</button>
      </div>
    </nav>
  );
};
export default Navbar;
