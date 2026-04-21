import { NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Sidebar() {
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
      }}
    >
      {/* Logo */}
      <div style={{ padding: "12px 16px", marginBottom: "20px" }}>
        <div style={{ fontSize: "18px", fontWeight: "700" }}>HealthSecure</div>
        <div style={{ fontSize: "12px", color: "#94a3b8" }}>
          Security Platform
        </div>
      </div>

      {/* Menu - Visible to all users, but add functionality is admin-only */}
      <nav style={{ display: "flex", flexDirection: "column", flex: 1 }}>
        <NavLink to="/" end style={linkStyle}>
          Dashboard
        </NavLink>
        <NavLink to="/assets" style={linkStyle}>
          Assets
        </NavLink>
        <NavLink to="/vulnerabilities" style={linkStyle}>
          Vulnerabilities
        </NavLink>
        <NavLink to="/phi-risks" style={linkStyle}>
          PHI Risks
        </NavLink>
        <NavLink to="/compliance" style={linkStyle}>
          Compliance
        </NavLink>
        <NavLink to="/anomalies" style={linkStyle}>
          Anomalies
        </NavLink>
      </nav>

      {/* Logout Button */}
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
            e.target.style.background = "rgba(255,255,255,0.1)";
            e.target.style.color = "#fff";
          }}
          onMouseOut={(e) => {
            e.target.style.background = "transparent";
            e.target.style.color = "#cbd5e1";
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          Logout
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
