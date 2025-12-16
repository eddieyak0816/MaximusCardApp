import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebase';

function Customers() {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // Sorting State
  const [sortConfig, setSortConfig] = useState({ key: 'lastName', direction: 'asc' });

  // 1. Load All Customers
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "cards"));
        const list = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Convert Firestore Timestamp to JS Date object for sorting
          createdDate: doc.data().created ? doc.data().created.toDate() : new Date(0)
        }));
        setCustomers(list);
      } catch (error) {
        console.error("Error fetching customers:", error);
      }
      setLoading(false);
    };
    fetchCustomers();
  }, []);

  // 2. Handle Sorting
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // 3. Filter & Sort Logic
  const processedData = React.useMemo(() => {
    let data = [...customers];

    // A. Date Range Filter
    if (startDate) {
      // Create date from input string (YYYY-MM-DD) in local time
      const start = new Date(startDate + 'T00:00:00');
      data = data.filter(c => c.createdDate >= start);
    }
    if (endDate) {
      const end = new Date(endDate + 'T23:59:59');
      data = data.filter(c => c.createdDate <= end);
    }

    // B. Text Search
    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      data = data.filter(c => 
        (c.firstName && c.firstName.toLowerCase().includes(lowerTerm)) ||
        (c.lastName && c.lastName.toLowerCase().includes(lowerTerm)) ||
        (c.email && c.email.toLowerCase().includes(lowerTerm)) ||
        (c.phone && c.phone.includes(searchTerm)) ||
        (c.cardId && c.cardId.toLowerCase().includes(lowerTerm))
      );
    }

    // C. Sorting
    if (sortConfig.key) {
      data.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return data;
  }, [customers, searchTerm, sortConfig, startDate, endDate]);

  if (loading) return <div style={{padding:'20px'}}>Loading Directory...</div>;

  return (
    <div style={{ padding: '20px', width: '100%', maxWidth: '1000px', margin: '0 auto' }}>
      
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
        <button onClick={() => navigate('/dashboard')} style={{background:'#444', color:'white', border:'none', padding:'8px 16px', borderRadius:'4px', cursor:'pointer'}}>
           &larr; Dashboard
        </button>
        <h2>Customer Directory ({processedData.length})</h2>
      </div>

      {/* --- CONTROLS BAR --- */}
      <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '20px', background: '#333', padding: '15px', borderRadius: '8px', alignItems:'flex-end' }}>
        
        {/* Search */}
        <div style={{flex: 1, minWidth: '200px'}}>
          <label style={{display:'block', marginBottom:'5px', color:'#ccc', fontSize:'12px'}}>Search</label>
          <input 
            type="text" 
            placeholder="🔍 Name, Phone, Email..." 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)}
            style={{width: '95%', padding: '10px'}}
          />
        </div>

        {/* Date Range - STYLED TO SHOW ICON CORRECTLY */}
        <div style={{display:'flex', alignItems:'center', gap:'10px', color:'white'}}>
          
          <div>
            <label style={{display:'block', marginBottom:'5px', color:'#ccc', fontSize:'12px'}}>From Date</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={e => setStartDate(e.target.value)} 
              style={dateInputStyle} 
              // This onClick ensures the calendar opens even if you click the text area in some browsers
              onClick={(e) => e.target.showPicker && e.target.showPicker()}
            />
          </div>

          <span style={{alignSelf:'center', paddingTop:'15px'}}>&rarr;</span>

          <div>
            <label style={{display:'block', marginBottom:'5px', color:'#ccc', fontSize:'12px'}}>To Date</label>
            <input 
              type="date" 
              value={endDate} 
              onChange={e => setEndDate(e.target.value)} 
              style={dateInputStyle}
              onClick={(e) => e.target.showPicker && e.target.showPicker()}
            />
          </div>
        </div>

        {/* Clear Button */}
        <div style={{paddingBottom:'2px'}}>
            <button 
            onClick={() => {setSearchTerm(''); setStartDate(''); setEndDate('');}}
            style={{background:'#d9534f', color:'white', border:'none', padding:'10px 20px', borderRadius:'4px', height:'42px', cursor:'pointer'}}
            >
            Clear
            </button>
        </div>
      </div>

      {/* --- TABLE --- */}
      <div style={{overflowX: 'auto', borderRadius:'8px', border:'1px solid #444'}}>
        <table style={{ width: '100%', borderCollapse: 'collapse', color: 'black', background: 'white' }}>
          <thead>
            <tr style={{ background: '#007bff', color: 'white' }}>
              <th onClick={() => requestSort('cardId')} style={thStyle}>Card ID ⇅</th>
              <th onClick={() => requestSort('firstName')} style={thStyle}>First Name ⇅</th>
              <th onClick={() => requestSort('lastName')} style={thStyle}>Last Name ⇅</th>
              <th onClick={() => requestSort('balance')} style={thStyle}>Balance ⇅</th>
              <th onClick={() => requestSort('phone')} style={thStyle}>Phone</th>
              <th onClick={() => requestSort('email')} style={thStyle}>Email</th>
              <th onClick={() => requestSort('createdDate')} style={thStyle}>Joined ⇅</th>
              <th style={thStyle}>Action</th>
            </tr>
          </thead>
          <tbody>
            {processedData.length === 0 ? (
                <tr><td colSpan="8" style={{padding:'20px', textAlign:'center'}}>No customers found matching filter.</td></tr>
            ) : (
                processedData.map((customer) => (
                  <tr key={customer.id} style={{ borderBottom: '1px solid #ddd' }}>
                    <td style={tdStyle}>{customer.cardId}</td>
                    <td style={tdStyle}>{customer.firstName}</td>
                    <td style={tdStyle}>{customer.lastName}</td>
                    <td style={{...tdStyle, fontWeight:'bold', color: customer.balance > 0 ? 'green' : 'black'}}>
                        ${customer.balance.toFixed(2)}
                    </td>
                    <td style={tdStyle}>{customer.phone}</td>
                    <td style={tdStyle}>{customer.email}</td>
                    <td style={tdStyle}>{customer.createdDate.toLocaleDateString()}</td>
                    <td style={tdStyle}>
                      <button 
                        onClick={() => navigate(`/card-logic/${customer.cardId}`)}
                        style={{background:'#28a745', color:'white', border:'none', padding:'5px 10px', borderRadius:'3px', fontSize:'12px', cursor:'pointer'}}
                      >
                        VIEW
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

// STYLES
const thStyle = { padding: '12px', textAlign: 'left', cursor: 'pointer', userSelect: 'none' };
const tdStyle = { padding: '10px' };

// This special style forces the browser's native Calendar Icon to be visible (Black)
// even though the app is in Dark Mode.
const dateInputStyle = {
    padding: '10px', 
    cursor: 'pointer',
    colorScheme: 'light' // <--- This fixes the icon color!
};

export default Customers;s