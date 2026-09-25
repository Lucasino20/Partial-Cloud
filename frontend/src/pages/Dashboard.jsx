
import React, { useState, useEffect } from 'react';
import { fetchDashboard, fetchVentasRestaurante, fetchUsuariosFrecuentes } from '../api';

const Dashboard = ({ user }) => {
  const [data, setData] = useState(null);
  const [ventasRestaurantes, setVentasRestaurantes] = useState([]);
  const [usuariosFrecuentes, setUsuariosFrecuentes] = useState([]);

  useEffect(() => {
    fetchDashboard(user.id).then(d => setData(d)).catch(e=>console.log(e));
    fetchVentasRestaurante(5).then(d => setVentasRestaurantes(d.data || d)).catch(e=>console.log(e));
    fetchUsuariosFrecuentes(5).then(d => setUsuariosFrecuentes(d.data || d)).catch(e=>console.log(e));
  }, [user.id]);

  if(!data) return <div className="container" style={{display:'flex', justifyContent:'center', marginTop:'50px'}}><div className="loading-spinner"></div></div>;

  return (
    <div className="container animate-fade-in" style={{ padding: '40px 20px', maxWidth: '1200px' }}>
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h1 style={{ fontSize: '2.8rem', background: 'linear-gradient(to right, var(--primary-color), #f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '10px' }}>
          Data Intelligence
        </h1>
        <p style={{ color: '#4b5563', fontSize: '1.1rem' }}>Monitoreo analítico impulsado por AWS Athena y Go</p>
      </div>

      <div className="grid-responsive" style={{ gap: '30px' }}>
        {/* Panel Resumen */}
        <div className="glass-panel hover-card" style={{ padding: '30px', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, var(--primary-color), #818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '15px', color: 'white' }}>
              👤
            </div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#111827' }}>Mi Resumen</h2>
          </div>
          <div style={{ background: '#f3f4f6', padding: '20px', borderRadius: '16px' }}>
            <p style={{ margin: '0 0 10px 0', fontSize: '1.1rem', color: '#111827' }}><b>{data.usuario?.nombre} {data.usuario?.apellido}</b></p>
            <p style={{ margin: 0, color: '#4b5563' }}>{data.usuario?.email}</p>
          </div>
          <hr style={{ border: '0', borderTop: '1px solid #e5e7eb', margin: '24px 0' }} />
          <h3 style={{ fontSize: '1.1rem', color: '#4b5563', marginBottom: '15px' }}>RESTAURANTE FRECUENTE</h3>
          {data.restaurante_favorito ? (
            <div style={{ display: 'flex', alignItems: 'center', background: '#fff7ed', padding: '15px', borderRadius: '16px', border: '1px solid #ffedd5' }}>
              <div>
                <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#c2410c' }}>{data.restaurante_favorito.nombre}</p>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#ea580c' }}>{data.restaurante_favorito.distrito} • ⭐ {data.restaurante_favorito.calificacion}</p>
              </div>
            </div>
          ) : <p style={{ color: '#9ca3af' }}>Aún no hay suficientes datos</p>}
        </div>

        {/* Panel Ventas por Restaurante */}
        <div className="glass-panel hover-card" style={{ padding: '30px', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #f59e0b, #ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '15px', color: 'white' }}>
              🔥
            </div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#111827' }}>Ventas por Restaurante</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {ventasRestaurantes && ventasRestaurantes.length > 0 ? ventasRestaurantes.map((row, i) => (
               <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: '#f9fafb', border: '1px solid #f3f4f6', borderRadius: '12px', transition: 'all 0.2s ease' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                   <span style={{ color: '#9ca3af', fontWeight: 'bold', fontSize: '0.9rem' }}>#{i+1}</span>
                   <span style={{ fontWeight: '500', color: '#1f2937' }}>{row.restaurante || 'Desconocido'}</span>
                 </div>
                 <span style={{ background: '#fef3c7', color: '#d97706', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                   S/ {Number(row.total_ventas || 0).toLocaleString()} ({row.total_pedidos} pd)
                 </span>
               </div>
            )) : <div style={{ textAlign: 'center', padding: '20px', color: '#9ca3af' }}>Cargando modelo analítico...</div>}
          </div>
        </div>

        {/* Panel Usuarios Frecuentes */}
        <div className="glass-panel hover-card" style={{ padding: '30px', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '24px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '15px', color: 'white' }}>
              👑
            </div>
            <h2 style={{ margin: 0, fontSize: '1.4rem', color: '#111827' }}>Usuarios Frecuentes</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {usuariosFrecuentes && usuariosFrecuentes.length > 0 ? usuariosFrecuentes.map((row, i) => (
               <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: '#f9fafb', borderRadius: '12px', borderLeft: '4px solid #10b981' }}>
                 <div style={{ display: 'flex', flexDirection: 'column' }}>
                   <span style={{ fontWeight: '600', color: '#111827' }}>{row.nombre}</span>
                   <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>{row.email}</span>
                 </div>
                 <span style={{ fontWeight: 'bold', fontSize: '1.1rem', color: '#059669' }}>
                   {row.numero_pedidos} pedidos
                 </span>
               </div>
            )) : <div style={{ textAlign: 'center', padding: '20px', color: '#9ca3af' }}>Cargando modelo analítico...</div>}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
