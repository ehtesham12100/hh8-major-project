import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../config";

function LabResults() {
  const { token, logout } = useAuth();
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newLab, setNewLab] = useState({
    patient_name: "",
    mrn_no: "MRN-" + Math.floor(10000 + Math.random() * 90000),
    mobile: "",
    email: "",
    test_name: "",
    lab_id: "LAB-2024-" + Math.floor(100 + Math.random() * 900),
    result: "NORMAL",
    date: new Date().toISOString().split('T')[0],
    technician: ""
  });

  const fetchLabs = async () => {
    try {
      const response = await fetch(`${API_URL}/labs/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setLabs(data);
      }
    } catch (err) {
      console.error("Error fetching labs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabs();
  }, [token]);

  const handleAddLab = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/labs/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newLab),
      });

      if (response.ok) {
        alert("Lab result added successfully!");
        setShowModal(false);
        setNewLab({
          patient_name: "",
          mrn_no: "MRN-" + Math.floor(10000 + Math.random() * 90000),
          mobile: "",
          email: "",
          test_name: "",
          lab_id: "LAB-2024-" + Math.floor(100 + Math.random() * 900),
          result: "NORMAL",
          date: new Date().toISOString().split('T')[0],
          technician: ""
        });
        fetchLabs();
      } else {
        alert("Failed to add lab result");
      }
    } catch (err) {
      console.error(err);
      alert("Error adding lab result");
    }
  };

  const handleDownloadTrap = async (patientName, testName) => {
    const password = prompt(`SECURITY CLEARANCE: Please enter your password to download the ${testName} result for ${patientName}.`);
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
        a.download = `LabResult_${testName.replace(/ /g, "_")}_${patientName.replace(/ /g, "_")}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        alert("Authentication successful. Lab report downloaded.");
      }
    } catch (err) {
      console.error(err);
      alert("Error processing secure download.");
    }
  };

  const totalTests = labs.length;
  const completed = labs.filter(l => l.result !== "PENDING").length;
  const pending = labs.filter(l => l.result === "PENDING").length;

  const statCardStyle = {
    background: "#fff",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    flex: 1,
    minWidth: "200px"
  };

  const labelStyle = { color: "#64748b", fontSize: "11px", fontWeight: "700", textTransform: "uppercase", marginBottom: "4px" };
  const valueStyle = { fontSize: "24px", fontWeight: "700", color: "#1e293b" };

  if (loading) return <div style={{ padding: "40px" }}>Loading lab results...</div>;

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#1e293b", margin: 0 }}>Lab</h1>
          <p style={{ color: "#64748b", margin: "4px 0 0 0" }}>User Portal / Lab</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
           <button 
             onClick={() => setShowModal(true)}
             style={{ background: "#2563eb", color: "#fff", padding: "8px 16px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}>
             + Add Lab Result
           </button>
           <button 
             onClick={() => handleDownloadTrap("All", "Consolidated_Lab_Results")}
             style={{ background: "#1e293b", color: "#fff", padding: "8px 16px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "12px" }}>
             Download All
           </button>
        </div>
      </div>

      {/* Stats Section */}
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: "32px" }}>
        <div style={statCardStyle}>
           <p style={labelStyle}>TOTAL LAB TESTS</p>
           <p style={valueStyle}>{totalTests}</p>
           <p style={{ fontSize: "11px", color: "#10b981", marginTop: "4px" }}>This year</p>
        </div>
        <div style={statCardStyle}>
           <p style={labelStyle}>COMPLETED</p>
           <p style={{ ...valueStyle, color: "#10b981" }}>{completed}</p>
           <p style={{ fontSize: "11px", color: "#10b981", marginTop: "4px" }}>Results ready</p>
        </div>
        <div style={statCardStyle}>
           <p style={labelStyle}>PENDING</p>
           <p style={{ ...valueStyle, color: "#f59e0b" }}>{pending}</p>
           <p style={{ fontSize: "11px", color: "#f59e0b", marginTop: "4px" }}>Processing</p>
        </div>
      </div>

      {/* Lab Results Table */}
      <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", overflow: "hidden" }}>
        <div style={{ padding: "20px", borderBottom: "1px solid #f1f5f9" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "600", margin: 0 }}>// Lab Test Results</h3>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "1000px" }}>
            <thead>
              <tr style={{ background: "#f8fafc", textAlign: "left", fontSize: "11px", color: "#64748b", textTransform: "uppercase" }}>
                <th style={{ padding: "12px 20px" }}>Patient Name</th>
                <th style={{ padding: "12px 20px" }}>Mobile</th>
                <th style={{ padding: "12px 20px" }}>Email</th>
                <th style={{ padding: "12px 20px" }}>Test Name</th>
                <th style={{ padding: "12px 20px" }}>Lab ID</th>
                <th style={{ padding: "12px 20px" }}>Result</th>
                <th style={{ padding: "12px 20px" }}>Date</th>
                <th style={{ padding: "12px 20px" }}>Technician</th>
                <th style={{ padding: "12px 20px" }}>Download</th>
              </tr>
            </thead>
            <tbody style={{ fontSize: "13px" }}>
              {labs.length === 0 ? (
                 <tr><td colSpan="9" style={{ padding: "24px", textAlign: "center", color: "#64748b" }}>No lab results available.</td></tr>
              ) : (
                labs.map(l => (
                  <tr key={l._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "16px 20px" }}>
                      <div style={{ fontWeight: "600", color: "#1e293b" }}>{l.patient_name}</div>
                      <div style={{ fontSize: "11px", color: "#2563eb" }}>{l.mrn_no}</div>
                    </td>
                    <td style={{ padding: "16px 20px", color: "#64748b" }}>{l.mobile}</td>
                    <td style={{ padding: "16px 20px", color: "#64748b" }}>{l.email}</td>
                    <td style={{ padding: "16px 20px", color: "#1e293b", fontWeight: "500" }}>{l.test_name}</td>
                    <td style={{ padding: "16px 20px", color: "#64748b" }}>{l.lab_id}</td>
                    <td style={{ padding: "16px 20px" }}>
                      <span style={{ 
                        padding: "4px 8px", 
                        borderRadius: "4px", 
                        fontSize: "10px", 
                        fontWeight: "700",
                        background: l.result === "NORMAL" ? "#dcfce7" : l.result === "ABNORMAL" || l.result === "POSITIVE" ? "#fee2e2" : "#fef3c7",
                        color: l.result === "NORMAL" ? "#166534" : l.result === "ABNORMAL" || l.result === "POSITIVE" ? "#991b1b" : "#92400e"
                      }}>
                        {l.result}
                      </span>
                    </td>
                    <td style={{ padding: "16px 20px", color: "#64748b" }}>{l.date}</td>
                    <td style={{ padding: "16px 20px", color: "#1e293b" }}>{l.technician}</td>
                    <td style={{ padding: "16px 20px" }}>
                      <button 
                        onClick={() => handleDownloadTrap(l.patient_name, l.test_name)}
                        style={{ background: "#f1f5f9", border: "1px solid #cbd5e1", padding: "6px 12px", borderRadius: "4px", fontSize: "11px", cursor: "pointer", color: "#64748b" }}>
                        PDF
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Lab Modal */}
      {showModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }}>
          <div style={{ background: "#fff", borderRadius: "12px", padding: "24px", width: "500px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "20px" }}>Add Lab Result Detail</h2>
            <form onSubmit={handleAddLab}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Patient Name</label>
                <input style={inputStyle} value={newLab.patient_name} onChange={e => setNewLab({...newLab, patient_name: e.target.value})} required placeholder="e.g. Priya Sharma" />
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                 <div style={{ ...formGroupStyle, flex: 1 }}>
                    <label style={labelStyle}>Mobile</label>
                    <input style={inputStyle} value={newLab.mobile} onChange={e => setNewLab({...newLab, mobile: e.target.value})} placeholder="+91 XXXX" />
                 </div>
                 <div style={{ ...formGroupStyle, flex: 1 }}>
                    <label style={labelStyle}>Email</label>
                    <input style={inputStyle} value={newLab.email} onChange={e => setNewLab({...newLab, email: e.target.value})} placeholder="patient@email.com" />
                 </div>
              </div>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Test Name</label>
                <input style={inputStyle} value={newLab.test_name} onChange={e => setNewLab({...newLab, test_name: e.target.value})} required />
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                 <div style={{ ...formGroupStyle, flex: 1 }}>
                    <label style={labelStyle}>Result</label>
                    <select style={inputStyle} value={newLab.result} onChange={e => setNewLab({...newLab, result: e.target.value})}>
                       <option>NORMAL</option><option>ABNORMAL</option><option>POSITIVE</option><option>PENDING</option>
                    </select>
                 </div>
                 <div style={{ ...formGroupStyle, flex: 1 }}>
                    <label style={labelStyle}>Technician</label>
                    <input style={inputStyle} value={newLab.technician} onChange={e => setNewLab({...newLab, technician: e.target.value})} />
                 </div>
              </div>
              <div style={formGroupStyle}>
                 <label style={labelStyle}>Date</label>
                 <input type="date" style={inputStyle} value={newLab.date} onChange={e => setNewLab({...newLab, date: e.target.value})} />
              </div>
              
              <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer" }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "none", background: "#2563eb", color: "#fff", fontWeight: "600", cursor: "pointer" }}>Save Result</button>
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

export default LabResults;
