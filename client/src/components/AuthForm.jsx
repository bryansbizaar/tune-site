import React, { useState, useEffect } from "react";
import { VITE_API_URL } from "../env.js";
import { useAuth } from "../useAuth";
import { useLocation, useNavigate } from "react-router-dom";

const AuthForm = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("login");
  const [resetToken, setResetToken] = useState("");
  const [stayLoggedIn, setStayLoggedIn] = useState(false);
  const { isLoggedIn, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const token = query.get("reset_token");
    if (token) {
      setResetToken(token);
      setActiveTab("resetPassword");
    }
  }, [location]);

  useEffect(() => {
    if (isLoggedIn) {
      setMessage("You are already logged in.");
      setTimeout(() => {
        onClose();
        navigate("/");
      }, 2000);
    }
  }, [isLoggedIn, onClose, navigate]);

  const handleSubmit = async (e, type) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (isLoggedIn && type !== "resetPassword") {
      setMessage("You are already logged in.");
      setTimeout(() => {
        onClose();
        navigate("/");
      }, 2000);
      return;
    }

    if (type === "resetPassword" && password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      let endpoint, body;

      switch (type) {
        case "login":
          endpoint = "/api/auth/login";
          body = JSON.stringify({ email, password, stayLoggedIn });
          break;
        case "signup":
          endpoint = "/api/auth/signup";
          body = JSON.stringify({ name, email, password });
          break;
        case "forgotPassword":
          endpoint = "/api/auth/forgot-password";
          body = JSON.stringify({ email });
          break;
        case "resetPassword":
          endpoint = "/api/auth/reset-password";
          body = JSON.stringify({ token: resetToken, newPassword: password });

          break;
        default:
          throw new Error("Invalid form type");
      }

      const response = await fetch(`${VITE_API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: body,
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || "Operation successful");
        if (data.token) {
          login(data.token, data.expiresIn);
        }
        if (type === "resetPassword") {
          setActiveTab("login");
          setTimeout(() => {
            onClose();
            navigate("/");
          }, 2000);
        } else if (type === "forgotPassword") {
          setMessage(
            "If an account with that email exists, a password reset link has been sent."
          );
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

  const renderForm = () => {
    switch (activeTab) {
      case "login":
        return (
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
            <div>
              <input
                type="checkbox"
                id="stayLoggedIn"
                checked={stayLoggedIn}
                onChange={(e) => setStayLoggedIn(e.target.checked)}
                className="checkbox"
              />
              <label htmlFor="stayLoggedIn">Stay logged in for 30 days</label>
            </div>
            <button type="submit" className="button" data-testid="login-submit">
              Log In
            </button>
          </form>
        );
      case "signup":
        return (
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
            <button
              type="submit"
              className="button"
              data-testid="signup-submit"
            >
              Sign Up
            </button>
          </form>
        );
      case "forgotPassword":
        return (
          <form onSubmit={(e) => handleSubmit(e, "forgotPassword")}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              required
            />
            <button
              type="submit"
              className="button"
              data-testid="forgot-password-submit"
            >
              Reset Password
            </button>
          </form>
        );
      case "resetPassword":
        return (
          <form onSubmit={(e) => handleSubmit(e, "resetPassword")}>
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              required
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input"
              required
            />
            <button
              type="submit"
              className="button"
              data-testid="reset-password-submit"
            >
              Reset Password
            </button>
          </form>
        );
      default:
        return null;
    }
  };

  return (
    <div className="card">
      <div className="card-content">
        <div className="tabs-list">
          <button
            className={`tabs-trigger ${activeTab === "login" ? "active" : ""}`}
            onClick={() => setActiveTab("login")}
            data-testid="login-tab"
          >
            Login
          </button>
          <button
            className={`tabs-trigger ${activeTab === "signup" ? "active" : ""}`}
            onClick={() => setActiveTab("signup")}
            data-testid="signup-tab"
          >
            Sign Up
          </button>
          <button
            className={`tabs-trigger ${
              activeTab === "forgotPassword" ? "active" : ""
            }`}
            onClick={() => setActiveTab("forgotPassword")}
            data-testid="forgot-password-tab"
          >
            Forgot Password?
          </button>
        </div>
        {renderForm()}
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
