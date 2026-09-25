import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Restaurantes from './pages/Restaurantes';
import Dashboard from './pages/Dashboard';
import UsersOrders from './pages/UsersOrders';
import OrdersPage from './pages/OrdersPage';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/restaurantes" element={<Restaurantes />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/usuarios" element={<UsersOrders />} />
        <Route path="/pedidos" element={<OrdersPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
