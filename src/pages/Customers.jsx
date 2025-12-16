import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, doc, deleteDoc, updateDoc, query, where, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { db } from '../firebase';

function Customers() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: 'lastName', direction: 'asc' });

  // EDITING STATE
  const [editingId, setEditingId] = useState(null);
  const [linkedCards, setLinkedCards] = useState([]); 
  const [editForm, setEditForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    address: '', city: '', state: '', zip: '', notes: '', newsletter: false
  });

  // NEW CARD STATE (For adding directly from this screen)
  const [newCardId, setNewCardId] = useState("");
  const [newCardPin, setNewCardPin] = useState("");

  // 1. Load All Customers
  const fetchCustomers = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "customers"));
      const list = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdDate: doc.data().created ? doc.data().created.toDate() : new Date(0)
      }));
      setCustomers(list);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // 2. Fetch Cards for specific customer
  const fetchLinkedCards = async (customerId) => {
    try {
        const q = query(collection(db, "cards"), where("customerId", "==", customerId));
        const querySnapshot = await getDocs(q);
        const cards = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setLinkedCards(cards);
    } catch (error) {
        console.error("Error fetching cards:", error);
    }
  };

  // 3. Sorting Logic
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') direction = 'desc';
    setSortConfig({ key, direction });
  };

  // 4. Filter Logic
  const processedData = useMemo(() => {
    let data = [...customers];
    if (startDate) {
      const start = new Date(startDate + 'T00:00:00');
      data = data.filter(c => c.createdDate >= start);
    }
    if (endDate) {
      const end = new Date(endDate + 'T23:59:59');
      data = data.filter(c => c.createdDate <= end);
    }
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      data = data.filter(c => 
        (c.firstName && c.firstName.toLowerCase().includes(lowerTerm)) ||
        (c.lastName && c.lastName.toLowerCase().includes(lowerTerm)) ||
        (c.email && c.email.toLowerCase().includes(lowerTerm)) ||
        (c.phone && c.phone.includes(searchTerm))
      );
    }
    if (sortConfig.key) {
      data.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return data;
  }, [customers, searchTerm, sortConfig, startDate, endDate]);

  // --- DELETE CUSTOMER ---
  const handleDelete = async (id, name) => {
    if (window.confirm(`⚠️ Delete customer: ${name}?\n\nNote: Any cards linked to this customer will stay in the system but will become "Unlinked".`)) {
      try {
        await deleteDoc(doc(db, "customers", id));
        setCustomers(prev => prev.filter(c => c.id !== id));
      } catch (error) {
        alert("Error deleting customer.");
      }
    }
  };

  // --- EDIT FUNCTIONS ---
  const handleEditClick = (customer) => {
    setEditingId(customer.id);
    setEditForm({
      firstName: customer.firstName || '',
      lastName: customer.lastName || '',
      email: customer.email || '',
      phone: customer.phone || '',
      address: customer.address || '',
      city: customer.city || '',
      state: customer.state || '',
      zip: customer.zip || '',
      notes: customer.notes || '',
      newsletter: customer.newsletter || false
    });
    // Reset new card inputs
    setNewCardId("");
    setNewCardPin("");
    // Load their cards
    fetchLinkedCards(customer.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdate = async () => {
    if (!editForm.firstName || !editForm.lastName) {
      alert("First and Last Name are required.");
      return;
    }
    try {
      await updateDoc(doc(db, "customers", editingId), editForm);
      alert("Customer updated!");
      setEditingId(null);
      setLinkedCards([]);
      fetchCustomers(); 
    } catch (error) {
      console.error(error);
      alert("Error updating customer.");
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setLinkedCards([]);
  };

  // --- ADD NEW CARD DIRECTLY ---
  const handleAddCard = async () => {
    if (!newCardId || newCardPin.length !== 4) {
        alert("Please enter a Card ID and a 4-digit PIN.");
        return;
    }

    try {
        // 1. Check if card already exists
        const cardRef = doc(db, "cards", newCardId);
        const cardSnap = await getDoc(cardRef);

        if (cardSnap.exists()) {
            alert("⚠️ Error: This Card ID is already registered in the system!");
            return;
        }

        // 2. Create the card linked to THIS customer
        await setDoc(cardRef, {
            cardId: newCardId,
            pin: newCardPin,
            balance: 0.00,
            customerId: editingId, // Link to the customer being edited
            created: Timestamp.now()
        });

        // 3. Refresh list and clear inputs
        alert("✅ Card Added Successfully!");
        setNewCardId("");
        setNewCardPin("");
        fetchLinkedCards(editingId); // Refresh the table
    } catch (error) {
        console.error(error);
        alert("Error creating card.");
    }
  };

  const handlePhone = (e) => {
    let raw = e.target.value.replace(/\D/g, '');
    if (raw.length > 10) raw = raw.substring(0, 10);
    let formatted = raw.length > 6 ? `(${raw.substring(0,3)}) ${raw.substring(3,6)}-${raw.substring(6)}` : raw;
    setEditForm({ ...editForm, phone: formatted });
  };

  if (loading) return <div style={{padding:'20px'}}>Loading Directory...</div>;

  return (
    <div style={{ padding: '20px', width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
      
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
        <button onClick={() => navigate('/dashboard')} style={{background:'#444', color:'white', border:'none', padding:'8px 16px', borderRadius:'4px', cursor:'pointer'}}>
           &larr; Dashboard
        </button>
        <h2>Customer Directory ({processedData.length})</h2>
      </div>

      {/* --- EDIT FORM --- */}
      {editingId && (
        <div style={{background:'#f0f0f0', color:'black', padding:'20px', borderRadius:'8px', marginBottom:'20px', border:'2px solid #007bff'}}>
          <h3 style={{marginTop:0}}>✏️ Edit Customer</h3>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px'}}>
            <input placeholder="First Name" value={editForm.firstName} onChange={e => setEditForm({...editForm, firstName: e.target.value})} style={inputStyle} />
            <input placeholder="Last Name" value={editForm.lastName} onChange={e => setEditForm({...editForm, lastName: e.target.value})} style={inputStyle} />
            <input placeholder="Phone" value={editForm.phone} onChange={handlePhone} style={inputStyle} />
            <input placeholder="Email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} style={inputStyle} />
            <input placeholder="Address" value={editForm.address} onChange={e => setEditForm({...editForm, address: e.target.value})} style={inputStyle} />
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'5px'}}>
               <input placeholder="City" value={editForm.city} onChange={e => setEditForm({...editForm, city: e.target.value})} style={inputStyle} />
               <input placeholder="State" value={editForm.state} onChange={e => setEditForm({...editForm, state: e.target.value})} style={inputStyle} />
               <input placeholder="Zip" value={editForm.zip} onChange={e => setEditForm({...editForm, zip: e.target.value})} style={inputStyle} />
            </div>
          </div>
          <textarea placeholder="Notes" value={editForm.notes} onChange={e => setEditForm({...editForm, notes: e.target.value})} style={{...inputStyle, width:'97%', marginTop:'10px', height:'60px'}} />
          
          <div style={{marginTop:'10px', display:'flex', gap:'10px'}}>
             <label style={{display:'flex', alignItems:'center', gap:'5px', cursor:'pointer'}}>
                <input type="checkbox" checked={editForm.newsletter} onChange={e => setEditForm({...editForm, newsletter: e.target.checked})} />
                Opt-in Newsletter
             </label>
          </div>

          {/* --- LINKED CARDS TABLE --- */}
          <div style={{marginTop:'20px', borderTop:'1px solid #ccc', paddingTop:'10px'}}>
             <h4 style={{margin:'0 0 10px 0'}}>💳 Linked Gift Cards</h4>
             
             {/* LIST OF CARDS */}
             {linkedCards.length === 0 ? (
                 <p style={{fontStyle:'italic', color:'#666', fontSize:'13px'}}>No cards linked yet.</p>
             ) : (
                 <table style={{width:'100%', borderCollapse:'collapse', background:'white', marginBottom:'15px'}}>
                    <thead>
                        <tr style={{background:'#ddd'}}>
                            <th style={{padding:'8px', textAlign:'left'}}>Card ID</th>
                            <th style={{padding:'8px', textAlign:'left'}}>Balance</th>
                            <th style={{padding:'8px', textAlign:'center'}}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {linkedCards.map(c => (
                            <tr key={c.id} style={{borderBottom:'1px solid #eee'}}>
                                <td style={{padding:'8px', fontWeight:'bold'}}>{c.id}</td>
                                <td style={{padding:'8px', color: c.balance > 0 ? 'green' : 'black'}}>${c.balance.toFixed(2)}</td>
                                <td style={{padding:'8px', textAlign:'center'}}>
                                    <button 
                                        onClick={() => navigate(`/card-logic/${c.id}`)}
                                        style={{background:'#28a745', color:'white', border:'none', padding:'4px 8px', borderRadius:'3px', cursor:'pointer', fontSize:'12px'}}
                                    >
                                        VIEW
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                 </table>
             )}

             {/* ADD NEW CARD SECTION */}
             <div style={{background:'#e9ecef', padding:'10px', borderRadius:'5px', display:'flex', gap:'10px', alignItems:'center', flexWrap:'wrap'}}>
                <span style={{fontWeight:'bold', fontSize:'14px'}}>+ Link New Card:</span>
                <input 
                  placeholder="Scan/Type Card ID" 
                  value={newCardId} 
                  onChange={e => setNewCardId(e.target.value)}
                  // Press Enter to Submit
                  onKeyDown={e => e.key === 'Enter' && handleAddCard()}
                  style={{...inputStyle, width:'140px', textTransform:'uppercase'}} 
                />
                <input 
                  type="number" 
                  placeholder="Set PIN" 
                  value={newCardPin} 
                  onChange={e => setNewCardPin(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddCard()} 
                  style={{...inputStyle, width:'80px'}} 
                />
                <button 
                  onClick={handleAddCard}
                  style={{background:'#28a745', color:'white', border:'none', padding:'8px 16px', borderRadius:'4px', cursor:'pointer', fontWeight:'bold'}}
                >
                  ADD
                </button>
             </div>

          </div>

          <div style={{marginTop:'20px', display:'flex', gap:'10px'}}>
            <button onClick={handleUpdate} style={{background:'#007bff', color:'white', border:'none', padding:'10px 20px', borderRadius:'4px', cursor:'pointer'}}>SAVE CHANGES</button>
            <button onClick={handleCancelEdit} style={{background:'#666', color:'white', border:'none', padding:'10px 20px', borderRadius:'4px', cursor:'pointer'}}>CANCEL</button>
          </div>
        </div>
      )}

      {/* --- FILTER BAR (Hidden when editing) --- */}
      {!editingId && (
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '20px', background: '#333', padding: '15px', borderRadius: '8px', alignItems:'flex-end' }}>
          <div style={{flex: 1, minWidth: '200px'}}>
            <label style={{display:'block', marginBottom:'5px', color:'#ccc', fontSize:'12px'}}>Search</label>
            <input type="text" placeholder="🔍 Name, Phone, Email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{width: '95%', padding: '10px'}} />
          </div>
          <div style={{display:'flex', alignItems:'center', gap:'10px', color:'white'}}>
            <div>
              <label style={{display:'block', marginBottom:'5px', color:'#ccc', fontSize:'12px'}}>From Date</label>
              <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} style={dateInputStyle} onClick={(e) => e.target.showPicker && e.target.showPicker()} />
            </div>
            <span style={{alignSelf:'center', paddingTop:'15px'}}>&rarr;</span>
            <div>
              <label style={{display:'block', marginBottom:'5px', color:'#ccc', fontSize:'12px'}}>To Date</label>
              <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} style={dateInputStyle} onClick={(e) => e.target.showPicker && e.target.showPicker()} />
            </div>
          </div>
          <div style={{paddingBottom:'2px'}}>
              <button onClick={() => {setSearchTerm(''); setStartDate(''); setEndDate('');}} style={{background:'#d9534f', color:'white', border:'none', padding:'10px 20px', borderRadius:'4px', height:'42px', cursor:'pointer'}}>Clear</button>
          </div>
        </div>
      )}

      {/* --- TABLE --- */}
      <div style={{overflowX: 'auto', borderRadius:'8px', border:'1px solid #444'}}>
        <table style={{ width: '100%', borderCollapse: 'collapse', color: 'black', background: 'white' }}>
          <thead>
            <tr style={{ background: '#007bff', color: 'white' }}>
              <th onClick={() => requestSort('firstName')} style={thStyle}>First Name ⇅</th>
              <th onClick={() => requestSort('lastName')} style={thStyle}>Last Name ⇅</th>
              <th onClick={() => requestSort('phone')} style={thStyle}>Phone</th>
              <th onClick={() => requestSort('email')} style={thStyle}>Email</th>
              <th onClick={() => requestSort('createdDate')} style={thStyle}>Joined ⇅</th>
              <th style={{padding:'12px', textAlign:'center'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {processedData.length === 0 ? (
                <tr><td colSpan="6" style={{padding:'20px', textAlign:'center'}}>No customers found.</td></tr>
            ) : (
                processedData.map((customer) => (
                  <tr key={customer.id} style={{ borderBottom: '1px solid #ddd', background: editingId === customer.id ? '#eef7ff' : 'white' }}>
                    <td style={tdStyle}>{customer.firstName}</td>
                    <td style={tdStyle}>{customer.lastName}</td>
                    <td style={tdStyle}>{customer.phone}</td>
                    <td style={tdStyle}>{customer.email}</td>
                    <td style={tdStyle}>{customer.createdDate.toLocaleDateString()}</td>
                    <td style={{padding:'10px', textAlign:'center', display:'flex', gap:'5px', justifyContent:'center'}}>
                      <button 
                        onClick={() => handleEditClick(customer)}
                        title="Edit Customer"
                        style={{background:'transparent', border:'1px solid #ccc', borderRadius:'4px', fontSize:'20px', cursor:'pointer', padding:'5px'}}
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => handleDelete(customer.id, customer.firstName)}
                        title="Delete Customer"
                        style={{background:'transparent', border:'1px solid #ffcccc', borderRadius:'4px', fontSize:'20px', cursor:'pointer', padding:'5px'}}
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

// Styles
const thStyle = { padding: '12px', textAlign: 'left', cursor: 'pointer', userSelect: 'none' };
const tdStyle = { padding: '10px' };
const dateInputStyle = { padding: '10px', cursor: 'pointer', colorScheme: 'light' };
const inputStyle = { padding: '8px', fontSize: '14px', border: '1px solid #ccc', borderRadius: '4px' };

export default Customers;