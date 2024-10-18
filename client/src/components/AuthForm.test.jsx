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
    jest.clearAllMocks();
  });

  // Existing tests...

  it("renders forgot password form when Forgot Password button is clicked", async () => {
    render(<AuthForm onClose={mockOnClose} />);

    fireEvent.click(screen.getByTestId("forgot-password-tab"));

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
      expect(screen.getByTestId("forgot-password-submit")).toBeInTheDocument();
    });
  });

  it("submits forgot password form with correct data", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: "Password reset email sent" }),
      })
    );

    render(<AuthForm onClose={mockOnClose} />);

    fireEvent.click(screen.getByTestId("forgot-password-tab"));
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.click(screen.getByTestId("forgot-password-submit"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:5000/api/auth/forgot-password",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: "test@example.com" }),
        })
      );
    });

    await waitFor(() => {
      expect(
        screen.getByText(
          "If an account with that email exists, a password reset link has been sent."
        )
      ).toBeInTheDocument();
    });
  });

  it("renders reset password form when reset token is present in URL", async () => {
    useLocation.mockReturnValue({ search: "?reset_token=testtoken" });

    render(<AuthForm onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText("New Password")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Confirm New Password")
      ).toBeInTheDocument();
      expect(screen.getByTestId("reset-password-submit")).toBeInTheDocument();
    });
  });

  it("submits reset password form with correct data", async () => {
    useLocation.mockReturnValue({ search: "?reset_token=testtoken" });
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({ message: "Password has been reset successfully" }),
      })
    );

    render(<AuthForm onClose={mockOnClose} />);

    fireEvent.change(screen.getByPlaceholderText("New Password"), {
      target: { value: "newpassword123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Confirm New Password"), {
      target: { value: "newpassword123" },
    });
    fireEvent.click(screen.getByTestId("reset-password-submit"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:5000/api/auth/reset-password",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: "testtoken",
            newPassword: "newpassword123",
          }),
        })
      );
    });

    await waitFor(() => {
      expect(
        screen.getByText("Password has been reset successfully")
      ).toBeInTheDocument();
    });
  });

  it("displays error when passwords do not match in reset password form", async () => {
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
