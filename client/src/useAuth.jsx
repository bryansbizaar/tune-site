import React, { useState, useEffect, useContext, createContext } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const tokenExpiry = localStorage.getItem("tokenExpiry");

    if (token) {
      // If we have a token but no expiry, remove the token
      if (!tokenExpiry) {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
        return;
      }

      // Check if token has expired
      if (new Date().getTime() < parseInt(tokenExpiry)) {
        setIsLoggedIn(true);
      } else {
        // Token has expired, clean up
        localStorage.removeItem("token");
        localStorage.removeItem("tokenExpiry");
        setIsLoggedIn(false);
      }
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const login = (token, expiresIn = "1d") => {
    localStorage.setItem("token", token);

    // Calculate expiry time
    const expiryMs =
      expiresIn === "30d" ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
    const expiryTime = new Date().getTime() + expiryMs;

    localStorage.setItem("tokenExpiry", expiryTime.toString());
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("tokenExpiry");
    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
