import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import AuthForm from "./AuthForm";
import { useAuth } from "../useAuth";
import { useLocation, useNavigate } from "react-router-dom";

// Mock the environment utility
jest.mock("../env", () => ({
  VITE_API_URL: "http://localhost:5000",
}));

// Mock the useAuth hook
jest.mock("../useAuth", () => ({
  useAuth: jest.fn(),
}));

// Mock the react-router-dom hooks
jest.mock("react-router-dom", () => ({
  useLocation: jest.fn(),
  useNavigate: jest.fn(),
}));

describe("AuthForm", () => {
  const mockOnClose = jest.fn();
  const mockLogin = jest.fn();
  const mockNavigate = jest.fn();

  beforeEach(() => {
    useAuth.mockReturnValue({ isLoggedIn: false, login: mockLogin });
    useLocation.mockReturnValue({ search: "" });
    useNavigate.mockReturnValue(mockNavigate);
    global.fetch = jest.fn();
    jest.clearAllMocks();
  });

  describe("Login Form", () => {
    beforeEach(() => {
      render(<AuthForm onClose={mockOnClose} />);
    });

    it("renders stay logged in checkbox", () => {
      const checkbox = screen.getByLabelText(/stay logged in for 30 days/i);
      expect(checkbox).toBeInTheDocument();
      expect(checkbox).not.toBeChecked();
    });

    it("toggles stay logged in checkbox", () => {
      const checkbox = screen.getByLabelText(/stay logged in for 30 days/i);
      fireEvent.click(checkbox);
      expect(checkbox).toBeChecked();
      fireEvent.click(checkbox);
      expect(checkbox).not.toBeChecked();
    });

    it("includes stayLoggedIn in login request when checked", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            token: "test-token",
            message: "Login successful",
            expiresIn: "30d",
          }),
      });

      // Fill in login form
      fireEvent.change(screen.getByPlaceholderText("Email"), {
        target: { value: "test@example.com" },
      });
      fireEvent.change(screen.getByPlaceholderText("Password"), {
        target: { value: "password123" },
      });

      // Check the stay logged in box
      const checkbox = screen.getByLabelText(/stay logged in for 30 days/i);
      fireEvent.click(checkbox);

      // Submit the form
      fireEvent.click(screen.getByTestId("login-submit"));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "http://localhost:5000/api/auth/login",
          expect.objectContaining({
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: "test@example.com",
              password: "password123",
              stayLoggedIn: true,
            }),
          })
        );
      });

      // Verify login was called with correct token and expiry
      expect(mockLogin).toHaveBeenCalledWith("test-token", "30d");
    });

    it("uses default expiry when stay logged in is not checked", async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({
            token: "test-token",
            message: "Login successful",
            expiresIn: "1d",
          }),
      });

      // Fill in login form
      fireEvent.change(screen.getByPlaceholderText("Email"), {
        target: { value: "test@example.com" },
      });
      fireEvent.change(screen.getByPlaceholderText("Password"), {
        target: { value: "password123" },
      });

      // Submit form without checking stay logged in
      fireEvent.click(screen.getByTestId("login-submit"));

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          "http://localhost:5000/api/auth/login",
          expect.objectContaining({
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: "test@example.com",
              password: "password123",
              stayLoggedIn: false,
            }),
          })
        );
      });

      // Verify login was called with default expiry
      expect(mockLogin).toHaveBeenCalledWith("test-token", "1d");
    });
  });

  // Previous test cases remain the same...
  describe("Reset Password Form", () => {
    it("displays error when passwords do not match", async () => {
      useLocation.mockReturnValue({ search: "?reset_token=testtoken" });

      render(<AuthForm onClose={mockOnClose} />);

      fireEvent.change(screen.getByPlaceholderText("New Password"), {
        target: { value: "newpassword123" },
      });
      fireEvent.change(screen.getByPlaceholderText("Confirm New Password"), {
        target: { value: "differentpassword" },
      });
      fireEvent.click(screen.getByTestId("reset-password-submit"));

      await waitFor(() => {
        expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
      });
    });
  });

  describe("Already Logged In State", () => {
    it("shows message and redirects when already logged in", async () => {
      useAuth.mockReturnValue({ isLoggedIn: true, login: mockLogin });

      render(<AuthForm onClose={mockOnClose} />);

      await waitFor(() => {
        expect(
          screen.getByText("You are already logged in.")
        ).toBeInTheDocument();
      });

      await waitFor(
        () => {
          expect(mockOnClose).toHaveBeenCalled();
          expect(mockNavigate).toHaveBeenCalledWith("/");
        },
        { timeout: 2500 }
      );
    });
  });

  describe("Form Switching", () => {
    it("switches between login and signup forms", () => {
      render(<AuthForm onClose={mockOnClose} />);

      // Start at login form
      expect(screen.getByTestId("login-submit")).toBeInTheDocument();

      // Switch to signup
      fireEvent.click(screen.getByTestId("signup-tab"));
      expect(screen.getByTestId("signup-submit")).toBeInTheDocument();

      // Switch back to login
      fireEvent.click(screen.getByTestId("login-tab"));
      expect(screen.getByTestId("login-submit")).toBeInTheDocument();
    });

    it("switches to forgot password form", () => {
      render(<AuthForm onClose={mockOnClose} />);

      fireEvent.click(screen.getByTestId("forgot-password-tab"));
      expect(screen.getByTestId("forgot-password-submit")).toBeInTheDocument();
    });
  });
});
