import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SITES } from '../constants';

const USER_KEY = 'canteenUsers';

const UserSignup: React.FC = () => {
  const [site, setSite] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!site || !username || !password) {
      setError('Please fill all fields.');
      return;
    }
    try {
      const res = await fetch('http://192.168.1.14:4000/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ site, username, password })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Signup failed');
        return;
      }
      setSuccess(true);
      setSite('');
      setUsername('');
      setPassword('');
      setTimeout(() => {
        setSuccess(false);
        navigate('/');
      }, 1500);
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-xl shadow-lg mt-10">
      {/* Catalyst Logo */}
      <div className="text-center mb-4">
        <div style={{ fontSize: '1.3em', fontWeight: 'bold', letterSpacing: '2px', lineHeight: 1 }}>
          <span style={{ color: '#0055aa' }}>C</span>
          <span style={{ color: '#009933' }}>A</span>
          <span style={{ color: '#000000' }}>T</span>
          <span style={{ color: '#000000' }}>A</span>
          <span style={{ color: '#009933' }}>L</span>
          <span style={{ color: '#0055aa' }}>Y</span>
          <span style={{ color: '#994400' }}>S</span>
          <span style={{ color: '#994400' }}>T</span>
        </div>
        <div style={{
          fontSize: '0.75em',
          fontWeight: 'bold',
          color: '#666666',
          marginTop: '4px',
          borderTop: '2px solid #666666',
          display: 'inline-block',
          paddingTop: '3px',
          letterSpacing: '1px',
        }}>
          PARTNERING FOR SUSTAINABILITY
        </div>
      </div>
  <h2 className="text-2xl font-bold mb-6 text-center">User Signup</h2>
      <form onSubmit={handleSignup} className="space-y-6">
        <div>
          <label className="block mb-2 font-semibold">Select Site</label>
          <select value={site} onChange={e => setSite(e.target.value)} required className="w-full p-3 rounded-lg border border-gray-300">
            <option value="" disabled>Select a site...</option>
            {SITES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block mb-2 font-semibold">Username</label>
          <input type="text" value={username} onChange={e => setUsername(e.target.value)} required className="w-full p-3 rounded-lg border border-gray-300" />
        </div>
        <div>
          <label className="block mb-2 font-semibold">Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full p-3 rounded-lg border border-gray-300" />
        </div>
        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-500 text-sm">Signup successful! You can now login.</p>}
        <button type="submit" className="w-full bg-primary-600 text-white font-bold py-3 px-4 rounded-lg hover:bg-primary-700">Sign Up</button>
      </form>
    </div>
  );
};

export default UserSignup;
