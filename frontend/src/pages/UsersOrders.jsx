import React, { useState, useEffect } from 'react';
import { fetchUsuarios, login } from '../api';

const UsersOrders = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loginMsg, setLoginMsg] = useState('');

  useEffect(() => {
    // 1. Invocar GET /usuarios (ms-usuarios)
    fetchUsuarios().then(data => {
      setUsuarios(data.usuarios || data);
    }).catch(e => console.error("Error fetching usuarios", e));
  }, []);

  const handleTestLogin = async () => {
    try {
      setLoginMsg('Autenticando...');
      // 2. Invocar POST /login (ms-usuarios)
      const res = await login({ email: "ana@example.com", password: "cambia-esta-clave" });
      setLoginMsg(res.token ? '¡Login exitoso (Token recibido)!' : 'Credenciales inválidas');
    } catch (e) {
      setLoginMsg('Error al conectar con login');
    }
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '40px 1.5rem' }}>
      <h1 className="section-title">Prueba de Microservicio Usuarios</h1>
      <div className="card" style={{ marginBottom: '20px' }}>
        <h3 style={{marginBottom: '16px'}}>Simular Login</h3>
        <button onClick={handleTestLogin} className="btn btn-primary">Test Login</button>
        {loginMsg && <p style={{marginTop: '10px', color: 'green'}}>{loginMsg}</p>}
      </div>

      <div className="card">
        <h3 style={{marginBottom: '16px'}}>Lista de Usuarios Registrados</h3>
        {usuarios && usuarios.length > 0 ? (
          <ul>
            {usuarios.map(u => (
              <li key={u.id} style={{padding: '8px 0', borderBottom: '1px solid #eee'}}>
                {u.nombre} {u.apellido} ({u.email})
              </li>
            ))}
          </ul>
        ) : (
          <p>No hay usuarios o no se pudo conectar.</p>
        )}
      </div>
    </div>
  );
};

export default UsersOrders;
