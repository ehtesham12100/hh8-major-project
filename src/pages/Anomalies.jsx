import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../config";

function Anomalies() {
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { token, isAdmin } = useAuth();
  
  // Form state
  const [formData, setFormData] = useState({
    user: "",
    ip: "",
    severity: "Medium",
    status: "Needs Review",
    description: "",
    confidence: "Medium"
  });

  useEffect(() => {
    fetch(`${API_URL}/anomalies/`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAnomalies(data);
        } else {
          setAnomalies([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching anomalies:", err);
        setLoading(false);
      });
  }, [token]);

  if (loading) return <p style={{ padding: 20 }}>Loading anomalies...</p>;

  const total = anomalies.length;
  const critical = anomalies.filter((a) => a.severity === "Critical").length;
  const needsReview = anomalies.filter((a) => a.status === "Needs Review").length;
  const highConfidence = anomalies.filter((a) => a.confidence === "High").length;

  const filtered = anomalies.filter((a) => {
    const q = search.toLowerCase();
    return (
      (a.user || "").toLowerCase().includes(q) ||
      (a.ip || "").toLowerCase().includes(q) ||
      (a.description || "").toLowerCase().includes(q)
    );
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDeleteAnomaly = async (anomalyId) => {
    if (!window.confirm("Are you sure you want to delete this anomaly?")) return;
    try {
      await fetch(`${API_URL}/anomalies/${anomalyId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      fetch(`${API_URL}/anomalies/`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => setAnomalies(Array.isArray(data) ? data : []));
    } catch (err) {
      console.error("Error deleting anomaly:", err);
      alert("Failed to delete anomaly");
    }
  };

  const handleSubmitAnomaly = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await fetch(`${API_URL}/anomalies/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      // Refresh anomalies list
      fetch(`${API_URL}/anomalies/`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => setAnomalies(Array.isArray(data) ? data : []));

      // Reset form
      setFormData({
        user: "",
        ip: "",
        severity: "Medium",
        status: "Needs Review",
        description: "",
        confidence: "Medium"
      });
      setShowForm(false);
    } catch (err) {
      console.error("Error adding anomaly:", err);
      alert("Failed to add anomaly");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <h1 style={{ marginBottom: 4 }}>AI Anomaly Detection</h1>
      <p style={{ color: "#666", marginBottom: 24 }}>
        Machine learning-powered detection of unusual security patterns and behaviors
      </p>

      {/* Stat Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {[
          { label: "Total Anomalies", value: total, color: "#000" },
          { label: "Critical Threats", value: critical, color: "#d32f2f" },
          { label: "Needs Review", value: needsReview, color: "#f57c00" },
          { label: "High Confidence", value: highConfidence, color: "#2e7d32" },
        ].map((card, idx) => (
          <div
            key={idx}
            style={{
              background: "#fff",
              borderRadius: 10,
              padding: 16,
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            <div style={{ fontSize: 14, color: "#666" }}>{card.label}</div>
            <div style={{ fontSize: 28, fontWeight: "bold", color: card.color }}>
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {/* Search + Filters */}
      <div
        style={{
          background: "#fff",
          padding: 16,
          borderRadius: 10,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          display: "flex",
          gap: 12,
          marginBottom: 24,
        }}
      >
        <input
          type="text"
          placeholder="Search anomalies by user, IP, or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            padding: "10px 12px",
            borderRadius: 8,
            border: "1px solid #ccc",
            fontSize: 14,
          }}
        />

        <select style={{ padding: "10px 12px", borderRadius: 8 }}>
          <option>All Severity</option>
        </select>

        <select style={{ padding: "10px 12px", borderRadius: 8 }}>
          <option>All Status</option>
        </select>

        {isAdmin && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            style={{
              background: "#2563eb",
              color: "#fff",
              border: "none",
              padding: "10px 16px",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 500,
              fontSize: 14,
            }}
          >
            + Add Anomaly
          </button>
        )}
      </div>

      {/* Table */}
      <div
        style={{
          background: "#fff",
          borderRadius: 10,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          overflow: "hidden",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#f8fafc" }}>
            <tr>
              <th style={thStyle}>USER</th>
              <th style={thStyle}>IP</th>
              <th style={thStyle}>SEVERITY</th>
              <th style={thStyle}>STATUS</th>
              <th style={thStyle}>DESCRIPTION</th>
              {isAdmin && <th style={thStyle}>ACTIONS</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={isAdmin ? 6 : 5}
                  style={{ textAlign: "center", padding: 24, color: "#777" }}
                >
                  No anomalies found
                </td>
              </tr>
            ) : (
              filtered.map((a, idx) => (
                <tr key={idx} style={{ borderTop: "1px solid #eee" }}>
                  <td style={tdStyle}>{a.user || "-"}</td>
                  <td style={tdStyle}>{a.ip || "-"}</td>
                  <td style={tdStyle}>{a.severity || "-"}</td>
                  <td style={tdStyle}>{a.status || "-"}</td>
                  <td style={tdStyle}>{a.description || "-"}</td>
                  {isAdmin && (
                    <td style={tdStyle}>
                      <button
                        onClick={() => handleDeleteAnomaly(a._id)}
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
      
      {/* Modal Form */}
      {showForm && (
        <AnomalyFormModal 
          formData={formData}
          handleInputChange={handleInputChange}
          handleSubmit={handleSubmitAnomaly}
          onClose={() => setShowForm(false)}
          submitting={submitting}
        />
      )}
    </div>
  );
}

// Modal Form Component
function AnomalyFormModal({ formData, handleInputChange, handleSubmit, onClose, submitting }) {
  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000
    }}>
      <div style={{
        background: "#fff",
        borderRadius: 12,
        padding: 24,
        width: "90%",
        maxWidth: 500,
        maxHeight: "90vh",
        overflowY: "auto"
      }}>
        <h2 style={{ marginTop: 0, marginBottom: 20 }}>Add New Anomaly</h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 6, fontWeight: 500, fontSize: 14 }}>User</label>
            <input
              type="text"
              name="user"
              value={formData.user}
              onChange={handleInputChange}
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid #ccc",
                fontSize: 14,
                boxSizing: "border-box"
              }}
            />
          </div>
          
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 6, fontWeight: 500, fontSize: 14 }}>IP Address</label>
            <input
              type="text"
              name="ip"
              value={formData.ip}
              onChange={handleInputChange}
              required
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid #ccc",
                fontSize: 14,
                boxSizing: "border-box"
              }}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: "block", marginBottom: 6, fontWeight: 500, fontSize: 14 }}>Severity</label>
              <select
                name="severity"
                value={formData.severity}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid #ccc",
                  fontSize: 14,
                  boxSizing: "border-box"
                }}
              >
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 6, fontWeight: 500, fontSize: 14 }}>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid #ccc",
                  fontSize: 14,
                  boxSizing: "border-box"
                }}
              >
                <option value="Needs Review">Needs Review</option>
                <option value="Reviewed">Reviewed</option>
                <option value="Resolved">Resolved</option>
                <option value="Dismissed">Dismissed</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", marginBottom: 6, fontWeight: 500, fontSize: 14 }}>Confidence</label>
            <select
              name="confidence"
              value={formData.confidence}
              onChange={handleInputChange}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid #ccc",
                fontSize: 14,
                boxSizing: "border-box"
              }}
            >
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", marginBottom: 6, fontWeight: 500, fontSize: 14 }}>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows={4}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid #ccc",
                fontSize: 14,
                boxSizing: "border-box",
                resize: "vertical"
              }}
            />
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              style={{
                background: "#f5f5f5",
                color: "#333",
                border: "1px solid #ccc",
                padding: "10px 20px",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 500,
                fontSize: 14
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                background: submitting ? "#93c5fd" : "#2563eb",
                color: "#fff",
                border: "none",
                padding: "10px 20px",
                borderRadius: 8,
                cursor: submitting ? "not-allowed" : "pointer",
                fontWeight: 500,
                fontSize: 14
              }}
            >
              {submitting ? "Adding..." : "Add Anomaly"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const thStyle = {
  textAlign: "left",
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
  fontSize: 14,
};

export default Anomalies;
