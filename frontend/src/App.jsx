
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Restaurantes from './pages/Restaurantes';
import Pedidos from './pages/Pedidos';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';
import Docs from './pages/Docs';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem("cloudeats_user");
    if(saved) setUser(JSON.parse(saved));
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("cloudeats_user", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("cloudeats_user");
  };

  return (
    <BrowserRouter>
      {user && <Navbar user={user} onLogout={handleLogout} />}
      <Routes>
        <Route path="/" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/restaurantes" />} />
        <Route path="/restaurantes" element={user ? <Restaurantes /> : <Navigate to="/" />} />
        <Route path="/pedidos" element={user ? <Pedidos user={user} /> : <Navigate to="/" />} />
        <Route path="/dashboard" element={user ? <Dashboard user={user} /> : <Navigate to="/" />} />
        <Route path="/admin" element={user?.role === 'admin' ? <Admin /> : <Navigate to="/" />} />
        <Route path="/docs" element={user ? <Docs /> : <Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
export default App;
