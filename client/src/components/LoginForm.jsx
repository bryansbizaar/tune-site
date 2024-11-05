import React, { useState } from "react";
import { VITE_API_URL } from "../env";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../useAuth";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (!email && !password) {
        throw new Error("Please enter both email and password");
      } else if (!email) {
        throw new Error("Please enter email");
      } else if (!password) {
        throw new Error("Please enter password");
      }

      const response = await fetch(`${VITE_API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Handle successful login (e.g., redirect, save token, etc.)

      login(data.token);
      navigate("/");
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleSubmit} data-testid="login-form">
        <div>
          <label htmlFor="email">Email:</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            required
          />
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>
        {error && (
          <p data-testid="error-message" style={{ color: "red" }}>
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          data-testid="submit-button"
        >
          {isSubmitting ? "Logging in..." : "Log In"}
        </button>
      </form>
    </div>
  );
};

export default LoginForm;
