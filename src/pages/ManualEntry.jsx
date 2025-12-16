import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ManualEntry() {
  const [manualCode, setManualCode] = useState('');
  const navigate = useNavigate();

  const handleGo = () => {
    if (!manualCode.trim()) return;
    // Navigate to the Card Logic page with the typed ID
    navigate(`/card-logic/${manualCode.trim()}`);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleGo();
  };

  return (
    <div style={{ padding: '20px', width: '100%', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      
      <button 
        onClick={() => navigate('/dashboard')}
        style={{marginBottom:'40px', background:'transparent', border:'1px solid #777', color:'white', padding:'8px 16px', borderRadius:'4px', cursor:'pointer'}}
      >
        &larr; Back to Dashboard
      </button>

      <h2>⌨️ Manual Entry</h2>
      <p style={{color:'#ccc', marginBottom:'20px'}}>Type the Card ID found on the back of the card.</p>

      <div style={{ background: '#333', padding: '40px', borderRadius: '12px' }}>
        <input 
          type="text" 
          value={manualCode}
          onChange={(e) => setManualCode(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Ex: MC-X9D2"
          autoFocus
          style={{ 
            padding: '20px', 
            fontSize: '24px', 
            width: '80%', 
            textAlign: 'center', 
            marginBottom: '20px',
            textTransform: 'uppercase' // Visual help, though logic handles lowercase too
          }}
        />
        
        <br />

        <button 
          onClick={handleGo}
          style={{ 
            padding: '15px 40px', 
            fontSize: '20px', 
            background: '#28a745', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px', 
            cursor: 'pointer' 
          }}
        >
          GO
        </button>
      </div>
    </div>
  );
}

export default ManualEntry;