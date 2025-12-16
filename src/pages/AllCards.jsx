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
      // A. Fetch All Cards
      const cardSnap = await getDocs(collection(db, "cards"));
      const cardList = cardSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // B. Fetch All Customers (to lookup names)
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

  // 2. Delete Logic
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

  if (loading) return <div style={{padding:'20px'}}>Loading Cards...</div>;

  return (
    <div style={{ padding: '20px', width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
      
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
        <button onClick={() => navigate('/dashboard')} style={{background:'#444', color:'white', border:'none', padding:'8px 16px', borderRadius:'4px', cursor:'pointer'}}>
           &larr; Dashboard
        </button>
        <h2>Admin: Card Manager ({cards.length})</h2>
      </div>

      <div style={{overflowX: 'auto', borderRadius:'8px', border:'1px solid #444'}}>
        <table style={{ width: '100%', borderCollapse: 'collapse', color: 'black', background: 'white' }}>
          <thead>
            <tr style={{ background: '#dc3545', color: 'white' }}>
              <th style={{padding:'15px', textAlign:'left'}}>Card ID</th>
              <th style={{padding:'15px', textAlign:'left'}}>Balance</th>
              <th style={{padding:'15px', textAlign:'left'}}>Linked to Customer</th>
              <th style={{padding:'15px', textAlign:'center'}}>Action</th>
            </tr>
          </thead>
          <tbody>
            {cards.length === 0 ? (
                <tr><td colSpan="4" style={{padding:'20px', textAlign:'center'}}>No cards found.</td></tr>
            ) : (
                cards.map((card) => (
                  <tr key={card.id} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={{padding:'15px', fontWeight:'bold'}}>{card.id}</td>
                    
                    <td style={{padding:'15px', color: card.balance > 0 ? 'green' : 'black'}}>
                        ${card.balance?.toFixed(2) || '0.00'}
                    </td>
                    
                    {/* LINKED CUSTOMER NAME LOOKUP */}
                    <td style={{padding:'15px', color:'#333', fontSize:'14px'}}>
                        {card.customerId ? (
                            <span style={{fontWeight:'bold'}}>{customerMap[card.customerId] || "Unknown ID"}</span>
                        ) : (
                            <span style={{color:'#999', fontStyle:'italic'}}>Unlinked</span>
                        )}
                    </td>
                    
                    {/* ACTION BUTTONS (Icons) */}
                    <td style={{padding:'15px', textAlign:'center', display:'flex', gap:'10px', justifyContent:'center'}}>
                      
                      {/* Pencil (Edit) -> Goes to Card Logic page */}
                      <button 
                        onClick={() => navigate(`/card-logic/${card.id}`)}
                        title="Manage Card"
                        style={{background:'transparent', border:'1px solid #ccc', borderRadius:'4px', fontSize:'20px', cursor:'pointer', padding:'5px 10px'}}
                      >
                        ✏️
                      </button>

                      {/* Red X (Delete) */}
                      <button 
                        onClick={() => handleDelete(card.id)}
                        title="Delete Card"
                        style={{background:'transparent', border:'1px solid #ffcccc', borderRadius:'4px', fontSize:'20px', cursor:'pointer', padding:'5px 10px'}}
                      >
                        ❌
                      </button>
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