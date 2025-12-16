import React, { useState, useEffect } from 'react'; // Added useEffect
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore'; 
import { db } from '../firebase'; 

function Login() {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // 1. Watch the PIN. If it hits 4 digits, try to log in automatically.
  useEffect(() => {
    if (pin.length === 4) {
      attemptLogin(pin);
    }
  }, [pin]);

  const handleNum = (num) => {
    if (pin.length < 4) setPin(pin + num);
  };

  const handleClear = () => setPin('');

  // 2. Extracted Login Logic so it can be called by the Button OR the Auto-Trigger
  const attemptLogin = async (inputPin) => {
    if (loading) return; // Don't run twice
    setLoading(true);
    
    try {
      const q = query(collection(db, "staff"), where("pin", "==", inputPin));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        // Success
        const staffData = querySnapshot.docs[0].data();
        localStorage.setItem("staffName", staffData.name); 
        localStorage.setItem("staffRole", staffData.role);
        navigate('/dashboard');
      } else {
        // Failure
        // Small delay to allow the user to see the 4th dot appear before alerting
        setTimeout(() => {
            alert("Invalid PIN.");
            setPin('');
        }, 100);
      }
    } catch (error) {
      console.error("Error logging in:", error);
      alert("Connection Error.");
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
            style={numBtnStyle}
          >
            {num}
          </button>
        ))}
        
        {/* Red CLR Button */}
        <button 
          onClick={handleClear} 
          style={{...numBtnStyle, background: '#dc3545', color: 'white', border:'none', fontSize:'18px'}}
        >
          CLR
        </button>

        <button 
          onClick={() => handleNum('0')} 
          style={numBtnStyle}
        >
          0
        </button>

        {/* GO Button (Still here, but mostly optional now) */}
        <button 
          onClick={() => attemptLogin(pin)} 
          disabled={loading || pin.length !== 4}
          style={{...numBtnStyle, background: loading ? '#ccc' : 'green', color: 'white', border:'none', fontSize:'18px'}}
        >
          {loading ? "..." : "GO"}
        </button>
      </div>
    </div>
  );
}

const numBtnStyle = { padding: '20px', fontSize: '24px', borderRadius: '10px', border: '1px solid #555', cursor: 'pointer', background: '#333', color: 'white' };

export default Login;