
import React from 'react';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="header">
  <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0 }}>Canteen Feedback System</h1>
      {/* Add logo or user info here if needed */}
    </header>
  );
};

export default Header;
