import React, { useState, useEffect } from 'react';
import { Star, CheckCircle } from 'lucide-react';
import { fetchRestaurantes, fetchHealthCatalogo } from '../api';

const Restaurantes = () => {
  const [restaurantes, setRestaurantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [health, setHealth] = useState(null);

  useEffect(() => {
    // 1. Invocar Endpoint de Health (ms-catalogo)
    fetchHealthCatalogo().then(data => setHealth(data.status)).catch(() => setHealth('DOWN'));
    
    // 2. Invocar Endpoint de Restaurantes (ms-catalogo)
    fetchRestaurantes()
      .then(data => {
        setRestaurantes(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error cargando restaurantes", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="container animate-fade-in" style={{ padding: '40px 1.5rem' }}>
      <div className="flex-between" style={{ marginBottom: '32px' }}>
        <div>
          <h1 className="section-title" style={{ marginBottom: 0 }}>Restaurantes</h1>
          <small style={{ color: health === 'UP' ? 'green' : 'red' }}>
            Estado del servicio: {health || 'Conectando...'}
          </small>
        </div>
        <div style={{ color: 'var(--text-secondary)' }}>
          {restaurantes.length} resultados
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
          Cargando deliciosos restaurantes desde la API...
        </div>
      ) : restaurantes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
          No hay restaurantes disponibles. Revisa la base de datos.
        </div>
      ) : (
        <div className="grid-responsive">
          {restaurantes.map(rest => (
            <div className="card" key={rest._id || rest.id}>
              <div className="img-wrapper">
                <img src={rest.img || 'https://images.unsplash.com/photo-1559842600-2fb9dbcc7a67?w=600&h=400&fit=crop'} alt={rest.nombre} className="restaurant-image" />
              </div>
              <span className="badge">{rest.distrito || 'Ciudad'}</span>
              <h3 style={{ fontSize: '1.25rem', marginTop: '8px' }}>{rest.nombre}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px', color: '#F59E0B' }}>
                <Star size={16} fill="currentColor" />
                <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>4.8</span>
              </div>
              <button className="btn btn-outline" style={{ marginTop: '20px', width: '100%' }}>
                Ver Menú
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Restaurantes;
