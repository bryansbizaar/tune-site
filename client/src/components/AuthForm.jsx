import React, { useState, useEffect } from "react";
import { VITE_API_URL } from "../env.js";
import { useAuth } from "../useAuth";

const AuthForm = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("login");
  const { isLoggedIn, login } = useAuth();

  useEffect(() => {
    if (isLoggedIn) {
      setMessage("You are already logged in.");
      setTimeout(onClose, 2000);
    }
  }, [isLoggedIn, onClose]);

  const handleSubmit = async (e, type) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (isLoggedIn) {
      setMessage("You are already logged in.");
      setTimeout(onClose, 2000);
      return;
    }

    if (type === "login" && (!email || !password)) {
      setError("Please enter both email and password");
      return;
    }

    if (type === "signup" && (!name || !email || !password)) {
      setError("Please enter name, email, and password");
      return;
    }

    try {
      const endpoint =
        type === "login" ? "/api/auth/login" : "/api/auth/signup";

      const body =
        type === "signup"
          ? JSON.stringify({ name, email, password })
          : JSON.stringify({ email, password });

      const response = await fetch(`${VITE_API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || "Operation successful");
        if (data.token) {
          login(data.token);
        }
        setTimeout(onClose, 2000);
      } else {
        setError(data.error || "An error occurred");
      }
    } catch (err) {
      console.error("Error during auth operation:", err);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="card">
      {/* <div className="card-header">
        <h2 className="card-title">Access Exclusive Content</h2>
      </div> */}
      <div className="card-content">
        <div className="tabs-list">
          <button
            className={`tabs-trigger ${activeTab === "login" ? "active" : ""}`}
            onClick={() => setActiveTab("login")}
          >
            Login
          </button>
          <button
            className={`tabs-trigger ${activeTab === "signup" ? "active" : ""}`}
            onClick={() => setActiveTab("signup")}
          >
            Sign Up
          </button>
        </div>
        {activeTab === "login" && (
          <div className="tabs-content">
            <form onSubmit={(e) => handleSubmit(e, "login")}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                required
              />
              <button type="submit" className="button">
                Log In
              </button>
            </form>
          </div>
        )}
        {activeTab === "signup" && (
          <div className="tabs-content">
            <form onSubmit={(e) => handleSubmit(e, "signup")}>
              <input
                type="text"
                placeholder="Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                required
              />
              <button type="submit" className="button">
                Sign Up
              </button>
            </form>
          </div>
        )}
        {error && (
          <div className="error-message">
            <span>{error}</span>
          </div>
        )}
        {message && (
          <div className="success-message">
            <span>{message}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthForm;
