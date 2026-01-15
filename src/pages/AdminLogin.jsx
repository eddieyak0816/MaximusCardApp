import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../firebase';

function AdminLogin(){
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Sign out any anonymous session first
      try { await signOut(auth); } catch(e) { /* ignore */ }
      await signInWithEmailAndPassword(auth, email, password);
      // Store role locally so UI immediately shows admin buttons
      localStorage.setItem('staffRole', 'admin');
      // Optional: store name if you want
      navigate('/dashboard');
    } catch (err) {
      console.error('Admin sign-in failed:', err);
      alert('Sign-in failed. Check email and password.');
    }
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection:'column', alignItems:'center', marginTop: '60px' }}>
      <h2>Admin Sign In</h2>
      <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:'12px', width:'320px' }}>
        <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} style={{ padding:'12px', fontSize:'16px' }} />
        <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ padding:'12px', fontSize:'16px' }} />
        <button type="submit" disabled={loading} style={{ padding:'12px', background: loading ? '#ccc' : '#007bff', color:'white', border:'none', cursor:'pointer' }}>{loading ? 'Signing in...' : 'Sign In'}</button>
      </form>
      <p style={{ marginTop: '12px', color:'#aaa' }}>Use the admin email you created in Firebase Authentication.</p>
    </div>
  );
}
export default AdminLogin;
