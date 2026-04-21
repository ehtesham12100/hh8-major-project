import { useEffect, useState, useCallback } from "react";
import "./Dashboard.css";
import { useAuth } from "../context/AuthContext";
import { API_URL } from "../config";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [assets, setAssets] = useState([]);
  const [vulnerabilities, setVulnerabilities] = useState([]);
  const [phiRisks, setPhiRisks] = useState([]);
  const [anomalies, setAnomalies] = useState([]);
  const [compliance, setCompliance] = useState([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  const fetchAll = useCallback(async () => {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
    
    try {
      const [
        statsRes,
        assetsRes,
        vulnsRes,
        phiRes,
        anomRes,
        compRes,
      ] = await Promise.all([
        fetch(`${API_URL}/dashboard/stats`, { headers }),
        fetch(`${API_URL}/assets/`, { headers }),
        fetch(`${API_URL}/vulnerabilities/`, { headers }),
        fetch(`${API_URL}/phi-risks/`, { headers }),
        fetch(`${API_URL}/anomalies/`, { headers }),
        fetch(`${API_URL}/compliance/`, { headers }),
      ]);

      const statsData = await statsRes.json();
      const assetsData = await assetsRes.json();
      const vulnsData = await vulnsRes.json();
      const phiData = await phiRes.json();
      const anomData = await anomRes.json();
      const compData = await compRes.json();

      setStats(statsData);
      setAssets(assetsData);
      setVulnerabilities(vulnsData);
      setPhiRisks(phiData);
      setAnomalies(anomData);
      setCompliance(compData);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Listen for vulnerability changes to auto-refresh
  useEffect(() => {
    const handleVulnChanged = () => {
      fetchAll();
    };
    window.addEventListener("vulnChanged", handleVulnChanged);
    return () => window.removeEventListener("vulnChanged", handleVulnChanged);
  }, [fetchAll]);

  if (loading) return <p style={{ padding: "20px" }}>Loading Dashboard...</p>;

  // Handle empty data gracefully - use default values
  const safeStats = stats || { security_score: 100, critical_vulnerabilities: 0 };
  const safeAssets = Array.isArray(assets) ? assets : [];
  const safeVulnerabilities = Array.isArray(vulnerabilities) ? vulnerabilities : [];
  const safePhiRisks = Array.isArray(phiRisks) ? phiRisks : [];
  const safeAnomalies = Array.isArray(anomalies) ? anomalies : [];
  const safeCompliance = Array.isArray(compliance) ? compliance : [];

  // Compliance percentage calculation
  const compliantCount = safeCompliance.filter((c) => c.status === "compliant").length;
  const compliancePercent = safeCompliance.length
    ? Math.round((compliantCount / safeCompliance.length) * 100)
    : 100;

  return (
    <div className="dashboard-container">
      <h1>Security Dashboard</h1>
      <p className="subtitle">Real-time healthcare security monitoring and compliance</p>

      {/* Top Cards */}
      <div className="card-grid">
        <StatCard
          title="Security Score"
          value={`${safeStats.security_score}/100`}
          color="green"
        />

        <StatCard
          title="Total Assets"
          value={safeAssets.length}
          sub={`0 critical`}
        />

        <StatCard
          title="Vulnerabilities"
          value={safeVulnerabilities.length}
          sub={`${safeStats.critical_vulnerabilities} critical`}
          color="red"
        />

        <StatCard
          title="Compliance"
          value={`${compliancePercent}%`}
          sub="HIPAA compliant"
          color="blue"
        />
      </div>

      {/* Middle Section */}
      <div className="middle-grid">
        <div className="panel">
          <h3>Risk Overview</h3>
          <div className="risk-item red">
            Critical Vulnerabilities: {safeStats.critical_vulnerabilities}
          </div>
          <div className="risk-item orange">
            PHI Risk Incidents: {safePhiRisks.length}
          </div>
          <div className="risk-item yellow">
            Unreviewed Anomalies: {safeAnomalies.length}
          </div>
        </div>

        <div className="panel">
          <h3>Recent Alerts</h3>
          {safeAnomalies.length === 0 && safePhiRisks.length === 0 ? (
            <p className="muted">No recent alerts</p>
          ) : (
            <ul>
              {safeAnomalies.slice(0, 3).map((a, i) => (
                <li key={`a-${i}`}>
                  {a.title || a.description || "Anomaly detected"}
                </li>
              ))}
              {safePhiRisks.slice(0, 3).map((p, i) => (
                <li key={`p-${i}`}>
                  {p.title || p.description || "PHI risk detected"}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, sub, color }) {
  return (
    <div className={`stat-card ${color || ""}`}>
      <div className="stat-title">{title}</div>
      <div className="stat-value">{value}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

export default Dashboard;
