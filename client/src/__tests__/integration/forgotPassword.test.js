import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import AuthForm from "../../components/AuthForm";
import { useAuth } from "../../useAuth";
import { useNavigate, useLocation } from "react-router-dom";

jest.mock("../../env", () => ({
  VITE_API_URL: "http://localhost:5000",
}));

jest.mock("../../useAuth");
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: jest.fn(),
  useLocation: jest.fn(),
}));

global.fetch = jest.fn();

describe("Forgot Password Functionality - Integration Test", () => {
  const mockNavigate = jest.fn();
  const mockOnClose = jest.fn();

  beforeEach(() => {
    useAuth.mockReturnValue({ isLoggedIn: false, login: jest.fn() });
    useNavigate.mockReturnValue(mockNavigate);
    useLocation.mockReturnValue({ search: "" });
    global.fetch.mockClear();
    mockOnClose.mockClear();
  });

  it("submits forgot password request successfully", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          message:
            "If an account with that email exists, a password reset link has been sent.",
        }),
    });

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
      expect(
        screen.getByText(
          "If an account with that email exists, a password reset link has been sent."
        )
      ).toBeInTheDocument();
    });
  });

  it("prevents submission when email is not provided", async () => {
    render(<AuthForm onClose={mockOnClose} />);

    fireEvent.click(screen.getByTestId("forgot-password-tab"));
    fireEvent.click(screen.getByTestId("forgot-password-submit"));

    // The form should not be submitted due to HTML5 validation
    expect(global.fetch).not.toHaveBeenCalled();

    // Check if the email input has the 'required' attribute
    const emailInput = screen.getByPlaceholderText("Email");
    expect(emailInput).toHaveAttribute("required");
  });

  it("handles server error during forgot password request", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: false,
      json: () => Promise.resolve({ error: "An unexpected error occurred" }),
    });

    render(<AuthForm onClose={mockOnClose} />);

    fireEvent.click(screen.getByTestId("forgot-password-tab"));
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.click(screen.getByTestId("forgot-password-submit"));

    await waitFor(() => {
      expect(
        screen.getByText("An unexpected error occurred")
      ).toBeInTheDocument();
    });
  });
  it("renders reset password form when reset token is in URL", async () => {
    useLocation.mockReturnValue({ search: "?reset_token=validtoken" });

    render(<AuthForm onClose={mockOnClose} />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText("New Password")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText("Confirm New Password")
      ).toBeInTheDocument();
      expect(screen.getByTestId("reset-password-submit")).toBeInTheDocument();
    });
  });

  it("submits reset password request successfully", async () => {
    useLocation.mockReturnValue({ search: "?reset_token=validtoken" });
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({ message: "Password has been reset successfully" }),
    });

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
            token: "validtoken",
            newPassword: "newpassword123",
          }),
        })
      );
      expect(
        screen.getByText("Password has been reset successfully")
      ).toBeInTheDocument();
    });
  });

  it("switches between login, signup, and forgot password forms", async () => {
    render(<AuthForm onClose={mockOnClose} />);

    // Start with login form
    expect(screen.getByTestId("login-submit")).toBeInTheDocument();

    // Switch to signup form
    fireEvent.click(screen.getByTestId("signup-tab"));
    await waitFor(() => {
      expect(screen.getByTestId("signup-submit")).toBeInTheDocument();
    });

    // Switch to forgot password form
    fireEvent.click(screen.getByTestId("forgot-password-tab"));
    await waitFor(() => {
      expect(screen.getByTestId("forgot-password-submit")).toBeInTheDocument();
    });

    // Switch back to login form
    fireEvent.click(screen.getByTestId("login-tab"));
    await waitFor(() => {
      expect(screen.getByTestId("login-submit")).toBeInTheDocument();
    });
  });
});