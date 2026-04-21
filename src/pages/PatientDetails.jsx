import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../config";

function PatientDetails() {
  const { token, logout } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [pendingBills, setPendingBills] = useState([]);
  
  const [newPatient, setNewPatient] = useState({
    name: "",
    mrn: "MRN-" + Math.floor(10000 + Math.random() * 90000),
    mobile: "",
    email: "",
    address: "",
    blood: "O+",
    status: "ACTIVE",
    age: "",
    gender: "Female",
    provider: "Star Health Insurance",
    policy_no: "SHI-" + Math.floor(10000 + Math.random() * 90000),
    valid_until: "31 Dec 2026"
  });

  const fetchPatients = async () => {
    try {
      const response = await fetch(`${API_URL}/patients/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setPatients(data);
        if (data.length > 0 && !selectedPatient) {
          setSelectedPatient(data[0]);
        }
      }
    } catch (err) {
      console.error("Error fetching patients:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientBills = async (patient) => {
    if (!patient) return;
    try {
      const response = await fetch(`${API_URL}/bills/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        // Check by MRN or Name (matching backend logic) - Case insensitive & Trimmed
        const pending = data.filter(b => 
          (b.mrn === patient.mrn || b.patient.trim().toLowerCase() === patient.name.trim().toLowerCase()) && 
          (b.status || "").trim().toUpperCase() === "PENDING"
        );
        setPendingBills(pending);
      }
    } catch (err) {
      console.error("Error fetching patient bills:", err);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [token]);

  useEffect(() => {
    if (selectedPatient) {
      fetchPatientBills(selectedPatient);
    }
  }, [selectedPatient]);

  const handleRegisterPatient = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/patients/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newPatient),
      });

      if (response.ok) {
        alert("Patient registered successfully!");
        setShowModal(false);
        setNewPatient({
          name: "",
          mrn: "MRN-" + Math.floor(10000 + Math.random() * 90000),
          mobile: "",
          email: "",
          address: "",
          blood: "O+",
          status: "ACTIVE",
          age: "",
          gender: "Female",
          provider: "Star Health Insurance",
          policy_no: "SHI-" + Math.floor(10000 + Math.random() * 90000),
          valid_until: "31 Dec 2026"
        });
        fetchPatients();
      } else {
        const error = await response.json();
        alert(error.detail || "Failed to register patient");
      }
    } catch (err) {
      console.error("Error registering patient:", err);
      alert("Error registering patient");
    }
  };

  const handleUpdateStatus = async (status) => {
    if (!selectedPatient) return;
    try {
      const response = await fetch(`${API_URL}/patients/${selectedPatient._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...selectedPatient, status }),
      });

      if (response.ok) {
        alert(`Patient status updated to ${status}`);
        fetchPatients();
        // Update local selected patient
        setSelectedPatient({ ...selectedPatient, status });
      } else {
        const error = await response.json();
        alert(error.detail || "Failed to update status");
      }
    } catch (err) {
      console.error("Error updating status:", err);
      alert("Error updating status");
    }
  };

  const handleDeletePatient = async (id) => {
    if (!window.confirm("Are you sure you want to delete this patient record?")) return;
    try {
      const response = await fetch(`${API_URL}/patients/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        if (selectedPatient?._id === id) setSelectedPatient(null);
        fetchPatients();
      } else {
        alert("Failed to delete patient. Admin role required.");
      }
    } catch (err) {
      console.error("Error deleting patient:", err);
    }
  };

  const handleDownloadTrap = async (patientName) => {
    const password = prompt(`SECURITY CLEARANCE: Please enter your password to download medical files for ${patientName}.`);
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
        a.download = `Patient_Report_${patientName.replace(/ /g, "_")}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        alert("Authentication successful. Patient file downloaded.");
      }
    } catch (err) {
      console.error(err);
      alert("Error processing secure download.");
    }
  };

  const infoBoxStyle = {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    flex: 1,
    minHeight: "140px"
  };

  const labelStyle = { color: "#64748b", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", marginBottom: "4px" };
  const valueStyle = { fontSize: "15px", fontWeight: "600", color: "#1e293b" };

  if (loading) return <div style={{ padding: "40px" }}>Loading patient data...</div>;

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#1e293b", margin: 0 }}>Patient Details</h1>
        <p style={{ color: "#64748b", margin: "4px 0 0 0" }}>User Portal / Patient Details</p>
      </div>

      {/* Top Patient Summary - DYNAMIC */}
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: "32px" }}>
        <div style={infoBoxStyle}>
           {selectedPatient ? (
             <>
                <div>
                  <p style={labelStyle}>BLOOD GROUP</p>
                  <p style={{ ...valueStyle, color: "#dc2626" }}>{selectedPatient.blood}</p>
                </div>
              </>
            ) : (
              <p style={{ color: "#94a3b8", fontSize: "14px" }}>Select a patient to view details</p>
            )}
        </div>

        <div style={infoBoxStyle}>
          {selectedPatient ? (
            <>
              <p style={labelStyle}>CURRENT STATUS</p>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "12px" }}>
                <span style={{ 
                  padding: "6px 12px", 
                  borderRadius: "6px", 
                  fontSize: "12px", 
                  fontWeight: "700",
                  background: selectedPatient.status === "ACTIVE" ? "#dcfce7" : selectedPatient.status === "CRITICAL" ? "#fee2e2" : "#fef3c7",
                  color: selectedPatient.status === "ACTIVE" ? "#166534" : selectedPatient.status === "CRITICAL" ? "#991b1b" : "#92400e"
                }}>
                  {selectedPatient.status}
                </span>
                <select 
                  style={{ padding: "6px", borderRadius: "6px", border: "1px solid #cbd5e1", fontSize: "11px", fontWeight: "600" }}
                  value={selectedPatient.status}
                  onChange={(e) => handleUpdateStatus(e.target.value)}
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="ADMITTED">ADMITTED</option>
                  <option value="CRITICAL">CRITICAL</option>
                  <option value="DISCHARGED">DISCHARGED</option>
                </select>
              </div>
              {pendingBills.length > 0 && (
                <div style={{ marginTop: "12px", padding: "8px", background: "#fef2f2", border: "1px solid #fee2e2", borderRadius: "6px" }}>
                  <p style={{ margin: 0, color: "#dc2626", fontSize: "11px", fontWeight: "700" }}>
                    ⚠️ CRITICAL: {pendingBills.length} PENDING BILL(S) FOUND
                  </p>
                  <div style={{ fontSize: "10px", color: "#991b1b", marginTop: "4px" }}>
                    {pendingBills.map(b => (
                      <div key={b._id}>• {b.invoice} (Rs. {b.amount})</div>
                    ))}
                  </div>
                  <p style={{ margin: "4px 0 0 0", color: "#991b1b", fontSize: "10px", borderTop: "1px solid #fecaca", paddingTop: "4px" }}>
                    Status cannot be DISCHARGED until paid.
                  </p>
                </div>
              )}
              <p style={{ fontSize: "11px", color: "#64748b", marginTop: "12px" }}>
                * Changing to <b>DISCHARGED</b> triggers a financial compliance check.
              </p>
            </>
          ) : (
            <p style={{ color: "#94a3b8", fontSize: "14px" }}>No status information available</p>
          )}
        </div>

        <div style={infoBoxStyle}>
          {selectedPatient ? (
            <>
              <p style={labelStyle}>INSURANCE PROVIDER</p>
              <p style={valueStyle}>{selectedPatient.provider}</p>
              <div style={{ marginTop: "16px", display: "flex" }}>
                <div style={{ flex: 1 }}>
                  <p style={labelStyle}>POLICY NO.</p>
                  <p style={valueStyle}>{selectedPatient.policy_no}</p>
                </div>
                <div style={{ flex: 1 }}>
                   <p style={labelStyle}>VALID UNTIL</p>
                   <p style={valueStyle}>{selectedPatient.valid_until}</p>
                </div>
              </div>
            </>
          ) : (
            <p style={{ color: "#94a3b8", fontSize: "14px" }}>No insurance information available</p>
          )}
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", overflow: "hidden" }}>
        <div style={{ padding: "20px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "600", margin: 0 }}>All Patients</h3>
          <div style={{ display: "flex", gap: "10px" }}>
             <button 
               onClick={() => setShowModal(true)}
               style={{ background: "#2563eb", color: "#fff", padding: "8px 16px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}>
               + Register New Patient
             </button>
             <button 
               onClick={() => handleDownloadTrap("All_Patients")}
               style={{ background: "#1e293b", color: "#fff", padding: "8px 16px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "12px" }}>
               Download PDF
             </button>
          </div>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc", textAlign: "left", fontSize: "11px", color: "#64748b", textTransform: "uppercase" }}>
              <th style={{ padding: "12px 20px" }}>Patient Name</th>
              <th style={{ padding: "12px 20px" }}>Contact</th>
              <th style={{ padding: "12px 20px" }}>Blood</th>
              <th style={{ padding: "12px 20px" }}>Status</th>
              <th style={{ padding: "12px 20px" }}>Action</th>
            </tr>
          </thead>
          <tbody style={{ fontSize: "13px" }}>
            {patients.length === 0 ? (
              <tr><td colSpan="5" style={{ padding: "24px", textAlign: "center", color: "#64748b" }}>No patients registered yet.</td></tr>
            ) : (
              patients.map(p => (
                <tr key={p._id} style={{ 
                  borderBottom: "1px solid #f1f5f9", 
                  cursor: "pointer", 
                  background: selectedPatient?._id === p._id ? "#f1f5f9" : "transparent" 
                }} onClick={() => setSelectedPatient(p)}>
                  <td style={{ padding: "16px 20px" }}>
                    <div style={{ fontWeight: "600", color: "#1e293b" }}>{p.name}</div>
                    <div style={{ fontSize: "11px", color: "#2563eb" }}>{p.mrn}</div>
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    <div style={{ color: "#1e293b" }}>{p.mobile}</div>
                    <div style={{ fontSize: "11px", color: "#64748b" }}>{p.email}</div>
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                     <span style={{ padding: "2px 6px", background: "#fef2f2", color: "#dc2626", borderRadius: "4px", fontWeight: "700" }}>{p.blood}</span>
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    <span style={{ 
                      padding: "4px 8px", 
                      borderRadius: "4px", 
                      fontSize: "10px", 
                      fontWeight: "700",
                      background: p.status === "ACTIVE" ? "#dcfce7" : p.status === "CRITICAL" ? "#fee2e2" : "#fef3c7",
                      color: p.status === "ACTIVE" ? "#166534" : p.status === "CRITICAL" ? "#991b1b" : "#92400e"
                    }}>
                      {p.status}
                    </span>
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDeletePatient(p._id); }}
                        style={{ background: "#fee2e2", border: "1px solid #fecaca", padding: "6px 12px", borderRadius: "4px", fontSize: "11px", cursor: "pointer", color: "#dc2626" }}>
                        Delete
                      </button>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handleDownloadTrap(p.name); }}
                        style={{ background: "transparent", border: "1px solid #cbd5e1", padding: "6px 12px", borderRadius: "4px", fontSize: "11px", cursor: "pointer", color: "#64748b" }}>
                        PDF
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Registration Modal */}
      {showModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }}>
          <div style={{ background: "#fff", borderRadius: "12px", padding: "24px", width: "500px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)", maxHeight: "90vh", overflowY: "auto" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "20px" }}>Register New Patient</h2>
            <form onSubmit={handleRegisterPatient}>
              <div style={{ display: "flex", gap: "10px" }}>
                <div style={{ ...formGroupStyle, flex: 1 }}>
                  <label style={labelStyle}>Full Name</label>
                  <input style={inputStyle} value={newPatient.name} onChange={e => setNewPatient({...newPatient, name: e.target.value})} required />
                </div>
                <div style={{ ...formGroupStyle, flex: 1 }}>
                  <label style={labelStyle}>Age</label>
                  <input style={inputStyle} value={newPatient.age} onChange={e => setNewPatient({...newPatient, age: e.target.value})} placeholder="e.g. 28" required />
                </div>
              </div>
              
              <div style={{ display: "flex", gap: "10px" }}>
                <div style={{ ...formGroupStyle, flex: 1 }}>
                  <label style={labelStyle}>Mobile Number</label>
                  <input style={inputStyle} value={newPatient.mobile} onChange={e => setNewPatient({...newPatient, mobile: e.target.value})} required />
                </div>
                <div style={{ ...formGroupStyle, flex: 1 }}>
                  <label style={labelStyle}>Gender</label>
                  <select style={inputStyle} value={newPatient.gender} onChange={e => setNewPatient({...newPatient, gender: e.target.value})}>
                     <option>Male</option><option>Female</option><option>Other</option>
                  </select>
                </div>
              </div>

              <div style={formGroupStyle}>
                <label style={labelStyle}>Email Address</label>
                <input type="email" style={inputStyle} value={newPatient.email} onChange={e => setNewPatient({...newPatient, email: e.target.value})} required />
              </div>
              
              <div style={formGroupStyle}>
                <label style={labelStyle}>Address</label>
                <input style={inputStyle} value={newPatient.address} onChange={e => setNewPatient({...newPatient, address: e.target.value})} required />
              </div>

              <div style={{ background: "#f8fafc", padding: "12px", borderRadius: "8px", marginBottom: "16px" }}>
                <p style={{ ...labelStyle, marginBottom: "12px", color: "#2563eb" }}>Insurance Details</p>
                <div style={formGroupStyle}>
                  <label style={labelStyle}>Provider</label>
                  <input style={inputStyle} value={newPatient.provider} onChange={e => setNewPatient({...newPatient, provider: e.target.value})} />
                </div>
                <div style={{ display: "flex", gap: "10px" }}>
                   <div style={{ ...formGroupStyle, flex: 1 }}>
                      <label style={labelStyle}>Policy No.</label>
                      <input style={inputStyle} value={newPatient.policy_no} onChange={e => setNewPatient({...newPatient, policy_no: e.target.value})} />
                   </div>
                   <div style={{ ...formGroupStyle, flex: 1 }}>
                      <label style={labelStyle}>Valid Until</label>
                      <input style={inputStyle} value={newPatient.valid_until} onChange={e => setNewPatient({...newPatient, valid_until: e.target.value})} />
                   </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                 <div style={{ ...formGroupStyle, flex: 1 }}>
                    <label style={labelStyle}>Blood Group</label>
                    <select style={inputStyle} value={newPatient.blood} onChange={e => setNewPatient({...newPatient, blood: e.target.value})}>
                       <option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>O+</option><option>O-</option><option>AB+</option><option>AB-</option>
                    </select>
                 </div>
                 <div style={{ ...formGroupStyle, flex: 1 }}>
                    <label style={labelStyle}>Status</label>
                    <select style={inputStyle} value={newPatient.status} onChange={e => setNewPatient({...newPatient, status: e.target.value})}>
                       <option>ACTIVE</option><option>ADMITTED</option><option>DISCHARGED</option><option>CRITICAL</option>
                    </select>
                 </div>
              </div>
              
              <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer" }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "none", background: "#2563eb", color: "#fff", fontWeight: "600", cursor: "pointer" }}>Register Patient</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const formGroupStyle = { marginBottom: "16px" };
const inputStyle = { width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db", boxSizing: "border-box", outline: "none", fontSize: "14px" };

export default PatientDetails;
