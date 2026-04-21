import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../config";

function PHIRisks() {
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newRisk, setNewRisk] = useState({
    title: "",
    severity: "Medium",
    status: "Open",
    system: "",
    description: "",
    records_affected: 0,
  });
  const { token, isAdmin, logout } = useAuth();

  useEffect(() => {
    fetch(`${API_URL}/phi-risks/`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setRisks(data);
        } else {
          setRisks([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching PHI risks:", err);
        setLoading(false);
      });
  }, [token]);

  if (loading) return <p style={{ padding: "24px" }}>Loading PHI risks...</p>;

  const totalIncidents = risks.length;
  const criticalRisks = risks.filter((r) => r.severity === "Critical").length;
  const openCases = risks.filter((r) => r.status === "Open").length;
  const recordsAffected = risks.reduce(
    (sum, r) => sum + (Number(r.records_affected) || 0),
    0
  );

  const filteredRisks = risks.filter((r) => {
    const text = `${r.title || ""} ${r.description || ""} ${r.system || ""}`.toLowerCase();
    return text.includes(search.toLowerCase());
  });

  const handleDeleteRisk = async (riskId) => {
    if (!window.confirm("Are you sure you want to delete this PHI risk?")) return;
    try {
      await fetch(`${API_URL}/phi-risks/${riskId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      // Refresh risks list
      fetch(`${API_URL}/phi-risks/`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => setRisks(Array.isArray(data) ? data : []));
    } catch (err) {
      console.error("Error deleting PHI risk:", err);
      alert("Failed to delete PHI risk");
    }
  };

  const handleAddRisk = async () => {
    try {
      const response = await fetch(`${API_URL}/phi-risks/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newRisk),
      });

      if (response.ok) {
        setShowModal(false);
        setNewRisk({
          title: "",
          severity: "Medium",
          status: "Open",
          system: "",
          description: "",
          records_affected: 0,
        });
        // Refresh risks list
        fetch(`${API_URL}/phi-risks/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
          .then((res) => res.json())
          .then((data) => setRisks(Array.isArray(data) ? data : []));
      } else {
        const error = await response.json();
        alert(error.detail || "Failed to add PHI risk");
      }
    } catch (err) {
      console.error("Error adding PHI risk:", err);
      alert("Failed to add PHI risk");
    }
  };

  const handleExportPrompt = () => {
    const pwd = window.prompt("STEP-UP AUTHENTICATION REQUIRED\n\nPlease enter your login password to authorize bulk data export:");
    if (pwd) {
      handleExportDownload(pwd);
    }
  };

  const handleExportDownload = async (password) => {
    try {
      const response = await fetch(`${API_URL}/phi-risks/export-download`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ password })
      });

      if (!response.ok) {
        // We expect a 403 response if the password was wrong!
        const error = await response.json();
        alert(error.detail + "\n\nSECURITY ENFORCEMENT: Terminating session immediately.");
        
        // BOOM! Kick the user out for failing the step-up verification.
        logout();
        
      } else {
         const blob = await response.blob();
         const url = window.URL.createObjectURL(blob);
         const a = document.createElement("a");
         a.href = url;
         a.download = "HealthSecure_PHI_Audit_Export.csv";
         document.body.appendChild(a);
         a.click();
         a.remove();
         window.URL.revokeObjectURL(url);
         alert("Export successful. Patient Database Downloaded Successfully.");
      }
    } catch (err) {
      console.error("Error triggering export trap:", err);
      alert("Network error processing request.");
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      {/* Header */}
      <h1 style={{ fontSize: "28px", marginBottom: "4px" }}>PHI Risk Monitoring</h1>
      <p style={{ color: "#64748b", marginBottom: "24px" }}>
        Monitor and manage Protected Health Information exposure risks
      </p>

      {/* Top Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "16px",
          marginBottom: "20px",
        }}
      >
        <StatCard title="Total Incidents" value={totalIncidents} />
        <StatCard title="Critical Risks" value={criticalRisks} color="#dc2626" />
        <StatCard title="Open Cases" value={openCases} color="#ea580c" />
        <StatCard title="Records Affected" value={recordsAffected} color="#2563eb" />
      </div>

      {/* Search + Filters Bar */}
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          padding: "12px",
          boxShadow: "0 1px 6px rgba(0,0,0,0.08)",
          marginBottom: "20px",
          display: "flex",
          gap: "12px",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          placeholder="Search PHI risks by description or affected system..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: "8px",
            border: "1px solid #cbd5f5",
            outline: "none",
          }}
        />

        <select style={selectStyle}>
          <option>All Severity</option>
          <option>Critical</option>
          <option>High</option>
          <option>Medium</option>
          <option>Low</option>
        </select>

        <select style={selectStyle}>
          <option>All Status</option>
          <option>Open</option>
          <option>Closed</option>
        </select>

        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={handleExportPrompt}
            style={{
              background: "#dc2626", // Red colour for danger
              color: "#fff",
              border: "none",
              padding: "10px 16px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: 500,
              fontSize: 14,
            }}
          >
            Export Patient Database
          </button>
          
          {isAdmin && (
            <button
              onClick={() => setShowModal(true)}
              style={{
                background: "#2563eb",
                color: "#fff",
                border: "none",
                padding: "10px 16px",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: 500,
                fontSize: 14,
              }}
            >
              + Add PHI Risk
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div
        style={{
          background: "#fff",
          borderRadius: "12px",
          boxShadow: "0 1px 6px rgba(0,0,0,0.08)",
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#f8fafc", textAlign: "left" }}>
            <tr>
              <th style={thStyle}>TITLE</th>
              <th style={thStyle}>SEVERITY</th>
              <th style={thStyle}>STATUS</th>
              <th style={thStyle}>SYSTEM</th>
              <th style={thStyle}>DESCRIPTION</th>
              {isAdmin && <th style={thStyle}>ACTIONS</th>}
            </tr>
          </thead>
          <tbody>
            {filteredRisks.length === 0 ? (
              <tr>
              <td
                colSpan="6"
                style={{
                  padding: "24px",
                  textAlign: "center",
                  color: "#64748b",
                }}
              >
                No PHI risks found
              </td>
              </tr>
            ) : (
              filteredRisks.map((r, idx) => (
                <tr key={idx} style={{ borderTop: "1px solid #e5e7eb" }}>
                  <td style={tdStyle}>{r.title || "-"}</td>
                  <td style={tdStyle}>{r.severity || "-"}</td>
                  <td style={tdStyle}>{r.status || "-"}</td>
                  <td style={tdStyle}>{r.system || "-"}</td>
                  <td style={tdStyle}>{r.description || "-"}</td>
                  {isAdmin && (
                    <td style={tdStyle}>
                      <button
                        onClick={() => handleDeleteRisk(r._id)}
                        style={{
                          background: "#dc2626",
                          color: "#fff",
                          border: "none",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: 13,
                          fontWeight: 500,
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add PHI Risk Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: 12,
              padding: 24,
              width: 400,
              maxWidth: "90%",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 20 }}>
              Add New PHI Risk
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 6, color: "#374151" }}>
                Title
              </label>
              <input
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db", outline: "none", fontSize: 14, boxSizing: "border-box" }}
                placeholder="Enter risk title"
                value={newRisk.title}
                onChange={(e) => setNewRisk({ ...newRisk, title: e.target.value })}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 6, color: "#374151" }}>
                Severity
              </label>
              <select
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db", background: "#fff", fontSize: 14, boxSizing: "border-box" }}
                value={newRisk.severity}
                onChange={(e) => setNewRisk({ ...newRisk, severity: e.target.value })}
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 6, color: "#374151" }}>
                Status
              </label>
              <select
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db", background: "#fff", fontSize: 14, boxSizing: "border-box" }}
                value={newRisk.status}
                onChange={(e) => setNewRisk({ ...newRisk, status: e.target.value })}
              >
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 6, color: "#374151" }}>
                System
              </label>
              <input
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db", outline: "none", fontSize: 14, boxSizing: "border-box" }}
                placeholder="Enter affected system"
                value={newRisk.system}
                onChange={(e) => setNewRisk({ ...newRisk, system: e.target.value })}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 6, color: "#374151" }}>
                Description
              </label>
              <textarea
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db", outline: "none", fontSize: 14, boxSizing: "border-box", minHeight: 80 }}
                placeholder="Enter description"
                value={newRisk.description}
                onChange={(e) => setNewRisk({ ...newRisk, description: e.target.value })}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 6, color: "#374151" }}>
                Records Affected
              </label>
              <input
                type="number"
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db", outline: "none", fontSize: 14, boxSizing: "border-box" }}
                placeholder="Enter number of records affected"
                value={newRisk.records_affected}
                onChange={(e) => setNewRisk({ ...newRisk, records_affected: parseInt(e.target.value) || 0 })}
              />
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
              <button
                onClick={() => setShowModal(false)}
                style={{
                  background: "#f3f4f6",
                  color: "#374151",
                  border: "none",
                  padding: "10px 16px",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontWeight: 500,
                  fontSize: 14,
                  flex: 1,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddRisk}
                style={{
                  background: "#2563eb",
                  color: "#fff",
                  border: "none",
                  padding: "10px 16px",
                  borderRadius: 8,
                  cursor: "pointer",
                  fontWeight: 500,
                  fontSize: 14,
                  flex: 1,
                }}
              >
                Add Risk
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* Small reusable card */
function StatCard({ title, value, color }) {
  return (
    <div
      style={{
        background: "#fff",
        borderRadius: "12px",
        padding: "16px",
        boxShadow: "0 1px 6px rgba(0,0,0,0.08)",
      }}
    >
      <div style={{ color: "#64748b", fontSize: "14px" }}>{title}</div>
      <div
        style={{
          fontSize: "28px",
          fontWeight: "700",
          color: color || "#111827",
        }}
      >
        {value}
      </div>
    </div>
  );
}

const thStyle = {
  padding: "14px 16px",
  fontSize: 12,
  fontWeight: 600,
  color: "#ffffff",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
};

const tdStyle = {
  padding: "14px 16px",
  fontSize: "14px",
};

const selectStyle = {
  padding: "10px 12px",
  borderRadius: "8px",
  border: "1px solid #cbd5f5",
  background: "#fff",
};

export default PHIRisks;
