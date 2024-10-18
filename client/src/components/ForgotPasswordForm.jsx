import React, { useState } from "react";
import { VITE_API_URL } from "../env.js";

const ForgotPasswordForm = ({ onClose }) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email) {
      setError("Please enter your email");
      return;
    }

    try {
      const response = await fetch(`${VITE_API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("An error occurred");
      }

      const data = await response.json();
      setMessage(data.message || "Password reset email sent");
      setTimeout(onClose, 2000);
    } catch (err) {
      console.error("Error during forgot password operation:", err);
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="card">
      <div className="card-content">
        <form onSubmit={handleSubmit}>
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

export default ForgotPasswordForm;
