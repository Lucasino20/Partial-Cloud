
import React, { useState, useEffect } from 'react';
import { fetchDashboard, fetchPlatosPopulares } from '../api';

const Dashboard = ({ user }) => {
  const [data, setData] = useState(null);
  const [athena, setAthena] = useState([]);

  useEffect(() => {
    fetchDashboard(user.id).then(d => setData(d)).catch(e=>console.log(e));
    fetchPlatosPopulares(3).then(d => setAthena(d.data || d)).catch(e=>console.log(e));
  }, [user.id]);

  if(!data) return <div className="container">Cargando dashboard...</div>;

  return (
    <div className="container animate-fade-in">
      <h1>Dashboard Consolidado (Historial + Athena)</h1>
      <p style={{marginBottom: '32px'}}>Este panel consume el Agregador de Go y AWS Athena Data Analytics.</p>

      <div className="grid-responsive">
        <div className="glass-panel">
          <h2 style={{color:'var(--primary-color)'}}>Mi Resumen</h2>
          <p><b>Nombre:</b> {data.usuario?.nombre} {data.usuario?.apellido}</p>
          <p><b>Email:</b> {data.usuario?.email}</p>
          <hr style={{border:'0', borderTop:'1px solid var(--border-color)', margin:'16px 0'}} />
          <h3>Restaurante Favorito</h3>
          {data.restaurante_favorito ? (
            <p>{data.restaurante_favorito.nombre} ({data.restaurante_favorito.distrito}) - ⭐ {data.restaurante_favorito.calificacion}</p>
          ) : <p>No hay favorito</p>}
        </div>

        <div className="glass-panel">
          <h2 style={{color:'#3b82f6'}}>Top Platos (AWS Athena)</h2>
          <p style={{fontSize:'0.9rem', marginBottom:'16px'}}>Reporte de Big Data generado desde S3 via Glue Data Catalog.</p>
          {athena && athena.length > 0 ? athena.map((row, i) => (
             <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--border-color)'}}>
               <span>{row.dish_name || 'Desconocido'}</span>
               <span style={{fontWeight:'bold'}}>{row.total_vendidos || 0} ventas</span>
             </div>
          )) : <p>Cargando modelo analítico...</p>}
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
