import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../config";

function Appointment() {
  const { token, logout } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newAppt, setNewAppt] = useState({
    patient_name: "",
    patient_id: "MRN-" + Math.floor(10000 + Math.random() * 90000),
    doctor: "",
    department: "General Medicine",
    date: new Date().toISOString().split('T')[0],
    time: "10:30",
    type: "Routine",
    status: "UPCOMING",
    notes: ""
  });

  const fetchAppointments = async () => {
    try {
      const response = await fetch(`${API_URL}/appointments/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setAppointments(data);
      }
    } catch (err) {
      console.error("Error fetching appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [token]);

  const handleAddAppointment = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/appointments/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newAppt),
      });

      if (response.ok) {
        alert("Appointment added successfully!");
        setShowModal(false);
        setNewAppt({
          patient_name: "",
          patient_id: "MRN-" + Math.floor(10000 + Math.random() * 90000),
          doctor: "",
          department: "General Medicine",
          date: new Date().toISOString().split('T')[0],
          time: "10:30",
          type: "Routine",
          status: "UPCOMING",
          notes: ""
        });
        fetchAppointments();
      } else {
        alert("Failed to add appointment");
      }
    } catch (err) {
      console.error(err);
      alert("Error adding appointment");
    }
  };

  const handleDownloadTrap = async (patientName, apptType) => {
    const password = prompt(`SECURITY CLEARANCE: Please enter your password to download the ${apptType} details for ${patientName}.`);
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
        a.download = `Appt_${apptType}_${patientName.replace(/ /g, "_")}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        alert("Authentication successful. Appointment detail downloaded.");
      }
    } catch (err) {
      console.error(err);
      alert("Error processing secure download.");
    }
  };

  const totalAppts = appointments.length;
  const upcoming = appointments.filter(a => a.status === "UPCOMING").length;
  const completed = appointments.filter(a => a.status === "COMPLETED").length;

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

  if (loading) return <div style={{ padding: "40px" }}>Loading appointments...</div>;

  return (
    <div style={{ padding: "24px" }}>
      <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "700", color: "#1e293b", margin: 0 }}>Appointment</h1>
          <p style={{ color: "#64748b", margin: "4px 0 0 0" }}>User Portal / Appointment</p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
           <button 
             onClick={() => setShowModal(true)}
             style={{ background: "#10b981", color: "#fff", padding: "8px 16px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "12px", fontWeight: "600" }}>
             + Add Appointment
           </button>
           <button 
             onClick={() => handleDownloadTrap("All", "Consolidated_Appts")}
             style={{ background: "#1e293b", color: "#fff", padding: "8px 16px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "12px" }}>
             Download
           </button>
        </div>
      </div>

      {/* Stats Section */}
      <div style={{ display: "flex", gap: "20px", flexWrap: "wrap", marginBottom: "32px" }}>
        <div style={statCardStyle}>
           <p style={labelStyle}>TOTAL APPOINTMENTS</p>
           <p style={valueStyle}>{totalAppts}</p>
        </div>
        <div style={statCardStyle}>
           <p style={labelStyle}>UPCOMING</p>
           <p style={{ ...valueStyle, color: "#10b981" }}>{upcoming}</p>
           <p style={{ fontSize: "11px", color: "#10b981", marginTop: "4px" }}>This month</p>
        </div>
        <div style={statCardStyle}>
           <p style={labelStyle}>COMPLETED</p>
           <p style={{ ...valueStyle, color: "#64748b" }}>{completed}</p>
           <p style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>Past</p>
        </div>
      </div>

      {/* Doctor Appointments Table */}
      <div style={{ background: "#fff", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)", overflow: "hidden" }}>
        <div style={{ padding: "20px", borderBottom: "1px solid #f1f5f9" }}>
          <h3 style={{ fontSize: "18px", fontWeight: "600", margin: 0 }}>// Doctor Appointments</h3>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f8fafc", textAlign: "left", fontSize: "11px", color: "#64748b", textTransform: "uppercase" }}>
              <th style={{ padding: "12px 20px" }}>Patient Name</th>
              <th style={{ padding: "12px 20px" }}>Doctor</th>
              <th style={{ padding: "12px 20px" }}>Department</th>
              <th style={{ padding: "12px 20px" }}>Date</th>
              <th style={{ padding: "12px 20px" }}>Time</th>
              <th style={{ padding: "12px 20px" }}>Type</th>
              <th style={{ padding: "12px 20px" }}>Status</th>
              <th style={{ padding: "12px 20px" }}>Download</th>
            </tr>
          </thead>
          <tbody style={{ fontSize: "13px" }}>
            {appointments.length === 0 ? (
               <tr><td colSpan="8" style={{ padding: "24px", textAlign: "center", color: "#64748b" }}>No appointments scheduled.</td></tr>
            ) : (
              appointments.map(a => (
                <tr key={a._id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                  <td style={{ padding: "16px 20px" }}>
                    <div style={{ fontWeight: "600", color: "#1e293b" }}>{a.patient_name}</div>
                    <div style={{ fontSize: "11px", color: "#2563eb" }}>{a.patient_id}</div>
                  </td>
                  <td style={{ padding: "16px 20px", color: "#1e293b" }}>{a.doctor}</td>
                  <td style={{ padding: "16px 20px", color: "#64748b" }}>{a.department}</td>
                  <td style={{ padding: "16px 20px", color: "#1e293b" }}>{a.date}</td>
                  <td style={{ padding: "16px 20px", color: "#1e293b" }}>{a.time}</td>
                  <td style={{ padding: "16px 20px", color: "#64748b" }}>{a.type}</td>
                  <td style={{ padding: "16px 20px" }}>
                    <span style={{ 
                      padding: "4px 8px", 
                      borderRadius: "4px", 
                      fontSize: "10px", 
                      fontWeight: "700",
                      background: a.status === "UPCOMING" ? "#ecfdf5" : "#f1f5f9",
                      color: a.status === "UPCOMING" ? "#059669" : "#64748b"
                    }}>
                      {a.status}
                    </span>
                  </td>
                  <td style={{ padding: "16px 20px" }}>
                    <button 
                      onClick={() => handleDownloadTrap(a.patient_name, a.type)}
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

      {/* Add Appointment Modal */}
      {showModal && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2000 }}>
          <div style={{ background: "#fff", borderRadius: "12px", padding: "24px", width: "450px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <h2 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "20px" }}>Add Appointment</h2>
            <form onSubmit={handleAddAppointment}>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Patient Name</label>
                <input style={inputStyle} value={newAppt.patient_name} onChange={e => setNewAppt({...newAppt, patient_name: e.target.value})} required />
              </div>
              <div style={formGroupStyle}>
                <label style={labelStyle}>Doctor</label>
                <input style={inputStyle} value={newAppt.doctor} onChange={e => setNewAppt({...newAppt, doctor: e.target.value})} required />
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                 <div style={{ ...formGroupStyle, flex: 1 }}>
                    <label style={labelStyle}>Department</label>
                    <select style={inputStyle} value={newAppt.department} onChange={e => setNewAppt({...newAppt, department: e.target.value})}>
                       <option>General Medicine</option><option>Cardiology</option><option>Radiology</option><option>Orthopedics</option><option>Neurology</option>
                    </select>
                 </div>
                 <div style={{ ...formGroupStyle, flex: 1 }}>
                    <label style={labelStyle}>Type</label>
                    <select style={inputStyle} value={newAppt.type} onChange={e => setNewAppt({...newAppt, type: e.target.value})}>
                       <option>Routine</option><option>Follow-up</option><option>X-Ray</option><option>Emergency</option>
                    </select>
                 </div>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                 <div style={{ ...formGroupStyle, flex: 1 }}>
                    <label style={labelStyle}>Date</label>
                    <input type="date" style={inputStyle} value={newAppt.date} onChange={e => setNewAppt({...newAppt, date: e.target.value})} />
                 </div>
                 <div style={{ ...formGroupStyle, flex: 1 }}>
                    <label style={labelStyle}>Time</label>
                    <input type="time" style={inputStyle} value={newAppt.time} onChange={e => setNewAppt({...newAppt, time: e.target.value})} />
                 </div>
              </div>
              
              <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "#fff", cursor: "pointer" }}>Cancel</button>
                <button type="submit" style={{ flex: 1, padding: "10px", borderRadius: "6px", border: "none", background: "#10b981", color: "#fff", fontWeight: "600", cursor: "pointer" }}>Schedule</button>
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

export default Appointment;
