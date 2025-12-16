import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();
  const [name, setName] = useState("Staff");
  const [role, setRole] = useState("");

  useEffect(() => {
    const storedName = localStorage.getItem("staffName");
    const storedRole = localStorage.getItem("staffRole");
    if (storedName) setName(storedName);
    if (storedRole) setRole(storedRole);
  }, []);

  const handleLogout = () => { localStorage.clear(); navigate('/'); };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1>Maximus Collectibles</h1>
      <h3 style={{ color: '#fff', marginTop: '-10px' }}>Welcome, {name}</h3>
      {role === 'admin' && ( <span style={{background:'#007bff', color:'white', padding:'4px 12px', borderRadius:'12px', fontSize:'12px', fontWeight:'bold', marginBottom:'30px', letterSpacing:'1px'}}>ADMIN ACCESS</span> )}
      <div style={{ display: 'grid', gap: '20px', marginTop: '10px', width: '100%', maxWidth: '800px', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
        <button onClick={() => navigate('/scan')} style={btnStyle('#007bff')}><span style={{fontSize:'40px'}}>📷</span> SCAN CARD</button>
        <button onClick={() => navigate('/manual')} style={btnStyle('#28a745')}><span style={{fontSize:'40px'}}>⌨️</span> MANUAL ENTRY</button>
        <button onClick={() => navigate('/customers')} style={btnStyle('#6f42c1')}><span style={{fontSize:'40px'}}>👥</span> CUSTOMER LIST</button>
        {role === 'admin' && (
          <>
            <button onClick={() => navigate('/staff')} style={btnStyle('#333', '1px solid #555')}><span style={{fontSize:'40px'}}>👮</span> MANAGE STAFF</button>
            <button onClick={() => navigate('/all-cards')} style={btnStyle('#dc3545')}><span style={{fontSize:'40px'}}>💳</span> MANAGE CARDS</button>
          </>
        )}
      </div>
      <button onClick={handleLogout} style={{ marginTop: '50px', padding: '10px 30px', background: 'transparent', border: '1px solid #ccc', cursor: 'pointer', color: '#aaa' }}>Log Out</button>
    </div>
  );
}
const btnStyle = (bg, border = 'none') => ({ padding: '30px', fontSize: '20px', background: bg, color: 'white', border: border, borderRadius: '12px', cursor: 'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:'10px' });
export default Dashboard;