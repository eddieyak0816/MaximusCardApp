import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore'; 
import { db } from '../firebase'; 

function Login() {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleNum = (num) => {
    if (pin.length < 4) setPin(pin + num);
  };

  const handleClear = () => setPin('');

  const handleLogin = async () => {
    if (pin.length !== 4) return;
    
    setLoading(true);
    
    try {
      const q = query(collection(db, "staff"), where("pin", "==", pin));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Found the user!
        const staffData = querySnapshot.docs[0].data();
        
        // SAVE NAME TO MEMORY
        localStorage.setItem("staffName", staffData.name); 
        localStorage.setItem("staffRole", staffData.role);

        navigate('/dashboard');
      } else {
        alert("Invalid PIN. Access Denied.");
        setPin('');
      }
    } catch (error) {
      console.error("Error logging in:", error);
      alert("Connection Error. Check your internet.");
    }
    
    setLoading(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '50px' }}>
      <h2>Maximus Staff Login</h2>
      
      {/* PIN Dots Display */}
      <div style={{ fontSize: '40px', letterSpacing: '10px', marginBottom: '20px', height: '50px', color: 'white' }}>
        {pin.replace(/./g, '•') || "____"}
      </div>

      {/* Keypad Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', maxWidth: '300px' }}>
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
          <button 
            key={num} 
            onClick={() => handleNum(num.toString())}
            style={{ padding: '20px', fontSize: '24px', borderRadius: '10px', border: '1px solid #555', cursor: 'pointer', background: '#333', color: 'white' }}
          >
            {num}
          </button>
        ))}
        
        {/* CLR Button (Red Background, White Text) */}
        <button 
          onClick={handleClear} 
          style={{ padding: '20px', background: '#dc3545', color: 'white', fontWeight: 'bold', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize:'18px' }}
        >
          CLR
        </button>

        <button 
          onClick={() => handleNum('0')} 
          style={{ padding: '20px', fontSize: '24px', borderRadius: '10px', border: '1px solid #555', cursor: 'pointer', background: '#333', color: 'white' }}
        >
          0
        </button>

        {/* GO Button (Green Background, White Text) */}
        <button 
          onClick={handleLogin} 
          disabled={loading}
          style={{ padding: '20px', color: 'white', background: loading ? '#ccc' : 'green', fontWeight: 'bold', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize:'18px' }}
        >
          {loading ? "..." : "GO"}
        </button>
      </div>
    </div>
  );
}

export default Login;