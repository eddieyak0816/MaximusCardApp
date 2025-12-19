import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ManualEntry() {
  const [manualCode, setManualCode] = useState('');
  const navigate = useNavigate();

  const handleGo = () => {
    if (!manualCode.trim()) return;
    navigate(`/card-logic/${manualCode.trim()}`);
  };

  return (
    <div style={{ padding: '20px', width: '100%', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      
      {/* UPDATED BACK BUTTON (Centered & Larger) */}
      <div style={{marginBottom:'40px'}}>
        <button 
            onClick={() => navigate('/dashboard')} 
            style={{background:'transparent', color:'white', border:'1px solid #777', padding:'10px 20px', borderRadius:'4px', cursor:'pointer', fontSize:'16px'}}
        >
           &larr; Back to Dashboard
        </button>
      </div>

      <h2>⌨️ Manual Entry</h2>
      <div style={{ background: '#333', padding: '40px', borderRadius: '12px' }}>
        <input type="text" value={manualCode} onChange={(e) => setManualCode(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleGo()} placeholder="Ex: MC-X9D2" autoFocus style={{ padding: '20px', fontSize: '24px', width: '80%', textAlign: 'center', marginBottom: '20px', textTransform: 'uppercase' }} />
        <br />
        <button onClick={handleGo} style={{ padding: '15px 40px', fontSize: '20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>GO</button>
      </div>
    </div>
  );
}

export default ManualEntry;