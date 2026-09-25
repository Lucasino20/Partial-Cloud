import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, ShoppingBag, DollarSign } from 'lucide-react';
import { fetchDashboard, fetchPlatosPopulares, fetchVentasMensuales, fetchHealthHistorial } from '../api';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [platos, setPlatos] = useState([]);
  const [ventas, setVentas] = useState([]);
  const [historialHealth, setHistorialHealth] = useState('');

  useEffect(() => {
    // Invocando endpoints de ms-historial y ms-consultas
    fetchHealthHistorial().then(res => setHistorialHealth(res.status)).catch(e => console.error(e));
    
    // UserId hardcodeado para la demo
    fetchDashboard(1).then(data => setDashboardData(data)).catch(e => console.error(e));
    
    // Consultas a Athena
    fetchPlatosPopulares(5).then(data => setPlatos(data)).catch(e => console.error(e));
    fetchVentasMensuales().then(data => setVentas(data)).catch(e => console.error(e));
  }, []);

  return (
    <div className="container animate-fade-in" style={{ padding: '40px 1.5rem' }}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <h1 className="section-title">Dashboard Analítico</h1>
        <span style={{ fontSize: '0.8rem', color: historialHealth === 'UP' ? 'green' : 'red' }}>
          ms-historial: {historialHealth || 'Cargando...'}
        </span>
      </div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
        Métricas generales consumidas de ms-consultas (Athena) y ms-historial.
      </p>

      <div className="grid-responsive" style={{ marginBottom: '40px' }}>
        <div className="stat-card">
          <div className="stat-icon">
            <ShoppingBag size={28} />
          </div>
          <div>
            <div className="stat-value">{dashboardData ? dashboardData.pedidos_totales : '...'}</div>
            <div className="stat-label">Pedidos Históricos</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#FEF3C7', color: '#D97706' }}>
            <TrendingUp size={28} />
          </div>
          <div>
            <div className="stat-value" style={{fontSize: '1.2rem'}}>{dashboardData?.favorito?.nombre || '...'}</div>
            <div className="stat-label">Restaurante Favorito</div>
          </div>
        </div>
      </div>

      <h2 className="section-title" style={{ fontSize: '1.5rem' }}>Platos Más Vendidos (Athena)</h2>
      <div className="card">
        {platos.length === 0 ? <p>Cargando datos analíticos...</p> : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <th style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>Plato</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>Restaurante</th>
                <th style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>Total Pedidos</th>
              </tr>
            </thead>
            <tbody>
              {platos.map((p, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: '16px' }}>{p.nombre_plato}</td>
                  <td style={{ padding: '16px' }}>{p.restaurante}</td>
                  <td style={{ padding: '16px', fontWeight: '600' }}>{p.cantidad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
