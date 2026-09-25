import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const Home = () => {
  return (
    <div className="animate-fade-in">
      <div className="hero-section">
        <div className="container">
          <h1 className="hero-title">Tu comida favorita,<br/>volando a tu puerta</h1>
          <p className="hero-subtitle">
            Pide en los mejores restaurantes de tu ciudad con CloudEats. 
            Rápido, seguro y delicioso.
          </p>
          <div style={{ marginTop: '32px', display: 'flex', gap: '16px' }}>
            <Link to="/restaurantes" className="btn btn-primary" style={{backgroundColor: 'white', color: 'var(--brand-color)'}}>
              Ver Restaurantes <ChevronRight size={20} />
            </Link>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginBottom: '80px' }}>
        <h2 className="section-title">Categorías Populares</h2>
        <div className="grid-responsive">
          <div className="card" style={{ alignItems: 'center', textAlign: 'center', padding: '32px 20px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🍕</div>
            <h3 style={{ fontSize: '1.25rem' }}>Pizzas</h3>
          </div>
          <div className="card" style={{ alignItems: 'center', textAlign: 'center', padding: '32px 20px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🍔</div>
            <h3 style={{ fontSize: '1.25rem' }}>Hamburguesas</h3>
          </div>
          <div className="card" style={{ alignItems: 'center', textAlign: 'center', padding: '32px 20px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🍣</div>
            <h3 style={{ fontSize: '1.25rem' }}>Sushi</h3>
          </div>
          <div className="card" style={{ alignItems: 'center', textAlign: 'center', padding: '32px 20px' }}>
            <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🥗</div>
            <h3 style={{ fontSize: '1.25rem' }}>Saludable</h3>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
