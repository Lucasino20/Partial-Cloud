import React, { useState } from 'react';
import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

const Docs = () => {
  const [selectedService, setSelectedService] = useState('usuarios');
  
  const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost';
  const swaggerUrl = `${BASE_URL}/openapi/${selectedService}.json`;

  const services = [
    { id: 'usuarios', name: 'Microservicio Usuarios (Python)' },
    { id: 'pedidos', name: 'Microservicio Pedidos (Node.js)' },
    { id: 'catalogo', name: 'Microservicio Catálogo (Go)' },
    { id: 'historial', name: 'Microservicio Historial (Go)' },
    { id: 'consultas', name: 'Microservicio Analítico (Python Athena)' }
  ];

  return (
    <div className="container animate-fade-in" style={{ backgroundColor: 'white', color: 'black', borderRadius: '16px', marginTop: '40px', padding: '40px' }}>
      <h1 style={{ color: '#0f172a' }}>Documentación de APIs (Swagger UI)</h1>
      <p style={{ marginBottom: '24px', color: '#475569' }}>
        Selecciona un microservicio para visualizar todos sus endpoints, esquemas y metadatos.
      </p>

      <div style={{ marginBottom: '32px' }}>
        <select 
          value={selectedService} 
          onChange={(e) => setSelectedService(e.target.value)}
          style={{ padding: '12px', fontSize: '1rem', width: '100%', maxWidth: '400px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
        >
          {services.map(s => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      <div style={{ borderTop: '1px solid #cbd5e1', paddingTop: '24px' }}>
        <SwaggerUI url={swaggerUrl} />
      </div>
    </div>
  );
};

export default Docs;
