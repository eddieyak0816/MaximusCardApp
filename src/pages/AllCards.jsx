import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

function AllCards() {
  const navigate = useNavigate();
  const [cards, setCards] = useState([]);
  const [customerMap, setCustomerMap] = useState({}); // Stores ID -> Name mapping
  const [loading, setLoading] = useState(true);

  // 1. Load Data (Cards AND Customers)
  const fetchData = async () => {
    try {
      const cardSnap = await getDocs(collection(db, "cards"));
      const cardList = cardSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const custSnap = await getDocs(collection(db, "customers"));
      const custLookup = {};
      custSnap.forEach(doc => {
        const data = doc.data();
        custLookup[doc.id] = `${data.firstName} ${data.lastName}`;
      });

      setCards(cardList);
      setCustomerMap(custLookup);

    } catch (error) {
      console.error("Error fetching data:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (cardId) => {
    if (window.confirm(`⚠️ ARE YOU SURE?\n\nThis will permanently delete Card: ${cardId}.\nBalance and history will be lost.`)) {
      try {
        await deleteDoc(doc(db, "cards", cardId));
        setCards(cards.filter(c => c.id !== cardId));
      } catch (error) {
        alert("Error deleting card.");
      }
    }
  };

  const goToCustomer = (customerId) => {
    if (customerId) {
        navigate('/customers', { state: { customerId: customerId } });
    }
  };

  if (loading) return <div style={{padding:'20px'}}>Loading Cards...</div>;

  return (
    <div style={{ padding: '20px', width: '100%', maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
      
      {/* CENTERED BACK BUTTON */}
      <div style={{marginBottom:'20px'}}>
        <button 
            onClick={() => navigate('/dashboard')} 
            style={{background:'transparent', color:'white', border:'1px solid #777', padding:'10px 20px', borderRadius:'4px', cursor:'pointer', fontSize:'16px'}}
        >
           &larr; Back to Dashboard
        </button>
      </div>

      <h2>Admin: Card Manager ({cards.length})</h2>

      <div style={{overflowX: 'auto', borderRadius:'8px', border:'1px solid #444'}}>
        <table style={{ width: '100%', borderCollapse: 'collapse', color: 'black', background: 'white' }}>
          <thead>
            <tr style={{ background: '#dc3545', color: 'white' }}>
              <th style={{padding:'15px', textAlign:'left'}}>Card ID</th>
              <th style={{padding:'15px', textAlign:'left'}}>Balance</th>
              <th style={{padding:'15px', textAlign:'left'}}>Customer</th> 
              <th style={{padding:'15px', textAlign:'left'}}>Action</th>
            </tr>
          </thead>
          <tbody>
            {cards.length === 0 ? (
                <tr><td colSpan="4" style={{padding:'20px', textAlign:'center'}}>No cards found.</td></tr>
            ) : (
                cards.map((card) => (
                  <tr key={card.id} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{padding:'15px', fontWeight:'bold', textAlign:'left'}}>{card.id}</td>
                    
                    <td style={{padding:'15px', color: card.balance > 0 ? 'green' : 'black', textAlign:'left'}}>
                        ${card.balance?.toFixed(2) || '0.00'}
                    </td>
                    
                    <td style={{padding:'15px', fontSize:'14px', textAlign:'left'}}>
                        {card.customerId ? (
                            <span 
                                onClick={() => goToCustomer(card.customerId)}
                                title="Go to Customer Profile"
                                style={{
                                    color: '#007bff', 
                                    textDecoration: 'underline', 
                                    cursor: 'pointer', 
                                    fontWeight: 'bold'
                                }}
                            >
                                {customerMap[card.customerId] || "Unknown ID"}
                            </span>
                        ) : (
                            <span style={{color:'#999', fontStyle:'italic'}}>Unlinked</span>
                        )}
                    </td>
                    
                    <td style={{padding:'15px', textAlign:'left', display:'flex', gap:'10px'}}>
                      <button onClick={() => navigate(`/card-logic/${card.id}`)} title="Manage Card" style={{background:'transparent', border:'1px solid #ccc', borderRadius:'4px', fontSize:'20px', cursor:'pointer', padding:'5px 10px'}}>✏️</button>
                      <button onClick={() => handleDelete(card.id)} title="Delete Card" style={{background:'transparent', border:'1px solid #ffcccc', borderRadius:'4px', fontSize:'20px', cursor:'pointer', padding:'5px 10px'}}>❌</button>
                    </td>
                  </tr>
                ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AllCards;