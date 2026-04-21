import { createContext, useContext, useState, useEffect } from "react";
import { API_URL } from "../config";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
    setLoading(false);
  }, [token]);

  const login = async (username, password) => {
    console.log(`DEBUG: Attempting login at ${API_URL}/auth/login`);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      
      console.log(`DEBUG: Response Status: ${response.status}`);
      
      if (!response.ok) {
        const error = await response.json();
        console.error("DEBUG: Login Error Data:", error);
        throw new Error(error.detail || "Login failed");
      }
      
      const data = await response.json();
      setToken(data.access_token);
      setUser(data.user || { username, role: "user" });
      return data;
    } catch (err) {
      console.error("DEBUG: Fetch Catch Error:", err);
      throw err;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  // Helper to check if user is admin
  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider value={{ token, user, login, logout, loading, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
