import React, { useState, useEffect } from "react";
import { VITE_API_URL } from "../env.js";
console.log("API URL:", VITE_API_URL);
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
      console.log("Reset token found in URL:", {
        tokenLength: token.length,
        tokenPreview: `${token.substring(0, 4)}...${token.substring(
          token.length - 4
        )}`,
      });
      setResetToken(token);
      setActiveTab("resetPassword");
    }
  }, [location]);

  const handleSubmit = async (e, type) => {
    e.preventDefault();
    console.log(`Starting ${type} submission`);
    setError("");
    setMessage("");

    if (type === "resetPassword") {
      // Password match validation
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      // Log reset attempt details
      console.log("Attempting password reset:", {
        hasToken: !!resetToken,
        tokenLength: resetToken?.length,
        passwordLength: password?.length,
      });
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
          console.log(
            "Making reset password request to:",
            `${VITE_API_URL}${endpoint}`
          );
          break;
      }

      console.log(`Sending request to: ${VITE_API_URL}${endpoint}`);

      const response = await fetch(`${VITE_API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: body,
      });

      console.log("Response received:", {
        status: response.status,
        statusText: response.statusText,
      });

      let data;
      try {
        data = await response.json();
        console.log("Response data:", data);
      } catch (parseError) {
        console.error("Error parsing response:", parseError);
        throw new Error("Invalid response from server");
      }

      if (!response.ok) {
        throw new Error(data.error || "An unexpected error occurred");
      }

      setMessage(data.message || "Operation successful");
      if (data.token) {
        login(data.token, stayLoggedIn ? "30d" : "1d");
      }
      if (type === "resetPassword") {
        setActiveTab("login");
      } else if (type === "forgotPassword") {
        setMessage(
          "If an account with that email exists, a password reset link has been sent."
        );
      }
      setTimeout(onClose, 2000);
    } catch (err) {
      console.error("Request error details:", {
        name: err.name,
        message: err.message,
        type: type,
        endpoint: `/api/auth/${type}`,
        hasResetToken: !!resetToken,
      });
      setError(err.message || "An unexpected error occurred");
    }
  };

  const renderForm = () => {
    switch (activeTab) {
      case "login":
        return (
          <form
            onSubmit={(e) => handleSubmit(e, "login")}
            data-testid="login-form"
          >
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              required
              data-testid="login-email"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              required
              data-testid="login-password"
            />
            <div>
              <input
                type="checkbox"
                id="stayLoggedIn"
                checked={stayLoggedIn}
                onChange={(e) => setStayLoggedIn(e.target.checked)}
                className="checkbox"
                data-testid="stay-logged-in"
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
          <form
            onSubmit={(e) => handleSubmit(e, "signup")}
            data-testid="signup-form"
          >
            <input
              type="text"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              required
              data-testid="signup-name"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              required
              data-testid="signup-email"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              required
              data-testid="signup-password"
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
          <form
            onSubmit={(e) => handleSubmit(e, "forgotPassword")}
            data-testid="forgot-password-form"
          >
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              required
              data-testid="forgot-password-email"
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
          <form
            onSubmit={(e) => handleSubmit(e, "resetPassword")}
            data-testid="reset-password-form"
          >
            <input
              type="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              required
              data-testid="new-password-input"
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="input"
              required
              data-testid="confirm-password-input"
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
          {activeTab !== "resetPassword" && (
            <>
              <button
                className={`tabs-trigger ${
                  activeTab === "login" ? "active" : ""
                }`}
                onClick={() => setActiveTab("login")}
                data-testid="login-tab"
              >
                Login
              </button>
              <button
                className={`tabs-trigger ${
                  activeTab === "signup" ? "active" : ""
                }`}
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
            </>
          )}
        </div>
        {renderForm()}
        {error && (
          <div className="error-message" data-testid="error-message">
            <span>{error}</span>
          </div>
        )}
        {message && (
          <div className="success-message" data-testid="success-message">
            <span>{message}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuthForm;
