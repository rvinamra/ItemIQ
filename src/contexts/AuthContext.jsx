import React, { createContext, useContext, useState, useCallback } from "react";

const AUTH_STORAGE_KEY = "itemiq_auth";
const AUTH_VERSION_KEY = "itemiq_auth_v";
const AUTH_VERSION = "3";

// SHA-256 hashes of valid credentials — plaintext never appears in the bundle
const VALID_MEMBER_ID_HASH = "30c9e784769910d1918ddc811835b7c65bd7268de0049a4bd1f48a7effa9a3ee";
const VALID_PASSWORD_HASH = "22fbf3d4f98da0523a501c26d92d633c3c95aaf7195f6634626bbbf2c7d2dc26";

async function sha256(text) {
  const encoded = new TextEncoder().encode(text);
  const hashBuffer = await crypto.subtle.digest("SHA-256", encoded);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

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

  const login = useCallback(async (memberId, password) => {
    const [idHash, pwHash] = await Promise.all([
      sha256(memberId),
      sha256(password),
    ]);
    if (idHash === VALID_MEMBER_ID_HASH && pwHash === VALID_PASSWORD_HASH) {
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
