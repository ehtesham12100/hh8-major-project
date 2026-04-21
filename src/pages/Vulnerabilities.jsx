import { useEffect, useState, useCallback } from "react";
import "./Vulnerabilities.css";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../config";

function Vulnerabilities() {
  const [vulns, setVulns] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token, isAdmin } = useAuth();

  // Filters
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // Add form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVuln, setNewVuln] = useState({
    asset_name: "",
    title: "",
    severity: "Medium",
    cvss_score: 0,
    status: "Open"
  });

  const fetchVulnerabilities = useCallback(() => {
    fetch(`${API_URL}/vulnerabilities/`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setVulns(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching vulnerabilities:", err);
        setLoading(false);
      });
  }, [token]);

  useEffect(() => {
    fetchVulnerabilities();
  }, [fetchVulnerabilities]);

  // Listen for dashboard refresh
  useEffect(() => {
    const handleStorageChange = () => {
      fetchVulnerabilities();
    };
    window.addEventListener("vulnChanged", handleStorageChange);
    return () => window.removeEventListener("vulnChanged", handleStorageChange);
  }, [fetchVulnerabilities]);

  // Add new vulnerability
  const addVulnerability = async (e) => {
    e.preventDefault();
    try {
      await fetch(`${API_URL}/vulnerabilities/`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newVuln)
      });
      setShowAddForm(false);
      setNewVuln({ asset_name: "", title: "", severity: "Medium", cvss_score: 0, status: "Open" });
      fetchVulnerabilities();
      window.dispatchEvent(new Event("vulnChanged"));
    } catch (error) {
      console.error("Error adding vulnerability:", error);
    }
  };

  // Update status
  const markAsFixed = async (id) => {
    try {
      await fetch(
        `${API_URL}/vulnerabilities/${id}?status=Fixed`,
        { 
          method: "PUT",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchVulnerabilities();
      window.dispatchEvent(new Event("vulnChanged"));
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // Delete vulnerability
  const deleteVulnerability = async (id) => {
    if (!window.confirm("Are you sure you want to delete this vulnerability?")) return;
    try {
      await fetch(`${API_URL}/vulnerabilities/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchVulnerabilities();
      window.dispatchEvent(new Event("vulnChanged"));
    } catch (error) {
      console.error("Error deleting vulnerability:", error);
    }
  };

  if (loading)
    return <p style={{ padding: "20px" }}>Loading vulnerabilities...</p>;

  // Apply filters
  const filteredVulns = vulns.filter((v) => {
    const matchesSearch =
      (v.title || "").toLowerCase().includes(search.toLowerCase());

    const matchesSeverity =
      severityFilter === "All" || v.severity === severityFilter;

    const matchesStatus =
      statusFilter === "All" || v.status === statusFilter;

    return matchesSearch && matchesSeverity && matchesStatus;
  });

  // Stats
  const total = vulns.length;
  const critical = vulns.filter((v) => v.severity === "Critical").length;
  const high = vulns.filter((v) => v.severity === "High").length;
  const open = vulns.filter((v) => v.status === "Open").length;

  return (
    <div style={{ padding: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1>Vulnerability Management</h1>
          <p>Track and remediate security vulnerabilities with CVSS scoring</p>
        </div>
        {isAdmin && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            style={{ backgroundColor: "#3b82f6", color: "white", padding: "10px 20px", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "14px" }}
          >
            {showAddForm ? "Cancel" : "+ Add Vulnerability"}
          </button>
        )}
      </div>

      {/* Add Form */}
      {showAddForm && (
        <form onSubmit={addVulnerability} style={{ background: "#f8fafc", padding: "20px", borderRadius: "8px", marginBottom: "20px", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
          <input type="text" placeholder="Asset Name" value={newVuln.asset_name} onChange={(e) => setNewVuln({...newVuln, asset_name: e.target.value})} required style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }} />
          <input type="text" placeholder="Title" value={newVuln.title} onChange={(e) => setNewVuln({...newVuln, title: e.target.value})} required style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }} />
          <select value={newVuln.severity} onChange={(e) => setNewVuln({...newVuln, severity: e.target.value})} style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }}>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
          <input type="number" placeholder="CVSS Score" value={newVuln.cvss_score} onChange={(e) => setNewVuln({...newVuln, cvss_score: parseFloat(e.target.value)})} step="0.1" min="0" max="10" required style={{ padding: "10px", borderRadius: "6px", border: "1px solid #ccc" }} />
          <button type="submit" style={{ backgroundColor: "#22c55e", color: "white", padding: "10px", border: "none", borderRadius: "6px", cursor: "pointer", gridColumn: "span 2" }}>
            Save Vulnerability
          </button>
        </form>
      )}

      {/* Cards */}
      <div style={{ display: "flex", gap: "16px", marginBottom: "20px" }}>
        <Card title="Total Vulnerabilities" value={total} />
        <Card title="Critical" value={critical} color="red" />
        <Card title="High Severity" value={high} color="orange" />
        <Card title="Open Issues" value={open} color="red" />
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
        <input
          type="text"
          placeholder="Search by title..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, padding: "10px" }}
        />

        <select
          value={severityFilter}
          onChange={(e) => setSeverityFilter(e.target.value)}
        >
          <option value="All">All Severity</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="All">All Status</option>
          <option value="Open">Open</option>
          <option value="Fixed">Fixed</option>
        </select>
      </div>

      {/* Table */}
      <table className="vuln-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Severity</th>
            <th>Status</th>
            <th>CVSS</th>
            <th>Action</th>
          </tr>
        </thead>

        <tbody>
          {filteredVulns.length === 0 ? (
            <tr>
              <td colSpan="5" align="center">
                No vulnerabilities found
              </td>
            </tr>
          ) : (
            filteredVulns.map((v) => {
              console.log(v);
              return (
                <tr key={v._id}>
                  <td>{v.title}</td>
                  <td><span className={`severity-${v.severity?.toLowerCase()}`}>{v.severity}</span></td>
                  <td><span className={`status-badge ${v.status === "Open" ? "status-open" : "status-fixed"}`}>{v.status}</span></td>
                  <td>{v.cvss_score}</td>
                  <td>
                    {v.status === "Open" && (
                      <button onClick={() => markAsFixed(v._id)} style={{ backgroundColor: "green", color: "white", padding: "6px 10px", border: "none", borderRadius: "4px", cursor: "pointer", marginRight: "8px" }}>Fix</button>
                    )}
                    {isAdmin && (
                      <button onClick={() => deleteVulnerability(v._id)} style={{ backgroundColor: "#dc2626", color: "white", padding: "6px 10px", border: "none", borderRadius: "4px", cursor: "pointer" }}>Delete</button>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

function Card({ title, value, color }) {
  return (
    <div
      style={{
        flex: 1,
        padding: "16px",
        border: "1px solid #ddd",
        borderRadius: "8px",
        background: "#fff"
      }}
    >
      <div style={{ fontSize: "14px", color: "#666" }}>{title}</div>
      <div
        style={{
          fontSize: "28px",
          fontWeight: "bold",
          color: color || "#000"
        }}
      >
        {value}
      </div>
    </div>
  );
}

export default Vulnerabilities;
