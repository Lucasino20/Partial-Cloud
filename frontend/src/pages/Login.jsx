
import React, { useState } from 'react';
import { login, fetchUsuarios } from '../api';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await login({ email, password });
      const allUsers = await fetchUsuarios();
      const me = allUsers.find(u => u.email === email);
      if(!me) throw new Error("Usuario no encontrado en la DB");
      onLogin(me);
    } catch(err) {
      setError(err.message || 'Error al iniciar sesión');
    }
    setLoading(false);
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', paddingTop: 0 }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '400px' }}>
        <h1 style={{ textAlign: 'center', color: 'var(--primary-color)' }}>CloudEats</h1>
        <p style={{ textAlign: 'center', marginBottom: '32px' }}>Ingresa a tu cuenta para ordenar</p>
        
        {error && <div style={{ background: 'rgba(239,68,68,0.2)', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Correo Electrónico (Prueba: user_1@gmail.com)</label>
            <input type="email" required className="form-control" value={email} onChange={e=>setEmail(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Contraseña (Prueba: utec123)</label>
            <input type="password" required className="form-control" value={password} onChange={e=>setPassword(e.target.value)} />
          </div>
          <button type="submit" className="btn" style={{ width: '100%', marginTop: '16px' }} disabled={loading}>
            {loading ? 'Verificando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
};
export default Login;
