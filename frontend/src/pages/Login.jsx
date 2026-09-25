import React, { useState } from 'react';
import { login, fetchUsuarios, registerUser } from '../api';

const Login = ({ onLogin }) => {
  const [isRegister, setIsRegister] = useState(false);
  
  // States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
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

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setSuccess('');
    try {
      await registerUser({
        nombre, apellido, email, telefono, password, direccion
      });
      setSuccess('¡Usuario registrado exitosamente! Ahora puedes iniciar sesión.');
      setIsRegister(false); // Switch to login view
      // Clear form except email/password
      setNombre(''); setApellido(''); setTelefono(''); setDireccion('');
    } catch(err) {
      setError(err.message || 'Error al registrar el usuario');
    }
    setLoading(false);
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', paddingTop: 0 }}>
      <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '450px' }}>
        <h1 style={{ textAlign: 'center', color: 'var(--primary-color)' }}>CloudEats</h1>
        <p style={{ textAlign: 'center', marginBottom: '32px' }}>
          {isRegister ? 'Crea una cuenta nueva' : 'Ingresa a tu cuenta para ordenar'}
        </p>
        
        {error && <div style={{ background: 'rgba(239,68,68,0.2)', color: '#ef4444', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>{error}</div>}
        {success && <div style={{ background: 'rgba(34,197,94,0.2)', color: '#22c55e', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>{success}</div>}
        
        {isRegister ? (
          <form onSubmit={handleRegisterSubmit}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Nombre</label>
                <input type="text" required className="form-control" value={nombre} onChange={e=>setNombre(e.target.value)} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label>Apellido</label>
                <input type="text" required className="form-control" value={apellido} onChange={e=>setApellido(e.target.value)} />
              </div>
            </div>
            
            <div className="form-group">
              <label>Correo Electrónico</label>
              <input type="email" required className="form-control" value={email} onChange={e=>setEmail(e.target.value)} />
            </div>
            
            <div className="form-group">
              <label>Teléfono</label>
              <input type="text" required className="form-control" value={telefono} onChange={e=>setTelefono(e.target.value)} />
            </div>

            <div className="form-group">
              <label>Dirección</label>
              <input type="text" required className="form-control" value={direccion} onChange={e=>setDireccion(e.target.value)} />
            </div>
            
            <div className="form-group">
              <label>Contraseña</label>
              <input type="password" required className="form-control" value={password} onChange={e=>setPassword(e.target.value)} />
            </div>
            
            <button type="submit" className="btn" style={{ width: '100%', marginTop: '16px' }} disabled={loading}>
              {loading ? 'Registrando...' : 'Crear Cuenta'}
            </button>
            <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.9rem' }}>
              ¿Ya tienes cuenta? <span style={{ color: 'var(--primary-color)', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => setIsRegister(false)}>Inicia sesión aquí</span>
            </p>
          </form>
        ) : (
          <form onSubmit={handleLoginSubmit}>
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
            <p style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.9rem' }}>
              ¿No tienes cuenta? <span style={{ color: 'var(--primary-color)', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => setIsRegister(true)}>Regístrate aquí</span>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default Login;
