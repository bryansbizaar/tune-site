import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import ForgotPasswordForm from "./ForgotPasswordForm";

// Mock the environment utility
jest.mock("../env", () => ({
  VITE_API_URL: "http://localhost:5000",
}));

// Mock the fetch function
global.fetch = jest.fn();

describe("ForgotPasswordForm", () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  it("renders the form correctly", () => {
    render(<ForgotPasswordForm onClose={() => {}} />);

    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByTestId("forgot-password-submit")).toBeInTheDocument();
  });

  it("prevents form submission when email is empty", async () => {
    render(<ForgotPasswordForm onClose={() => {}} />);

    const submitButton = screen.getByTestId("forgot-password-submit");
    fireEvent.click(submitButton);

    // Check if the form was not submitted (i.e., fetch was not called)
    expect(fetch).not.toHaveBeenCalled();
  });

  it("calls the API and displays success message on successful submission", async () => {
    const mockOnClose = jest.fn();
    render(<ForgotPasswordForm onClose={mockOnClose} />);

    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: "Password reset email sent" }),
    });

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.click(screen.getByTestId("forgot-password-submit"));

    await waitFor(() => {
      expect(screen.getByText("Password reset email sent")).toBeInTheDocument();
    });

    expect(fetch).toHaveBeenCalledWith(
      "http://localhost:5000/api/auth/forgot-password",
      expect.objectContaining({
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: "test@example.com" }),
      })
    );

    await waitFor(
      () => {
        expect(mockOnClose).toHaveBeenCalled();
      },
      { timeout: 2500 }
    );
  });

  it("displays an error message when API call fails", async () => {
    render(<ForgotPasswordForm onClose={() => {}} />);

    fetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ error: "Internal Server Error" }),
    });

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.click(screen.getByTestId("forgot-password-submit"));

    await waitFor(() => {
      expect(
        screen.getByText("An error occurred. Please try again.")
      ).toBeInTheDocument();
    });
  });
});
