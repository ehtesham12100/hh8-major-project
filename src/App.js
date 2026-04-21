import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Sidebar from "./components/Sidebar";
import UserSidebar from "./components/UserSidebar";
import InterfaceSwitcher from "./components/InterfaceSwitcher";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Compliance from "./pages/Compliance";
import Anomalies from "./pages/Anomalies";
import PHIRisks from "./pages/PHIRisks";
import Assets from "./pages/Assets";
import Vulnerabilities from "./pages/Vulnerabilities";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import UserBilling from "./pages/UserBilling";
import PatientDetails from "./pages/PatientDetails";
import MedicalReport from "./pages/MedicalReport";
import Appointment from "./pages/Appointment";
import LabResults from "./pages/LabResults";
import UserHome from "./pages/UserHome";

function AppLayout({ children }) {
  const { user } = useAuth();
  const isUserPortal = user?.role === "user";

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      {isUserPortal ? <UserSidebar /> : <Sidebar />}
      
      <div style={{ 
        flex: 1, 
        marginLeft: "240px", 
        background: "#f8fafc", 
        minHeight: "100vh" 
      }}>
        {/* Only show the new Top Header for the User Portal */}
        {isUserPortal && (
          <div style={{ 
            height: "56px", 
            background: "#fff", 
            borderBottom: "1px solid #e2e8f0", 
            display: "flex", 
            alignItems: "center", 
            padding: "0 24px",
            position: "fixed",
            top: 0,
            right: 0,
            left: "240px",
            zIndex: 900,
            justifyContent: "space-between"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
               <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#2563eb" }}></div>
               <div style={{ fontWeight: "700", color: "#0f172a", fontSize: "14px", letterSpacing: "-0.01em" }}>USER PORTAL</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "11px", color: "#64748b", fontWeight: "600", textTransform: "uppercase" }}>Security Status</div>
                <div style={{ fontSize: "12px", color: "#10b981", fontWeight: "700" }}>● Verified Access</div>
              </div>
              <div style={{ width: "1px", height: "24px", background: "#e2e8f0", margin: "0 8px" }}></div>
              <div style={{ fontSize: "12px", color: "#64748b" }}>
                <span style={{ fontWeight: "600", color: "#1e293b" }}>{user?.username}</span>
              </div>
            </div>
          </div>
        )}
        
        {/* Admin content starts at the very top (no margin-top if no header) */}
        <div style={{ marginTop: isUserPortal ? "56px" : "0px" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function AppRoutes() {
  const { user, isAdmin } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      {/* Root redirection based on role */}
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            {isAdmin ? <Navigate to="/admin/dashboard" replace /> : <Navigate to="/user/patient-details" replace />}
          </ProtectedRoute>
        } 
      />

      {/* Admin Security Routes */}
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute>
            {isAdmin ? (
              <AppLayout>
                <Dashboard />
              </AppLayout>
            ) : <Navigate to="/" />}
          </ProtectedRoute>
        }
      />
      <Route
        path="/assets"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Assets />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/vulnerabilities"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Vulnerabilities />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/phi-risks"
        element={
          <ProtectedRoute>
            <AppLayout>
              <PHIRisks />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/compliance"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Compliance />
            </AppLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/anomalies"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Anomalies />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      {/* User Portal Routes */}
      <Route
        path="/user/billing"
        element={
          <ProtectedRoute>
            {!isAdmin ? (
              <AppLayout>
                <UserBilling />
              </AppLayout>
            ) : <Navigate to="/" />}
          </ProtectedRoute>
        }
      />

      <Route
        path="/user/medical-report"
        element={
          <ProtectedRoute>
            {!isAdmin ? (
              <AppLayout>
                <MedicalReport />
              </AppLayout>
            ) : <Navigate to="/" />}
          </ProtectedRoute>
        }
      />

      <Route
        path="/user/lab"
        element={
          <ProtectedRoute>
            <AppLayout>
              <LabResults />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/user/appointment"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Appointment />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/user/home"
        element={
          <ProtectedRoute>
            <AppLayout>
              <UserHome />
            </AppLayout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/user/patient-details"
        element={
          <ProtectedRoute>
            {!isAdmin ? (
              <AppLayout>
                <PatientDetails />
              </AppLayout>
            ) : <Navigate to="/" />}
          </ProtectedRoute>
        }
      />

      {/* Fallback for other User Portal links */}
      <Route
        path="/user/*"
        element={
          <ProtectedRoute>
            {!isAdmin ? (
              <AppLayout>
                <div style={{ padding: "40px", textAlign: "center" }}>
                   <h2 style={{ color: "#64748b" }}>Module Coming Soon</h2>
                   <p style={{ color: "#94a3b8" }}>The User Portal module for this section is under maintenance.</p>
                </div>
              </AppLayout>
            ) : <Navigate to="/" />}
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;

