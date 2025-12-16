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

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h1>Maximus Collectibles</h1>
      
      <h3 style={{ color: '#fff', marginTop: '-10px' }}>
        Welcome, {name}
      </h3>
      
      {role === 'admin' && (
        <span style={{background:'#007bff', color:'white', padding:'4px 12px', borderRadius:'12px', fontSize:'12px', fontWeight:'bold', marginBottom:'30px', letterSpacing:'1px'}}>
          ADMIN ACCESS
        </span>
      )}

      {/* UPDATED GRID LAYOUT FOR IPAD */}
      <div style={{ 
        display: 'grid', 
        gap: '20px', 
        marginTop: '10px', 
        width: '100%', 
        maxWidth: '800px', // Wider container
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' // Creates 2 columns automatically on iPad
      }}>
        
        <button 
          style={{ padding: '30px', fontSize: '20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:'10px' }}
          onClick={() => navigate('/scan')}
        >
          <span style={{fontSize:'40px'}}>📷</span>
          SCAN CARD
        </button>

        <button 
          style={{ padding: '30px', fontSize: '20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:'10px' }}
          onClick={() => navigate('/manual')}npm run build
        >
          <span style={{fontSize:'40px'}}>⌨️</span>
          MANUAL ENTRY
        </button>

        <button 
          style={{ padding: '30px', fontSize: '20px', background: '#6f42c1', color: 'white', border: 'none', borderRadius: '12px', cursor: 'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:'10px' }}
          onClick={() => navigate('/customers')}
        >
          <span style={{fontSize:'40px'}}>👥</span>
          CUSTOMER LIST
        </button>

        {role === 'admin' && (
          <button 
            style={{ padding: '30px', fontSize: '20px', background: '#333', color: 'white', border: '1px solid #555', borderRadius: '12px', cursor: 'pointer', display:'flex', flexDirection:'column', alignItems:'center', gap:'10px' }}
            onClick={() => navigate('/staff')}
          >
            <span style={{fontSize:'40px'}}>👮</span>
            MANAGE STAFF
          </button>
        )}
      </div>

      <button 
        style={{ marginTop: '50px', padding: '10px 30px', background: 'transparent', border: '1px solid #ccc', cursor: 'pointer', color: '#aaa' }}
        onClick={handleLogout}
      >
        Log Out
      </button>
    </div>
  );
}

export default Dashboard;