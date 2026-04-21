import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../config";

function MedicalReport() {
  const { token, logout } = useAuth();
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newReport, setNewReport] = useState({
    patient_name: "",
    patient_id: "MRN-" + Math.floor(10000 + Math.random() * 90000),
    mobile: "",
    test_name: "",
    result: "Normal",
    date: new Date().toISOString().split('T')[0],
    doctor: ""
  });

  const fetchReports = async () => {
    try {
      const response = await fetch(`${API_URL}/reports/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setReports(data);
      }
    } catch (err) {
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [token]);

  const handleAddReport = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/reports/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newReport),
      });

      if (response.ok) {
        alert("Medical report added successfully!");
        setShowModal(false);
        setNewReport({
          patient_name: "",
          patient_id: "MRN-" + Math.floor(10000 + Math.random() * 90000),
          mobile: "",
          test_name: "",
          result: "Normal",
          date: new Date().toISOString().split('T')[0],
          doctor: ""
        });
        fetchReports();
      } else {
        alert("Failed to add report");
      }
    } catch (err) {
      console.error(err);
      alert("Error adding report");
    }
  };

  const handleDownloadTrap = async (patientName, testName) => {
    const password = prompt(`SECURITY CLEARANCE: Please enter your password to download the ${testName} for ${patientName}.`);
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
        a.download = `${testName.replace(/ /g, "_")}_${patientName.replace(/ /g, "_")}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        alert("Authentication successful. Report downloaded.");
      }
    } catch (err) {
      console.error(err);
      alert("Error processing secure download.");
    }
  };

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

  const totalTests = reports.length;
  const abnormal = reports.filter(r => r.result === "Abnormal").length;
  const normal = reports.filter(r => r.result === "Normal").length;

  if (loading) return <div style={{ padding: "40px" }}>Loading medical reports...</div>;

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#1e293b", margin: 0 }}>Medical Report</h1>
          <p style={{ color: "#64748b", margin: "4px 0 0 0" }}>User Portal / Medical Report</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
           <button 
             onClick={() => setShowModal(true)}
             style={{ background: "#2563eb", color: "#fff", padding: "8px 16px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}>
             + Add Report Detail
           </button>
           <button 
             onClick={() => handleDownloadTrap("All", "Consolidated_Reports")}
             style={{ background: "#1e293b", color: "#fff", padding: "8px 16px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "12px" }}>
             Download All
           </button>
        </div>
      </div>

      {/* Stats Section */}
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: "32px" }}>
        <div style={statCardStyle}>
           <p style={labelStyle}>TOTAL TESTS</p>
           <p style={valueStyle}>{totalTests}</p>
        </div>
        <div style={statCardStyle}>
           <p style={labelStyle}>ABNORMAL</p>
           <p style={{ ...valueStyle, color: "#f59e0b" }}>{abnormal}</p>
        </div>
        <div style={statCardStyle}>
           <p style={labelStyle}>NORMAL</p>
           <p style={{ ...valueStyle, color: "#10b981" }}>{normal}</p>
        </div>
      </div>

      {/* Reports Table */}
      <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", overflow: "hidden" }}>
        <div style={{ padding: "20px", borderBottom: "1px solid #f1f5f9" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "600", margin: 0 }}>Blood Test & Clinical Reports</h3>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc", textAlign: "left", fontSize: "11px", color: "#64748b", textTransform: "uppercase" }}>
              <th style={{ padding: "12px 20px" }}>Patient Name</th>
              <th style={{ padding: "12px 20px" }}>Test Name</th>
              <th style={{ padding: "12px 20px" }}>Result</th>
              <th style={{ padding: "12px 20px" }}>Date</th>
              <th style={{ padding: "12px 20px" }}>Doctor</th>
              <th style={{ padding: "12px 20px" }}>Download</th>
            </tr>
          </thead>
          <tbody style={{ fontSize: "13px" }}>
            {reports.length === 0 ? (
               <tr><td colSpan="6" style={{ padding: "24px", textAlign: "center", color: "#64748b" }}>No medical reports available.</td></tr>
            ) : (
              reports.map(r => (
                <tr key={r._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "16px 20px" }}>
                    <div style={{ fontWeight: "600", color: "#1e293b" }}>{r.patient_name}</div>
                    <div style={{ fontSize: "11px", color: "#2563eb" }}>{r.patient_id}</div>
                  </td>
                  <td style={{ padding: "16px 20px", color: "#1e293b", fontWeight: "500" }}>{r.test_name}</td>
                  <td style={{ padding: "16px 20px" }}>
                    <span style={{ 
                      padding: "4px 8px", 
                      borderRadius: "4px", 
                      fontSize: "10px", 
                      fontWeight: "700",
                      background: r.result === "Normal" ? "#dcfce7" : r.result === "Abnormal" ? "#fee2e2" : "#f1f5f9",
                      color: r.result === "Normal" ? "#166534" : r.result === "Abnormal" ? "#991b1b" : "#64748b"
                    }}>
                      {r.result.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: "16px 20px", color: "#64748b" }}>{r.date}</td>
                  <td style={{ padding: "16px 20px", color: "#1e293b" }}>{r.doctor}</td>
                  <td style={{ padding: "16px 20px" }}>
                    <button 
                      onClick={() => handleDownloadTrap(r.patient_name, r.test_name)}
                      style={{ background: "transparent", border: "1px solid #cbd5e1", padding: "6px 12px", borderRadius: "4px", fontSize: "11px", cursor: "pointer", color: "#64748b" }}>
                      PDF
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Report Modal */}
      {showModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }}>
          <div style={{ background: "#fff", borderRadius: "12px", padding: "24px", width: "450px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "20px" }}>Add Medical Report Detail</h2>
            <form onSubmit={handleAddReport}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Patient Name</label>
                <input style={inputStyle} value={newReport.patient_name} onChange={e => setNewReport({...newReport, patient_name: e.target.value})} required placeholder="e.g. Priya Sharma" />
              </div>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Mobile Number</label>
                <input style={inputStyle} value={newReport.mobile} onChange={e => setNewReport({...newReport, mobile: e.target.value})} required placeholder="e.g. +91 98765 43210" />
              </div>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Test Name</label>
                <input style={inputStyle} value={newReport.test_name} onChange={e => setNewReport({...newReport, test_name: e.target.value})} required placeholder="e.g. Complete Blood Count (CBC)" />
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                 <div style={{ ...formGroupStyle, flex: 1 }}>
                    <label style={labelStyle}>Result</label>
                    <select style={inputStyle} value={newReport.result} onChange={e => setNewReport({...newReport, result: e.target.value})}>
                       <option>Normal</option><option>Abnormal</option><option>Negative</option>
                    </select>
                 </div>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                 <div style={{ ...formGroupStyle, flex: 1 }}>
                    <label style={labelStyle}>Date</label>
                    <input type="date" style={inputStyle} value={newReport.date} onChange={e => setNewReport({...newReport, date: e.target.value})} />
                 </div>
                 <div style={{ ...formGroupStyle, flex: 1 }}>
                    <label style={labelStyle}>Doctor</label>
                    <input style={inputStyle} value={newReport.doctor} onChange={e => setNewReport({...newReport, doctor: e.target.value})} placeholder="e.g. Dr. Sharma" />
                 </div>
              </div>
              
              <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer" }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "none", background: "#2563eb", color: "#fff", fontWeight: "600", cursor: "pointer" }}>Save Report</button>
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

export default MedicalReport;
