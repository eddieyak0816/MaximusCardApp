import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Html5QrcodeScanner } from 'html5-qrcode';

function ScanPage() {
  const navigate = useNavigate();

  const handleCodeFound = (code) => {
    const cleanCode = code.trim();
    // Stop scanner implicitly by navigating away
    navigate(`/card-logic/${cleanCode}`);
  };

  useEffect(() => {
    // Initialize the Camera Scanner
    const scanner = new Html5QrcodeScanner(
      "reader", 
      { fps: 10, qrbox: 250 },
      false
    );

    scanner.render(
      (decodedText) => {
        scanner.clear();
        handleCodeFound(decodedText);
      },
      (error) => {
        // Ignore scan errors while searching
      }
    );

    return () => {
      scanner.clear().catch(error => console.error("Failed to clear scanner", error));
    };
  }, []);

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
      
      {/* BACK BUTTON */}
      <div style={{width:'100%', textAlign:'left', marginBottom:'10px'}}>
        <button 
          onClick={() => navigate('/dashboard')}
          style={{
            background: 'transparent', 
            border: '1px solid #777', 
            color: 'white', 
            padding: '10px 20px', 
            borderRadius: '4px', 
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          &larr; Back to Dashboard
        </button>
      </div>

      <h2>📷 Scan Customer Card</h2>
      
      {/* The Camera Viewport */}
      <div id="reader" style={{ width: '100%', borderRadius:'8px', overflow:'hidden', border:'2px solid #555' }}></div>
      
      <p style={{marginTop:'20px', color:'#999'}}>
        Point the camera at the QR code on the back of the card.
      </p>
    </div>
  );
}

export default ScanPage;