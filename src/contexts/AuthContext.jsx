import React, { createContext, useContext, useState, useCallback } from "react";

const AUTH_STORAGE_KEY = "itemiq_auth";
const AUTH_VERSION_KEY = "itemiq_auth_v";
const AUTH_VERSION = "2";
const VALID_MEMBER_ID = "itemiq_test";
const VALID_PASSWORD = "svcholdings_ITEMIQ";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    // Invalidate sessions from before the auth gate was added
    if (sessionStorage.getItem(AUTH_VERSION_KEY) !== AUTH_VERSION) {
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
      sessionStorage.setItem(AUTH_VERSION_KEY, AUTH_VERSION);
      return false;
    }
    return sessionStorage.getItem(AUTH_STORAGE_KEY) === "true";
  });

  const login = useCallback((memberId, password) => {
    if (memberId === VALID_MEMBER_ID && password === VALID_PASSWORD) {
      sessionStorage.setItem(AUTH_STORAGE_KEY, "true");
      sessionStorage.setItem(AUTH_VERSION_KEY, AUTH_VERSION);
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(AUTH_STORAGE_KEY);
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
