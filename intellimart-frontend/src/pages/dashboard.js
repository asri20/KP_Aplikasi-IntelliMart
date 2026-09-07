// src/pages/Dashboard.js
import React, { useContext } from 'react';
import { AuthContext } from '../context/authcontext';
import { Link, useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Selamat Datang, {user?.name || 'User'}</h1>
      <p>Email: {user?.email}</p>

      <nav style={{ margin: '20px 0' }}>
        <Link to="/suppliers" style={{ marginRight: '15px' }}>Supplier</Link>
        <Link to="/purchase-orders/create" style={{ marginRight: '15px' }}>Purchase Order</Link>
        <Link to="/goods-receipt">Goods Receipt</Link>
      </nav>

      <button onClick={handleLogout}>Logout</button>
    </div>
  );
};

export default Dashboard;