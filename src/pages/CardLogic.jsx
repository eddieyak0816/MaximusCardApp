import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, setDoc, updateDoc, collection, addDoc, query, where, orderBy, limit, getDocs, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

function CardLogic() {
  const { cardId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [cardData, setCardData] = useState(null);
  const [customerData, setCustomerData] = useState(null);
  const [history, setHistory] = useState([]);

  // Registration
  const [mode, setMode] = useState('new'); 
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', email: '', phone: '', address: '', city: '', state: '', zip: '', notes: '', newsletter: false });
  const [cardPin, setCardPin] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const cardRef = doc(db, "cards", cardId);
        const cardSnap = await getDoc(cardRef);
        if (cardSnap.exists()) {
          const cData = cardSnap.data();
          setCardData(cData);
          if (cData.customerId) {
            const custRef = doc(db, "customers", cData.customerId);
            const custSnap = await getDoc(custRef);
            if (custSnap.exists()) setCustomerData(custSnap.data());
          }
          const q = query(collection(db, "transactions"), where("cardId", "==", cardId), orderBy("date", "desc"), limit(10));
          const historySnap = await getDocs(q);
          setHistory(historySnap.docs.map(d => d.data()));
        } else { setCardData(null); }
      } catch (error) { console.error(error); }
      setLoading(false);
    };
    loadData();
  }, [cardId]);

  const handlePhone = (e) => {
    let raw = e.target.value.replace(/\D/g, '');
    if (raw.length > 10) raw = raw.substring(0, 10);
    let formatted = raw.length > 6 ? `(${raw.substring(0,3)}) ${raw.substring(3,6)}-${raw.substring(6)}` : raw;
    setFormData({ ...formData, phone: formatted });
  };

  const handleSearchCustomer = async () => {
    if (!searchQuery) return;
    try {
        const qEmail = query(collection(db, "customers"), where("email", "==", searchQuery));
        const snapEmail = await getDocs(qEmail);
        const qPhone = query(collection(db, "customers"), where("phone", "==", searchQuery));
        const snapPhone = await getDocs(qPhone);
        const results = [];
        snapEmail.forEach(d => results.push({id: d.id, ...d.data()}));
        snapPhone.forEach(d => { if (!results.some(r => r.id === d.id)) results.push({id: d.id, ...d.data()}); });
        setSearchResults(results);
    } catch(err) { alert("Search error"); }
  };

  const handleActivate = async () => {
    if (cardPin.length !== 4) { alert("Card must have a 4-digit PIN."); return; }
    setLoading(true);
    try {
        let finalCustomerId = "";
        if (mode === 'search' && selectedCustomer) {
            finalCustomerId = selectedCustomer.id;
        } else {
            if (!formData.firstName) { alert("Name required"); setLoading(false); return; }
            const newCustRef = await addDoc(collection(db, "customers"), { ...formData, created: Timestamp.now() });
            finalCustomerId = newCustRef.id;
        }
        await setDoc(doc(db, "cards", cardId), { balance: 0.00, pin: cardPin, customerId: finalCustomerId, created: Timestamp.now(), cardId: cardId });
        alert("Card Activated!"); window.location.reload();
    } catch (error) { console.error(error); alert("Error activating."); setLoading(false); }
  };

  const handleAddFunds = async () => {
    const amountStr = prompt("Enter amount to ADD ($):");
    if (!amountStr) return;
    await processTransaction(parseFloat(amountStr), "CREDIT");
  };

  const handleSpend = async () => {
    const amountStr = prompt("Enter amount to CHARGE ($):");
    if (!amountStr) return;
    const amount = parseFloat(amountStr);
    if (amount > cardData.balance) { alert("❌ Insufficient Funds!"); return; }
    await processTransaction(-amount, "SPEND");
  };

  const handleViewPin = async () => {
    const staffPin = prompt("👮 ENTER STAFF PIN:");
    if (!staffPin) return;
    const q = query(collection(db, "staff"), where("pin", "==", staffPin));
    const snap = await getDocs(q);
    if (!snap.empty) alert(`🔐 PIN: ${cardData.pin}`); else alert("❌ Access Denied.");
  };

  const processTransaction = async (amount, type) => {
    if (isNaN(amount) || amount === 0) return;
    setLoading(true);
    try {
      const newBalance = cardData.balance + amount;
      await updateDoc(doc(db, "cards", cardId), { balance: newBalance });
      await addDoc(collection(db, "transactions"), { cardId: cardId, type, amount: Math.abs(amount), date: Timestamp.now(), balanceAfter: newBalance });
      alert("✅ Success!"); window.location.reload();
    } catch (error) { alert("Failed."); setLoading(false); }
  };

  if (loading) return <div style={{padding:'20px'}}>Loading...</div>;

  if (cardData && customerData) {
    return (
      <div style={{ padding: '20px', width: '100%', maxWidth:'1000px', margin:'0 auto' }}>
        <button onClick={() => navigate('/dashboard')} style={backBtnStyle}>← Back</button>
        <div style={{ border: '2px solid #333', borderRadius: '10px', padding: '20px', background: '#f9f9f9', textAlign:'center', color: 'black' }}>
          <h2 style={{margin:'0'}}>{customerData.firstName} {customerData.lastName}</h2>
          <p style={{color:'#666'}}>{customerData.email} | {customerData.phone}</p>
          <button onClick={handleViewPin} style={pinBtnStyle}>🔐 View Card PIN</button>
          <hr />
          <div style={{fontSize:'14px', color:'#555'}}>CURRENT BALANCE</div>
          <div style={{ fontSize: '48px', fontWeight: 'bold', color: cardData.balance > 0 ? 'green' : 'black' }}>${cardData.balance.toFixed(2)}</div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginTop: '20px' }}>
          <button onClick={handleAddFunds} style={{...actionBtn, background:'#28a745'}}>+ ADD FUNDS</button>
          <button onClick={handleSpend} style={{...actionBtn, background:'#dc3545'}}>- SPEND</button>
        </div>
        <div style={{marginTop:'20px', background:'#fff', padding:'10px', border:'1px solid #ddd', color: 'black'}}><strong>📝 Notes:</strong> {customerData.notes || "None"}</div>
        <h3 style={{marginTop:'30px', color:'white'}}>History</h3>
        <div style={{ background: '#fff', border: '1px solid #ddd', color: 'black' }}>
          {history.map((t, index) => (
            <div key={index} style={{ display:'flex', justifyContent:'space-between', padding:'10px', borderBottom:'1px solid #eee', alignItems:'center' }}>
              <div>
                <div style={{fontWeight:'bold'}}>{new Date(t.date.seconds * 1000).toLocaleDateString()}</div>
                <div style={{fontSize:'12px', color:'#555'}}>{new Date(t.date.seconds * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
              </div>
              <span style={{fontWeight:'bold', color: t.type === 'CREDIT' ? 'green' : 'red', fontSize:'16px'}}>{t.type === 'CREDIT' ? '+' : '-'}${t.amount.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', width: '100%', maxWidth: '800px', margin: '0 auto' }}>
      <button onClick={() => navigate('/dashboard')} style={backBtnStyle}>← Dashboard</button>
      <h2>🆕 Activate Card: {cardId}</h2>
      <div style={{display:'flex', gap:'10px', marginBottom:'20px'}}>
        <button onClick={() => setMode('new')} style={{...tabBtn, background: mode==='new' ? '#007bff' : '#333'}}>New Customer</button>
        <button onClick={() => setMode('search')} style={{...tabBtn, background: mode==='search' ? '#007bff' : '#333'}}>Link Existing</button>
      </div>
      {mode === 'search' && (
        <div style={{background:'#333', padding:'20px', borderRadius:'8px'}}>
            <p>Search by exact Phone or Email:</p>
            <div style={{display:'flex', gap:'10px'}}>
                <input placeholder="Enter phone or email..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{flex:1, padding:'10px'}} />
                <button onClick={handleSearchCustomer} style={{padding:'10px', background:'orange', border:'none', borderRadius:'4px', cursor:'pointer'}}>Search</button>
            </div>
            {searchResults.length > 0 && (
                <div style={{marginTop:'10px', background:'white', color:'black', borderRadius:'4px'}}>
                    {searchResults.map(cust => (
                        <div key={cust.id} style={{padding:'10px', borderBottom:'1px solid #eee', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                            <span><b>{cust.firstName} {cust.lastName}</b> ({cust.email})</span>
                            <button onClick={() => setSelectedCustomer(cust)} style={{background: selectedCustomer?.id === cust.id ? 'green' : '#ddd', color: selectedCustomer?.id === cust.id ? 'white' : 'black', border:'none', padding:'5px 10px', borderRadius:'4px'}}>{selectedCustomer?.id === cust.id ? 'Selected' : 'Select'}</button>
                        </div>
                    ))}
                </div>
            )}
        </div>
      )}
      {mode === 'new' && (
          <div style={{ display: 'grid', gap: '10px' }}>
            <input placeholder="First Name" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} style={inputStyle} />
            <input placeholder="Last Name" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} style={inputStyle} />
            <input placeholder="Phone" value={formData.phone} onChange={handlePhone} style={inputStyle} />
            <input placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={inputStyle} />
            <textarea placeholder="Notes" value={formData.notes} onChange={e => setFormData({...formData, notes: e.target.value})} style={{...inputStyle, height:'60px'}} />
          </div>
      )}
      <hr style={{margin:'20px 0', borderColor:'#555'}} />
      <h3 style={{color:'#ff4444'}}>Set Card PIN</h3>
      <input type="number" placeholder="0000" value={cardPin} onChange={e => setCardPin(e.target.value.substring(0,4))} style={{...inputStyle, fontSize:'24px', width:'150px'}} />
      <button onClick={handleActivate} style={{marginTop:'20px', padding:'15px', background:'green', color:'white', border:'none', fontSize:'18px', cursor:'pointer', width:'100%'}}>ACTIVATE CARD</button>
    </div>
  );
}
const backBtnStyle = {marginBottom:'10px', background:'transparent', border:'1px solid #777', color:'white', padding:'5px 10px'};
const pinBtnStyle = {marginTop:'5px', background:'#eee', border:'1px solid #ccc', borderRadius:'4px', fontSize:'12px', padding:'5px', cursor:'pointer', color:'#333'};
const actionBtn = { padding: '20px', color: 'white', border: 'none', borderRadius: '5px', fontSize: '16px', cursor:'pointer' };
const tabBtn = { flex:1, padding:'10px', color:'white', border:'1px solid #555', cursor:'pointer' };
const inputStyle = { padding: '10px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '5px' };
export default CardLogic;