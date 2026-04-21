import React from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function UserSidebar() {
  const { logout } = useAuth();
  
  const linkStyle = ({ isActive }) => ({
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px 16px",
    margin: "4px 8px",
    borderRadius: "8px",
    textDecoration: "none",
    color: isActive ? "#ffffff" : "#cbd5e1",
    background: isActive ? "#2563eb" : "transparent",
    fontWeight: 500,
    transition: "all 0.2s ease",
  });

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "240px",
        height: "100vh",
        background: "linear-gradient(180deg, #0f172a, #020617)",
        color: "#fff",
        padding: "16px 8px",
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        zIndex: 1000,
      }}
    >
      {/* Logo */}
      <div style={{ padding: "12px 16px", marginBottom: "20px" }}>
        <div style={{ fontSize: "18px", fontWeight: "700" }}>HealthSecure</div>
        <div style={{ fontSize: "12px", color: "#94a3b8" }}>
          Patient & Staff Portal
        </div>
      </div>

      {/* User Menu */}
      <nav style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <NavLink to="/user/home" style={linkStyle}>Home</NavLink>
        <NavLink to="/user/patient-details" style={linkStyle}>Patient Details</NavLink>
        <NavLink to="/user/medical-report" style={linkStyle}>Medical Report</NavLink>
        <NavLink to="/user/lab" style={linkStyle}>Lab Results</NavLink>
        <NavLink to="/user/billing" style={linkStyle}>Billing</NavLink>
        <NavLink to="/user/appointment" style={linkStyle}>Appointments</NavLink>
      </nav>

      {/* Logout */}
      <div style={{ padding: "12px 16px", marginTop: "auto" }}>
        <button
          onClick={logout}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "10px",
            padding: "12px 16px",
            margin: "4px 8px",
            borderRadius: "8px",
            textDecoration: "none",
            color: "#cbd5e1",
            background: "transparent",
            fontWeight: 500,
            transition: "all 0.2s ease",
            border: "none",
            cursor: "pointer",
            width: "100%",
            fontSize: "14px",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "rgba(255,255,255,0.1)";
            e.currentTarget.style.color = "#fff";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "#cbd5e1";
          }}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default UserSidebar;
