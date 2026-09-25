import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';

const Restaurantes = () => {
  const [restaurantes, setRestaurantes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Cuando el backend esté levantado (docker-compose), se consumirá desde el Nginx:
    // fetch('/api/restaurantes') ...
    
    // Por ahora usamos mock data para la UI
    setTimeout(() => {
      setRestaurantes([
        { id: 1, nombre: 'Burger Palace', distrito: 'Miraflores', img: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&h=400&fit=crop' },
        { id: 2, nombre: 'Pizza Nostra', distrito: 'San Isidro', img: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&h=400&fit=crop' },
        { id: 3, nombre: 'Sushi Zen', distrito: 'Surco', img: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600&h=400&fit=crop' },
        { id: 4, nombre: 'La Cevichería', distrito: 'Barranco', img: 'https://images.unsplash.com/photo-1559842600-2fb9dbcc7a67?w=600&h=400&fit=crop' },
        { id: 5, nombre: 'Tacos el Güero', distrito: 'Lince', img: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=600&h=400&fit=crop' }
      ]);
      setLoading(false);
    }, 800);
  }, []);

  return (
    <div className="container animate-fade-in" style={{ padding: '40px 1.5rem' }}>
      <div className="flex-between" style={{ marginBottom: '32px' }}>
        <h1 className="section-title" style={{ marginBottom: 0 }}>Restaurantes Disponibles</h1>
        <div style={{ color: 'var(--text-secondary)' }}>
          {restaurantes.length} resultados
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
          Cargando deliciosos restaurantes...
        </div>
      ) : (
        <div className="grid-responsive">
          {restaurantes.map(rest => (
            <div className="card" key={rest.id}>
              <div className="img-wrapper">
                <img src={rest.img} alt={rest.nombre} className="restaurant-image" />
              </div>
              <span className="badge">{rest.distrito}</span>
              <h3 style={{ fontSize: '1.25rem', marginTop: '8px' }}>{rest.nombre}</h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '8px', color: '#F59E0B' }}>
                <Star size={16} fill="currentColor" />
                <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>4.8 (120 reseñas)</span>
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
