import React from "react";

function InterfaceSwitcher({ activeInterface, setActiveInterface }) {
  const containerStyle = {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 24px",
    background: "#ffffff",
    borderBottom: "1px solid #e2e8f0",
    position: "fixed",
    top: 0,
    right: 0,
    left: "240px",
    zIndex: 999,
  };

  const buttonStyle = (isActive) => ({
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "6px 16px",
    borderRadius: "20px",
    border: isActive ? "1px solid #2563eb" : "1px solid transparent",
    cursor: "pointer",
    fontSize: "13px",
    fontWeight: "600",
    transition: "all 0.2s ease",
    background: isActive ? "#eff6ff" : "transparent",
    color: isActive ? "#2563eb" : "#64748b",
  });

  const getIcon = (type) => {
    if (type === "user") return "👤";
    if (type === "admin") return "🛡️";
    return "";
  };

  return (
    <div style={containerStyle}>
      <span style={{ color: "#475569", fontSize: "12px", fontWeight: "600", textTransform: "uppercase", marginRight: "8px" }}>Interface:</span>
      
      <button 
        onClick={() => setActiveInterface("user")}
        style={buttonStyle(activeInterface === "user")}
      >
        <span>{getIcon("user")}</span>
        User Portal
      </button>

      <button 
        onClick={() => setActiveInterface("admin")}
        style={buttonStyle(activeInterface === "admin")}
      >
        <span>{getIcon("admin")}</span>
        Admin Security
      </button>
    </div>
  );
}

export default InterfaceSwitcher;
