import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../config";

function UserBilling() {
  const { token, logout } = useAuth();
  const [bills, setBills] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newBill, setNewBill] = useState({
    patient: "",
    mrn: "",
    invoice: "INV-2024-" + Math.floor(1000 + Math.random() * 9000),
    amount: "",
    services: "",
    date: new Date().toISOString().split('T')[0],
    status: "PENDING"
  });

  const fetchBills = async () => {
    try {
      const response = await fetch(`${API_URL}/bills/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setBills(data);
      }
    } catch (err) {
      console.error("Error fetching bills:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatients = async () => {
    try {
      const response = await fetch(`${API_URL}/patients/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setPatients(data);
      }
    } catch (err) {
      console.error("Error fetching patients:", err);
    }
  };

  useEffect(() => {
    fetchBills();
    fetchPatients();
  }, [token]);

  const handleAddBill = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/bills/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newBill),
      });

      if (response.ok) {
        alert("Invoice created successfully!");
        setShowModal(false);
        setNewBill({
          patient: "",
          mrn: "",
          invoice: "INV-2024-" + Math.floor(1000 + Math.random() * 9000),
          amount: "",
          services: "",
          date: new Date().toISOString().split('T')[0],
          status: "PENDING"
        });
        fetchBills();
      } else {
        alert("Failed to add bill");
      }
    } catch (err) {
      console.error(err);
      alert("Error adding bill");
    }
  };

  const handleUpdateStatus = async (billId, newStatus) => {
    try {
      const response = await fetch(`${API_URL}/bills/${billId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchBills();
      } else {
        alert("Failed to update bill status");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating bill status");
    }
  };

  const handleDeleteBill = async (billId) => {
    if (!window.confirm("Are you sure you want to delete this bill?")) return;
    try {
      const response = await fetch(`${API_URL}/bills/${billId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchBills();
      } else {
        const error = await response.json();
        alert(error.detail || "Failed to delete bill");
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting bill");
    }
  };

  const handleDownloadTrap = async (invoiceId) => {
    const password = prompt(`SECURITY CLEARANCE: Please enter your password to authorize the download of Invoice ${invoiceId}.`);
    if (!password) return;

    try {
      const response = await fetch(`${API_URL}/phi-risks/export-download`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password }),
      });

      if (!response.ok) {
        const error = await response.json();
        alert(error.detail + "\n\nSECURITY ENFORCEMENT: Terminating session immediately.");
        logout();
      } else {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `Invoice_${invoiceId}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        alert("Authentication successful. Invoice downloaded.");
      }
    } catch (err) {
      console.error(err);
      alert("Error processing secure download.");
    }
  };

  const totalAmount = bills.reduce((sum, b) => sum + b.amount, 0);
  const amountPaid = bills.filter(b => b.status === "PAID").reduce((sum, b) => sum + b.amount, 0);
  const balanceDue = totalAmount - amountPaid;

  const statCardStyle = {
    background: "#fff",
    padding: "24px",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    flex: 1,
    minWidth: "250px"
  };

  if (loading) return <div style={{ padding: "40px" }}>Loading billing records...</div>;

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
           <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#1e293b", margin: 0 }}>Billing</h1>
           <p style={{ color: "#64748b", margin: "4px 0 0 0" }}>User Portal / Billing</p>
        </div>
        <button 
           onClick={() => setShowModal(true)}
           style={{ background: "#2563eb", color: "#fff", padding: "10px 20px", borderRadius: "8px", border: "none", cursor: "pointer", fontWeight: "600" }}>
           + Create New Bill
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: "32px" }}>
        <div style={statCardStyle}>
          <p style={{ color: "#64748b", fontSize: "14px", margin: "0 0 8px 0" }}>TOTAL BILL</p>
          <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#1e293b", margin: 0 }}>Rs. {totalAmount.toLocaleString()}</h2>
          <span style={{ color: "#dc2626", fontSize: "12px", fontWeight: "600" }}>Accumulated</span>
        </div>
        <div style={statCardStyle}>
          <p style={{ color: "#64748b", fontSize: "14px", margin: "0 0 8px 0" }}>AMOUNT PAID</p>
          <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#1e293b", margin: 0 }}>Rs. {amountPaid.toLocaleString()}</h2>
          <span style={{ color: "#10b981", fontSize: "12px", fontWeight: "600" }}>Verified</span>
        </div>
        <div style={statCardStyle}>
          <p style={{ color: "#64748b", fontSize: "14px", margin: "0 0 8px 0" }}>BALANCE DUE</p>
          <h2 style={{ fontSize: "28px", fontWeight: "700", color: "#1e293b", margin: 0 }}>Rs. {balanceDue.toLocaleString()}</h2>
          <span style={{ color: "#f59e0b", fontSize: "12px", fontWeight: "600" }}>Pending Settlement</span>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", overflow: "hidden" }}>
        <div style={{ padding: "20px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "600", margin: 0 }}>Billing Records</h3>
          <button 
             onClick={() => handleDownloadTrap("ALL")}
             style={{ background: "#1e293b", color: "#fff", padding: "8px 16px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "12px" }}>
             Download All
          </button>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc", textAlign: "left", fontSize: "12px", color: "#64748b", textTransform: "uppercase" }}>
              <th style={{ padding: "12px 20px" }}>Patient Name</th>
              <th style={{ padding: "12px 20px" }}>Invoice NO.</th>
              <th style={{ padding: "12px 20px" }}>Total Amount</th>
              <th style={{ padding: "12px 20px" }}>Date</th>
              <th style={{ padding: "12px 20px" }}>Status</th>
              <th style={{ padding: "12px 20px" }}>Download</th>
            </tr>
          </thead>
          <tbody style={{ fontSize: "14px" }}>
            {bills.length === 0 ? (
               <tr><td colSpan="6" style={{ padding: "24px", textAlign: "center", color: "#64748b" }}>No billing records found.</td></tr>
            ) : (
              bills.map(record => (
                <tr key={record._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "16px 20px" }}>
                    <div style={{ fontWeight: "600", color: "#1e293b" }}>{record.patient}</div>
                    <div style={{ fontSize: "12px", color: "#2563eb" }}>{record.mrn}</div>
                  </td>
                  <td style={{ padding: "16px 20px", color: "#64748b" }}>{record.invoice}</td>
                  <td style={{ padding: "16px 20px", fontWeight: "700" }}>Rs. {record.amount.toLocaleString()}</td>
                  <td style={{ padding: "16px 20px", color: "#64748b" }}>{record.date}</td>
                  <td style={{ padding: "16px 20px" }}>
                    <span style={{ 
                      padding: "4px 8px", 
                      borderRadius: "4px", 
                      fontSize: "11px", 
                      fontWeight: "700",
                      background: record.status === "PAID" ? "#dcfce7" : "#fef3c7",
                      color: record.status === "PAID" ? "#166534" : "#92400e"
                    }}>
                      {record.status}
                    </span>
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      {record.status === "PENDING" && (
                        <button 
                          onClick={() => handleUpdateStatus(record._id, "PAID")}
                          style={{ background: "#10b981", color: "#fff", border: "none", padding: "6px 12px", borderRadius: "4px", fontSize: "11px", cursor: "pointer", fontWeight: "600" }}>
                          Pay Now
                        </button>
                      )}
                      <button 
                        onClick={() => handleDownloadTrap(record.invoice)}
                        style={{ background: "transparent", border: "1px solid #cbd5e1", padding: "6px 12px", borderRadius: "4px", fontSize: "11px", cursor: "pointer", color: "#64748b" }}>
                        PDF
                      </button>
                      <button 
                        onClick={() => handleDeleteBill(record._id)}
                        style={{ background: "#fee2e2", color: "#dc2626", border: "none", padding: "6px 12px", borderRadius: "4px", fontSize: "11px", cursor: "pointer", fontWeight: "600" }}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Bill Modal */}
      {showModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }}>
          <div style={{ background: "#fff", borderRadius: "12px", padding: "24px", width: "450px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "20px" }}>Create New Bill</h2>
            <form onSubmit={handleAddBill}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Patient Name</label>
                <select 
                  style={inputStyle} 
                  value={newBill.patient} 
                  onChange={e => {
                    const p = patients.find(p => p.name === e.target.value);
                    setNewBill({
                      ...newBill, 
                      patient: e.target.value,
                      mrn: p ? p.mrn : ""
                    })
                  }} 
                  required
                >
                  <option value="">Select Patient</option>
                  {patients.map(p => (
                    <option key={p._id} value={p.name}>{p.name} ({p.mrn})</option>
                  ))}
                </select>
              </div>
              <div style={formGroupStyle}>
                <label style={labelStyle}>MRN (Auto-filled)</label>
                <input style={{ ...inputStyle, background: "#f8fafc" }} value={newBill.mrn} readOnly />
              </div>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Amount (Rs.)</label>
                <input type="number" style={inputStyle} value={newBill.amount} onChange={e => setNewBill({...newBill, amount: e.target.value})} placeholder="Enter amount" required />
              </div>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Services / Description</label>
                <textarea style={{ ...inputStyle, minHeight: "80px" }} value={newBill.services} onChange={e => setNewBill({...newBill, services: e.target.value})} placeholder="e.g. Consult, CBC Test..." />
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                 <div style={{ ...formGroupStyle, flex: 1 }}>
                    <label style={labelStyle}>Date</label>
                    <input type="date" style={inputStyle} value={newBill.date} onChange={e => setNewBill({...newBill, date: e.target.value})} />
                 </div>
                 <div style={{ ...formGroupStyle, flex: 1 }}>
                    <label style={labelStyle}>Status</label>
                    <select style={inputStyle} value={newBill.status} onChange={e => setNewBill({...newBill, status: e.target.value})}>
                       <option>PENDING</option>
                       <option>PAID</option>
                    </select>
                 </div>
              </div>
              
              <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer" }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "none", background: "#2563eb", color: "#fff", fontWeight: "600", cursor: "pointer" }}>Create Invoice</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const formGroupStyle = { marginBottom: "16px" };
const labelStyle = { color: "#64748b", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", marginBottom: "4px", display: "block" };
const inputStyle = { width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db", boxSizing: "border-box", outline: "none", fontSize: "14px" };

export default UserBilling;
