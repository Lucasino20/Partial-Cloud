import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Pizza, Home, BarChart3, Store } from 'lucide-react';

const Navbar = () => {
  const location = useLocation();
  
  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="glass">
      <div className="container flex-between navbar">
        <Link to="/" className="nav-brand">
          <Pizza size={32} />
          <span>CloudEats</span>
        </Link>
        
        <div className="nav-links">
          <Link to="/" className={`nav-link ${isActive('/')}`} style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
            <Home size={20} /> Inicio
          </Link>
          <Link to="/restaurantes" className={`nav-link ${isActive('/restaurantes')}`} style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
            <Store size={20} /> Restaurantes
          </Link>
          <Link to="/dashboard" className={`nav-link ${isActive('/dashboard')}`} style={{display: 'flex', alignItems: 'center', gap: '6px'}}>
            <BarChart3 size={20} /> Analítica
          </Link>
          <button className="btn btn-primary btn-sm" style={{marginLeft: '12px'}}>
            Iniciar Sesión
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
