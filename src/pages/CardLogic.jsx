import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, updateDoc, collection, addDoc, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

function CardLogic() {
  const { cardId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [cardData, setCardData] = useState(null);
  const [history, setHistory] = useState([]);

  // Form State for New Customers
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', state: '', zip: '', notes: '',
    pin: '', newsletter: false
  });

  // 1. Load Card Data & History
  useEffect(() => {
    const loadData = async () => {
      try {
        const docRef = doc(db, "cards", cardId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setCardData(docSnap.data());
          
          // Load History
          const q = query(
            collection(db, "transactions"),
            where("cardId", "==", cardId),
            orderBy("date", "desc"),
            limit(10)
          );
          const historySnap = await getDocs(q);
          const historyList = historySnap.docs.map(doc => doc.data());
          setHistory(historyList);
        } else {
          setCardData(null);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
      setLoading(false);
    };
    loadData();
  }, [cardId]);

  // Helper: Auto-format Phone
  const handlePhone = (e) => {
    let raw = e.target.value.replace(/\D/g, '');
    if (raw.length > 10) raw = raw.substring(0, 10);
    let formatted = raw.length > 6 ? `(${raw.substring(0,3)}) ${raw.substring(3,6)}-${raw.substring(6)}` : raw;
    setFormData({ ...formData, phone: formatted });
  };

  // 2. Create New Card
  const handleCreate = async () => {
    if (!formData.firstName || formData.pin.length !== 4) {
      alert("Name and 4-digit PIN required.");
      return;
    }
    try {
      setLoading(true);
      await setDoc(doc(db, "cards", cardId), {
        ...formData,
        balance: 0.00,
        created: Timestamp.now(),
        cardId: cardId
      });
      window.location.reload(); 
    } catch (error) {
      alert("Error creating card.");
    }
  };

  // 3. TRANSACTION: Add Funds
  const handleAddFunds = async () => {
    const amountStr = prompt("Enter amount to ADD ($):");
    if (!amountStr) return;
    const amount = parseFloat(amountStr);
    
    if (isNaN(amount) || amount <= 0) {
      alert("Invalid amount.");
      return;
    }
    await processTransaction(amount, "CREDIT");
  };

  // 4. TRANSACTION: Spend Funds (NO CUSTOMER PIN REQUIRED)
  const handleSpend = async () => {
    const amountStr = prompt("Enter amount to CHARGE ($):");
    if (!amountStr) return;
    const amount = parseFloat(amountStr);

    if (isNaN(amount) || amount <= 0) return;

    if (amount > cardData.balance) {
      alert("❌ Insufficient Funds!");
      return;
    }

    // Removed Customer PIN check here
    await processTransaction(-amount, "SPEND");
  };

  // 5. VIEW CUSTOMER PIN (Protected by STAFF PIN)
  const handleViewPin = async () => {
    const staffPin = prompt("👮 ENTER YOUR STAFF PIN to reveal customer code:");
    if (!staffPin) return;

    // Check if Staff PIN is valid in Database
    const q = query(collection(db, "staff"), where("pin", "==", staffPin));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      alert(`🔐 The Customer PIN is: ${cardData.pin}`);
    } else {
      alert("❌ Invalid Staff PIN. Access Denied.");
    }
  };

  // 6. Shared Transaction Logic
  const processTransaction = async (amount, type) => {
    setLoading(true);
    try {
      const newBalance = cardData.balance + amount;
      await updateDoc(doc(db, "cards", cardId), { balance: newBalance });
      await addDoc(collection(db, "transactions"), {
        cardId: cardId,
        type: type,
        amount: Math.abs(amount),
        date: Timestamp.now(),
        balanceAfter: newBalance
      });
      alert("✅ Transaction Successful!");
      window.location.reload();
    } catch (error) {
      console.error(error);
      alert("Transaction Failed.");
      setLoading(false);
    }
  };

  // ---------------- RENDER ----------------
  if (loading) return <div style={{padding:'20px'}}>Loading...</div>;

  // --- SCENARIO A: EXISTING CARD DASHBOARD ---
  if (cardData) {
    return (
      <div style={{ padding: '20px', width: '100%', maxWidth:'1000px', margin:'0 auto' }}>
        <button onClick={() => navigate('/dashboard')} style={{marginBottom:'10px', background:'transparent', border:'1px solid #777', color:'white', padding:'5px 10px'}}>← Back</button>
        
        <div style={{ border: '2px solid #333', borderRadius: '10px', padding: '20px', background: '#f9f9f9', textAlign:'center', color: 'black' }}>
          <h2 style={{margin:'0'}}>{cardData.firstName} {cardData.lastName}</h2>
          <p style={{color:'#666'}}>{cardData.email}</p>
          
          <button 
            onClick={handleViewPin}
            style={{marginTop:'5px', background:'#eee', border:'1px solid #ccc', borderRadius:'4px', fontSize:'12px', padding:'5px', cursor:'pointer', color:'#333'}}
          >
            🔐 View Customer PIN
          </button>

          <hr />
          <div style={{fontSize:'14px', color:'#555'}}>CURRENT BALANCE</div>
          <div style={{ fontSize: '48px', fontWeight: 'bold', color: cardData.balance > 0 ? 'green' : 'black' }}>
            ${cardData.balance.toFixed(2)}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '20px' }}>
          <button 
            onClick={handleAddFunds}
            style={{ padding: '20px', background: '#28a745', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px', cursor:'pointer' }}
          >
            + ADD FUNDS
          </button>
          <button 
            onClick={handleSpend}
            style={{ padding: '20px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px', cursor:'pointer' }}
          >
            - SPEND
          </button>
        </div>

        {/* Notes Section */}
        <div style={{marginTop:'20px', background:'#fff', padding:'10px', border:'1px solid #ddd', color: 'black'}}>
            <strong>📝 Notes:</strong> {cardData.notes || "None"}
        </div>

        {/* History List */}
        <h3 style={{marginTop:'30px', color:'white'}}>Recent History</h3>
        <div style={{ background: '#fff', border: '1px solid #ddd', color: 'black' }}>
          {history.length === 0 ? <p style={{padding:'10px'}}>No transactions yet.</p> : (
            history.map((t, index) => (
              <div key={index} style={{ display:'flex', justifyContent:'space-between', padding:'10px', borderBottom:'1px solid #eee', alignItems:'center' }}>
                {/* Date and Time on the same line */}
                <span style={{fontSize:'14px', fontWeight:'bold'}}>
                  {new Date(t.date.seconds * 1000).toLocaleString([], { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
                <span style={{fontWeight:'bold', color: t.type === 'CREDIT' ? 'green' : 'red', fontSize:'16px'}}>
                  {t.type === 'CREDIT' ? '+' : '-'}${t.amount.toFixed(2)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    );
  }

  // --- SCENARIO B: NEW CARD REGISTRATION ---
  return (
    <div style={{ padding: '20px', width: '100%', maxWidth: '800px', margin: '0 auto' }}>
      <h2>🆕 Activate New Card</h2>
      <p>Card ID: <b>{cardId}</b></p>
      <div style={{ display: 'grid', gap: '10px' }}>
        <input placeholder="First Name" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} style={inputStyle} />
        <input placeholder="Last Name" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} style={inputStyle} />
        <input placeholder="Phone" value={formData.phone} onChange={handlePhone} style={inputStyle} />
        <input type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={inputStyle} />
        <label><input type="checkbox" checked={formData.newsletter} onChange={e => setFormData({...formData, newsletter: e.target.checked})} /> Opt-in to Newsletter?</label>
        <input placeholder="City, State, Zip" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} style={inputStyle} />
        <textarea placeholder="Notes" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} style={{...inputStyle, height:'60px'}} />
        <hr />
        <h3 style={{color:'#ff4444'}}>🔐 Set Security PIN</h3>
        <input type="number" placeholder="0000" value={formData.pin} onChange={e => setFormData({...formData, pin: e.target.value.substring(0,4)})} style={{...inputStyle, fontSize:'24px', width:'100px'}} />
        <button onClick={handleCreate} style={{marginTop:'20px', padding:'15px', background:'green', color:'white', border:'none', fontSize:'18px', cursor:'pointer'}}>✅ ACTIVATE CARD</button>
      </div>
    </div>
  );
}

const inputStyle = { padding: '10px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '5px' };

export default CardLogic;