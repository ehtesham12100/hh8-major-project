import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../config";

function Compliance() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isScanning, setIsScanning] = useState(false);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newItem, setNewItem] = useState({
    title: "",
    category: "",
    status: "Compliant",
    description: "",
  });
  const { token, isAdmin } = useAuth();

  useEffect(() => {
    fetch(`${API_URL}/compliance/`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setItems(data);
        } else {
          setItems([]);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching compliance:", err);
        setLoading(false);
      });
  }, [token]);

  if (loading) return <p style={{ padding: 20 }}>Loading compliance data...</p>;

  const total = items.length;
  const compliant = items.filter((i) => i.status === "Compliant").length;
  const nonCompliant = items.filter((i) => i.status === "Non-Compliant").length;
  const partial = items.filter((i) => i.status === "Partial").length;

  const overallCompliance =
    total === 0 ? 0 : Math.round((compliant / total) * 100);

  const filtered = items.filter((i) => {
    const q = search.toLowerCase();
    return (
      (i.title || "").toLowerCase().includes(q) ||
      (i.category || "").toLowerCase().includes(q) ||
      (i.status || "").toLowerCase().includes(q)
    );
  });

  const handleDeleteItem = async (itemId) => {
    if (!window.confirm("Are you sure you want to delete this compliance item?")) return;
    try {
      await fetch(`${API_URL}/compliance/${itemId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      fetch(`${API_URL}/compliance/`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => setItems(Array.isArray(data) ? data : []));
    } catch (err) {
      console.error("Error deleting compliance item:", err);
      alert("Failed to delete compliance item");
    }
  };

  const handleAddItem = async () => {
    try {
      const response = await fetch(`${API_URL}/compliance/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newItem),
      });

      if (response.ok) {
        setShowModal(false);
        setNewItem({
          title: "",
          category: "",
          status: "Compliant",
          description: "",
        });
        fetch(`${API_URL}/compliance/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        })
          .then((res) => res.json())
          .then((data) => setItems(Array.isArray(data) ? data : []));
      } else {
        const error = await response.json();
        alert(error.detail || "Failed to add compliance item");
      }
    } catch (err) {
      console.error("Error adding compliance item:", err);
      alert("Failed to add compliance item");
    }
  };

  const handleRunAudit = async () => {
    // 1. Show the fake scanner loading sequence
    setIsScanning(true);
    
    // Simulate a network scan for 2 seconds
    setTimeout(async () => {
      try {
        const response = await fetch(`${API_URL}/compliance/scan`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        setIsScanning(false);
        
        if (response.ok) {
          const result = await response.json();
          if (result.violation) {
            alert(`Warning! HIPAA Violation Found during live scan.\n\nDetails: ${result.violation.title}`);
          } else {
            alert(`Great Job! 🔒\n\n${result.detail}`);
          }
          
          // Refresh the compliance items
          fetch(`${API_URL}/compliance/`, {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
          })
            .then((res) => res.json())
            .then((data) => setItems(Array.isArray(data) ? data : []));
            
        } else {
          alert("Error running live audit.");
        }
      } catch (err) {
        console.error("Error during audit calculation:", err);
        setIsScanning(false);
      }
    }, 2000); // 2 second delay to simulate work
  };

  return (
    <div style={{ padding: 24 }}>
      {/* Header */}
      <h1 style={{ marginBottom: 4 }}>HIPAA Compliance</h1>
      <p style={{ color: "#666", marginBottom: 24 }}>
        Monitor and maintain HIPAA compliance requirements
      </p>

      {/* Stat Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
          gap: 16,
          marginBottom: 24,
        }}
      >
        {[
          { label: "Overall Compliance", value: `${overallCompliance}%`, color: "#e53935" },
          { label: "Total Requirements", value: total, color: "#000" },
          { label: "Compliant", value: compliant, color: "#2e7d32" },
          { label: "Non-Compliant", value: nonCompliant, color: "#d32f2f" },
          { label: "Partial", value: partial, color: "#f9a825" },
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
          placeholder="Search compliance requirements..."
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
          <option>All Categories</option>
        </select>

        <select style={{ padding: "10px 12px", borderRadius: 8 }}>
          <option>All Status</option>
        </select>

        {isAdmin && (
          <div style={{ display: "flex", gap: "8px" }}>
            <button
              onClick={handleRunAudit}
              disabled={isScanning}
              style={{
                background: isScanning ? "#9ca3af" : "#ef4444",
                color: "#fff",
                border: "none",
                padding: "10px 16px",
                borderRadius: 8,
                cursor: isScanning ? "not-allowed" : "pointer",
                fontWeight: 500,
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              {isScanning ? (
                <>
                  <span className="spinner" style={{width: 14, height: 14, border: '2px solid #fff', borderBottomColor: 'transparent', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite'}}></span>
                  Scanning Hospital Network...
                </>
              ) : (
                "Run Live System Audit"
              )}
            </button>
            <button
              onClick={() => setShowModal(true)}
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
              + Add Compliance
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

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
              <th style={thStyle}>TITLE</th>
              <th style={thStyle}>CATEGORY</th>
              <th style={thStyle}>STATUS</th>
              <th style={thStyle}>DESCRIPTION</th>
              {isAdmin && <th style={thStyle}>ACTIONS</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  style={{ textAlign: "center", padding: 24, color: "#777" }}
                >
                  No compliance items found
                </td>
              </tr>
            ) : (
              filtered.map((c, idx) => (
                <tr key={idx} style={{ borderTop: "1px solid #eee" }}>
                  <td style={tdStyle}>{c.title || "-"}</td>
                  <td style={tdStyle}>{c.category || "-"}</td>
                  <td style={tdStyle}>{c.status || "-"}</td>
                  <td style={tdStyle}>{c.description || "-"}</td>
                  {isAdmin && (
                    <td style={tdStyle}>
                      <button
                        onClick={() => handleDeleteItem(c._id)}
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

      {/* Add Compliance Modal */}
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
              Add Compliance Item
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 6, color: "#374151" }}>
                Title
              </label>
              <input
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db", outline: "none", fontSize: 14, boxSizing: "border-box" }}
                placeholder="Enter requirement title"
                value={newItem.title}
                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 6, color: "#374151" }}>
                Category
              </label>
              <input
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db", outline: "none", fontSize: 14, boxSizing: "border-box" }}
                placeholder="e.g., Privacy Rule, Security Rule"
                value={newItem.category}
                onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 6, color: "#374151" }}>
                Status
              </label>
              <select
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db", background: "#fff", fontSize: 14, boxSizing: "border-box" }}
                value={newItem.status}
                onChange={(e) => setNewItem({ ...newItem, status: e.target.value })}
              >
                <option value="Compliant">Compliant</option>
                <option value="Non-Compliant">Non-Compliant</option>
                <option value="Partial">Partial</option>
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 6, color: "#374151" }}>
                Description
              </label>
              <textarea
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db", outline: "none", fontSize: 14, boxSizing: "border-box", minHeight: 80 }}
                placeholder="Enter description"
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
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
                onClick={handleAddItem}
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
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}
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

export default Compliance;
