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
        Promise.resolve({
          message:
            "Password successfully reset. Please log in with your new password.",
        }),
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
    });

    await waitFor(() => {
      expect(
        screen.getByText(
          "Password successfully reset. Please log in with your new password."
        )
      ).toBeInTheDocument();
    });

    // Wait for navigation and modal close
    await waitFor(
      () => {
        expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
        expect(mockOnClose).toHaveBeenCalled();
      },
      { timeout: 3000 }
    );
  });

  it("prevents submission when passwords don't match", async () => {
    useLocation.mockReturnValue({ search: "?reset_token=validtoken" });

    render(<AuthForm onClose={mockOnClose} />);

    fireEvent.change(screen.getByPlaceholderText("New Password"), {
      target: { value: "password123" },
    });
    fireEvent.change(screen.getByPlaceholderText("Confirm New Password"), {
      target: { value: "differentpassword" },
    });
    fireEvent.click(screen.getByTestId("reset-password-submit"));

    expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
    expect(global.fetch).not.toHaveBeenCalled();
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
});
