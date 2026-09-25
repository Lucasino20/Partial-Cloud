
import React, { useState, useEffect } from 'react';
import { fetchDashboard, fetchPlatosPopulares, fetchVentasMensuales } from '../api';

const Dashboard = ({ user }) => {
  const [data, setData] = useState(null);
  const [athena, setAthena] = useState([]);
  const [ventas, setVentas] = useState([]);

  useEffect(() => {
    fetchDashboard(user.id).then(d => setData(d)).catch(e=>console.log(e));
    fetchPlatosPopulares(5).then(d => setAthena(d.data || d)).catch(e=>console.log(e));
    fetchVentasMensuales().then(d => setVentas(d.data || d)).catch(e=>console.log(e));
  }, [user.id]);

  if(!data) return <div className="container" style={{display:'flex', justifyContent:'center', marginTop:'50px'}}><div className="loading-spinner"></div></div>;

  return (
    <div className="container animate-fade-in" style={{ padding: '40px 20px', maxWidth: '1200px' }}>
      <div style={{ textAlign: 'center', marginBottom: '50px' }}>
        <h1 style={{ fontSize: '2.8rem', background: 'linear-gradient(to right, #ffffff, #9ca3af)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', marginBottom: '10px' }}>
          Data Intelligence
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>Monitoreo analítico impulsado por AWS Athena y Go</p>
      </div>

      <div className="grid-responsive" style={{ gap: '30px' }}>
        {/* Panel Resumen */}
        <div className="glass-panel hover-card" style={{ padding: '30px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, var(--primary-color), #818cf8)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '15px' }}>
              👤
            </div>
            <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Mi Resumen</h2>
          </div>
          <div style={{ background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '16px' }}>
            <p style={{ margin: '0 0 10px 0', fontSize: '1.1rem' }}><b>{data.usuario?.nombre} {data.usuario?.apellido}</b></p>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>{data.usuario?.email}</p>
          </div>
          <hr style={{ border: '0', borderTop: '1px solid rgba(255,255,255,0.05)', margin: '24px 0' }} />
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-muted)', marginBottom: '15px' }}>RESTAURANTE FRECUENTE</h3>
          {data.restaurante_favorito ? (
            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(var(--primary-color-rgb), 0.1)', padding: '15px', borderRadius: '16px', border: '1px solid rgba(var(--primary-color-rgb), 0.2)' }}>
              <div>
                <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: 'white' }}>{data.restaurante_favorito.nombre}</p>
                <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--primary-color)' }}>{data.restaurante_favorito.distrito} • ⭐ {data.restaurante_favorito.calificacion}</p>
              </div>
            </div>
          ) : <p style={{ color: 'var(--text-muted)' }}>Aún no hay suficientes datos</p>}
        </div>

        {/* Panel Platos Athena */}
        <div className="glass-panel hover-card" style={{ padding: '30px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #f59e0b, #ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '15px' }}>
              🔥
            </div>
            <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Top Platos</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {athena && athena.length > 0 ? athena.map((row, i) => (
               <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', transition: 'all 0.2s ease' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                   <span style={{ color: 'var(--text-muted)', fontWeight: 'bold', fontSize: '0.9rem' }}>#{i+1}</span>
                   <span style={{ fontWeight: '500' }}>{row.plato || row.nombre_plato || 'Desconocido'}</span>
                 </div>
                 <span style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#fcd34d', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                   {Number(row.total_ventas || 0).toLocaleString()} ventas
                 </span>
               </div>
            )) : <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>Cargando modelo analítico...</div>}
          </div>
        </div>

        {/* Panel Ventas Mensuales Athena */}
        <div className="glass-panel hover-card" style={{ padding: '30px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '15px' }}>
              📈
            </div>
            <h2 style={{ margin: 0, fontSize: '1.4rem' }}>Facturación Mensual</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {ventas && ventas.length > 0 ? ventas.map((row, i) => (
               <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', borderLeft: '3px solid #10b981' }}>
                 <span style={{ fontWeight: '500', color: '#a7f3d0' }}>{row.mes}</span>
                 <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                   S/ {Number(row.total_recaudado || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                 </span>
               </div>
            )) : <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>Cargando modelo analítico...</div>}
          </div>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
