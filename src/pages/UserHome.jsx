import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../config";
import { Link } from "react-router-dom";

function UserHome() {
  const { token, user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await fetch(`${API_URL}/user-dashboard/summary`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setSummary(data);
        }
      } catch (err) {
        console.error("Error fetching summary:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [token]);

  if (loading) return <div style={{ padding: "40px" }}>Loading Dashboard...</div>;

  const statCardStyle = {
    background: "#fff",
    padding: "24px",
    borderRadius: "16px",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06)",
    flex: 1,
    minWidth: "240px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    border: "1px solid #f1f5f9"
  };

  const sectionStyle = {
    background: "#fff",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
    marginBottom: "32px",
    border: "1px solid #f1f5f9"
  };

  return (
    <div style={{ padding: "32px", maxWidth: "1200px", margin: "0 auto" }}>
      {/* Stats Grid */}
      <div style={{ display: "flex", gap: "24px", flexWrap: "wrap", marginBottom: "48px" }}>
        <div style={statCardStyle}>
           <p style={{ color: "#64748b", fontSize: "13px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.025em" }}>Patients Managed</p>
           <h2 style={{ fontSize: "36px", fontWeight: "800", color: "#2563eb", margin: "12px 0" }}>{summary?.stats.patients}</h2>
           <Link to="/user/patient-details" style={{ color: "#2563eb", fontSize: "14px", textDecoration: "none", fontWeight: "600" }}>Manage Patients →</Link>
        </div>
        <div style={statCardStyle}>
           <p style={{ color: "#64748b", fontSize: "13px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.025em" }}>Total Reports</p>
           <h2 style={{ fontSize: "36px", fontWeight: "800", color: "#0f172a", margin: "12px 0" }}>{summary?.stats.reports}</h2>
           <Link to="/user/medical-report" style={{ color: "#2563eb", fontSize: "14px", textDecoration: "none", fontWeight: "600" }}>View Reports →</Link>
        </div>
        <div style={statCardStyle}>
           <p style={{ color: "#64748b", fontSize: "13px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.025em" }}>Upcoming Appointments</p>
           <h2 style={{ fontSize: "36px", fontWeight: "800", color: "#0f172a", margin: "12px 0" }}>{summary?.stats.appointments}</h2>
           <Link to="/user/appointment" style={{ color: "#2563eb", fontSize: "14px", textDecoration: "none", fontWeight: "600" }}>Schedule New →</Link>
        </div>
        <div style={statCardStyle}>
           <p style={{ color: "#64748b", fontSize: "13px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.025em" }}>Balance Due</p>
           <h2 style={{ fontSize: "36px", fontWeight: "800", color: "#dc2626", margin: "12px 0" }}>Rs. {summary?.stats.balance}</h2>
           <Link to="/user/billing" style={{ color: "#2563eb", fontSize: "14px", textDecoration: "none", fontWeight: "600" }}>Pay Invoice →</Link>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" }}>
        {/* Recent Appointments */}
        <div style={sectionStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a" }}>Upcoming Appointments</h3>
            <Link to="/user/appointment" style={{ fontSize: "13px", color: "#2563eb", textDecoration: "none" }}>View All</Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {summary?.recent_appointments.length === 0 ? (
              <p style={{ color: "#94a3b8", fontSize: "14px" }}>No upcoming appointments found.</p>
            ) : (
              summary?.recent_appointments.map(appt => (
                <div key={appt._id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", borderRadius: "8px", background: "#f8fafc" }}>
                  <div>
                    <p style={{ fontWeight: "600", color: "#1e293b", margin: 0 }}>{appt.patient_name}</p>
                    <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>{appt.time} - {appt.doctor}</p>
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: "700", color: "#2563eb", background: "#dbeafe", padding: "4px 8px", borderRadius: "4px" }}>{appt.date}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Reports */}
        <div style={sectionStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "700", color: "#0f172a" }}>Recent Lab & Clinical Reports</h3>
            <Link to="/user/medical-report" style={{ fontSize: "13px", color: "#2563eb", textDecoration: "none" }}>View All</Link>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {summary?.recent_reports.length === 0 ? (
              <p style={{ color: "#94a3b8", fontSize: "14px" }}>No recent reports found.</p>
            ) : (
              summary?.recent_reports.map(report => (
                <div key={report._id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px", borderRadius: "8px", background: "#f8fafc" }}>
                  <div>
                    <p style={{ fontWeight: "600", color: "#1e293b", margin: 0 }}>{report.test_name}</p>
                    <p style={{ fontSize: "12px", color: "#64748b", margin: 0 }}>{report.patient_name}</p>
                  </div>
                  <span style={{ 
                    fontSize: "11px", 
                    fontWeight: "700", 
                    color: report.result === "Normal" ? "#059669" : "#dc2626", 
                    background: report.result === "Normal" ? "#d1fae5" : "#fee2e2", 
                    padding: "4px 8px", 
                    borderRadius: "4px" 
                  }}>{report.result}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserHome;
