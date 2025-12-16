import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, addDoc, deleteDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../firebase';

function StaffManager() {
  const navigate = useNavigate();
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [newName, setNewName] = useState("");
  const [newPin, setNewPin] = useState("");
  const [newRole, setNewRole] = useState("cashier"); 
  
  // Edit State
  const [editingId, setEditingId] = useState(null);

  // 1. Load Staff
  const fetchStaff = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "staff"));
      const list = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setStaff(list);
    } catch (error) {
      console.error("Error fetching staff:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  // 2. Add OR Update Staff
  const handleSave = async () => {
    if (!newName || newPin.length < 4) {
      alert("Name and a 4+ digit PIN are required.");
      return;
    }

    try {
      if (editingId) {
        // Update
        await updateDoc(doc(db, "staff", editingId), {
          name: newName,
          pin: newPin,
          role: newRole
        });
        alert("Staff member updated!");
        setEditingId(null); 
      } else {
        // Create
        if (staff.some(s => s.pin === newPin)) {
          alert("This PIN is already in use.");
          return;
        }
        await addDoc(collection(db, "staff"), {
          name: newName,
          pin: newPin,
          role: newRole
        });
        alert("Staff member added!");
      }

      setNewName("");
      setNewPin("");
      setNewRole("cashier");
      fetchStaff(); 
    } catch (error) {
      console.error(error);
      alert("Error saving staff data.");
    }
  };

  // 3. Prepare Form for Editing
  const handleEditClick = (employee) => {
    setEditingId(employee.id);
    setNewName(employee.name);
    setNewPin(employee.pin);
    setNewRole(employee.role);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 4. Cancel Edit
  const handleCancelEdit = () => {
    setEditingId(null);
    setNewName("");
    setNewPin("");
    setNewRole("cashier");
  };

  // 5. Remove Staff
  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to remove ${name}?`)) {
      try {
        await deleteDoc(doc(db, "staff", id));
        fetchStaff();
      } catch (error) {
        alert("Error deleting staff.");
      }
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ padding: '20px', width: '100%', maxWidth: '900px', margin: '0 auto' }}>
      <button onClick={() => navigate('/dashboard')} style={{marginBottom:'20px', background:'transparent', color:'white', border:'1px solid #777', padding:'5px 10px', cursor:'pointer'}}>
        &larr; Back to Dashboard
      </button>

      <h2>👮 Staff Management</h2>

      {/* --- ADD / EDIT FORM --- */}
      <div style={{ background: '#333', padding: '20px', borderRadius: '10px', marginBottom: '30px' }}>
        <h3 style={{marginTop:0, color:'white'}}>
          {editingId ? `Edit Employee: ${newName}` : 'Add New Employee'}
        </h3>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center' }}>
          {/* 1. NAME */}
          <input 
            placeholder="Name (e.g. Mike)" 
            value={newName} 
            onChange={e => setNewName(e.target.value)} 
            style={{padding:'12px', flex: '1 1 200px'}} 
          />

          {/* 2. ROLE (Swapped: Now comes before PIN) */}
          <select 
            value={newRole} 
            onChange={e => setNewRole(e.target.value)} 
            style={{padding:'12px', flex: '1 1 150px', cursor:'pointer'}}
          >
            <option value="cashier">Cashier (Standard)</option>
            <option value="admin">Admin (Full Access)</option>
          </select>
          
          {/* 3. PIN (Swapped: Now comes after Role) */}
          <input 
            placeholder="PIN (e.g. 5555)" 
            type="number"
            value={newPin} 
            onChange={e => setNewPin(e.target.value)} 
            style={{padding:'12px', flex: '1 1 150px'}}
          />
          
          <button 
            onClick={handleSave} 
            style={{
              background: editingId ? '#007bff' : 'green', 
              color:'white', border:'none', borderRadius:'4px', padding:'12px 25px', 
              fontWeight:'bold', cursor:'pointer', flex: '0 0 auto'
            }}
          >
            {editingId ? "UPDATE" : "ADD"}
          </button>

          {editingId && (
            <button 
              onClick={handleCancelEdit} 
              style={{background:'#666', color:'white', border:'none', borderRadius:'4px', padding:'12px 15px', cursor:'pointer'}}
            >
              CANCEL
            </button>
          )}
        </div>
      </div>

      {/* --- STAFF LIST --- */}
      <div style={{overflowX: 'auto', borderRadius:'8px', border:'1px solid #444'}}>
        <table style={{ width: '100%', borderCollapse: 'collapse', color: 'black', background: 'white' }}>
          <thead>
            <tr style={{ background: '#007bff', color: 'white' }}>
              <th style={{padding:'15px', textAlign:'left'}}>Name</th>
              <th style={{padding:'15px', textAlign:'left'}}>Role</th>
              <th style={{padding:'15px', textAlign:'left'}}>PIN</th>
              <th style={{padding:'15px', textAlign:'center'}}>Action</th>
            </tr>
          </thead>
          <tbody>
            {staff.map((s) => (
              <tr key={s.id} style={{ borderBottom: '1px solid #ddd', background: editingId === s.id ? '#eef7ff' : 'white' }}>
                {/* Added textAlign: 'left' to these columns to align with headers */}
                <td style={{padding:'15px', textAlign: 'left', fontWeight:'bold'}}>{s.name}</td>
                <td style={{padding:'15px', textAlign: 'left'}}>
                  {s.role === 'admin' ? 
                    <span style={{background:'gold', padding:'4px 8px', borderRadius:'4px', fontSize:'12px', fontWeight:'bold'}}>ADMIN</span> 
                    : 'Cashier'}
                </td>
                <td style={{padding:'15px', textAlign: 'left', fontFamily:'monospace'}}>****</td> 
                
                {/* Action column stays centered as per header */}
                <td style={{padding:'15px', textAlign:'center', display:'flex', gap:'10px', justifyContent:'center'}}>
                   <button 
                     onClick={() => handleEditClick(s)}
                     style={{background:'#007bff', color:'white', border:'none', padding:'6px 12px', borderRadius:'4px', fontSize:'12px', cursor:'pointer'}}
                   >
                     EDIT
                   </button>
                   <button 
                     onClick={() => handleDelete(s.id, s.name)}
                     style={{background:'#dc3545', color:'white', border:'none', padding:'6px 12px', borderRadius:'4px', fontSize:'12px', cursor:'pointer'}}
                   >
                     REMOVE
                   </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default StaffManager;