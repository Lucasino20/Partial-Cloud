import React from 'react';
import { TrendingUp, Users, ShoppingBag, DollarSign } from 'lucide-react';

const Dashboard = () => {
  return (
    <div className="container animate-fade-in" style={{ padding: '40px 1.5rem' }}>
      <h1 className="section-title">Dashboard Analítico</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
        Métricas generales consolidadas (consumiendo de ms-consultas y ms-historial)
      </p>

      <div className="grid-responsive" style={{ marginBottom: '40px' }}>
        <div className="stat-card">
          <div className="stat-icon">
            <ShoppingBag size={28} />
          </div>
          <div>
            <div className="stat-value">1,245</div>
            <div className="stat-label">Pedidos Totales</div>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#E0E7FF', color: '#4F46E5' }}>
            <DollarSign size={28} />
          </div>
          <div>
            <div className="stat-value">$12.4k</div>
            <div className="stat-label">Ventas Brutas</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#DCFCE7', color: '#16A34A' }}>
            <Users size={28} />
          </div>
          <div>
            <div className="stat-value">850</div>
            <div className="stat-label">Usuarios Activos</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#FEF3C7', color: '#D97706' }}>
            <TrendingUp size={28} />
          </div>
          <div>
            <div className="stat-value">Burger Palace</div>
            <div className="stat-label">Restaurante Top</div>
          </div>
        </div>
      </div>

      <h2 className="section-title" style={{ fontSize: '1.5rem' }}>Platos Más Vendidos</h2>
      <div className="card">
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <th style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>Plato</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>Restaurante</th>
              <th style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>Cantidad (Athena)</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '16px' }}>Hamburguesa Clásica</td>
              <td style={{ padding: '16px' }}>Burger Palace</td>
              <td style={{ padding: '16px', fontWeight: '600' }}>342</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #eee' }}>
              <td style={{ padding: '16px' }}>Pizza Pepperoni</td>
              <td style={{ padding: '16px' }}>Pizza Nostra</td>
              <td style={{ padding: '16px', fontWeight: '600' }}>215</td>
            </tr>
            <tr>
              <td style={{ padding: '16px' }}>Maki Acevichado</td>
              <td style={{ padding: '16px' }}>Sushi Zen</td>
              <td style={{ padding: '16px', fontWeight: '600' }}>189</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
