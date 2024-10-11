import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import AuthForm from "./AuthForm";
import { useAuth } from "../useAuth";

// Mock the environment utility
jest.mock("../env", () => ({
  VITE_API_URL: "http://localhost:5000",
}));

// Mock the useAuth hook
jest.mock("../useAuth", () => ({
  useAuth: jest.fn(),
}));

describe("AuthForm", () => {
  const mockOnClose = jest.fn();
  const mockLogin = jest.fn();

  beforeEach(() => {
    useAuth.mockReturnValue({ isLoggedIn: false, login: mockLogin });
    jest.clearAllMocks();
  });

  it("renders login form by default", () => {
    render(<AuthForm onClose={mockOnClose} />);
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Log In" })).toBeInTheDocument();
  });

  it("switches to signup form when Sign Up button is clicked", async () => {
    render(<AuthForm onClose={mockOnClose} />);

    const signUpTab = screen.getByTestId("signup-tab");
    fireEvent.click(signUpTab);

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Name")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
      expect(screen.getByPlaceholderText("Password")).toBeInTheDocument();
      expect(screen.getByTestId("signup-submit")).toBeInTheDocument();
    });
  });

  it("submits login form with correct data", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({ token: "fake-token", message: "Login successful" }),
      })
    );

    render(<AuthForm onClose={mockOnClose} />);

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });
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
          }),
        })
      );
    });

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("fake-token");
    });

    await waitFor(() => {
      expect(screen.getByText("Login successful")).toBeInTheDocument();
    });

    await waitFor(
      () => {
        expect(mockOnClose).toHaveBeenCalled();
      },
      { timeout: 2500 }
    );
  });

  it("displays error message on login failure", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: "Invalid credentials" }),
      })
    );

    render(<AuthForm onClose={mockOnClose} />);

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "wrongpassword" },
    });
    fireEvent.click(screen.getByTestId("login-submit"));

    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });

    expect(mockLogin).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("submits signup form with correct data", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            token: "new-user-token",
            message: "Signup successful",
          }),
      })
    );

    render(<AuthForm onClose={mockOnClose} />);

    fireEvent.click(screen.getByTestId("signup-tab"));

    fireEvent.change(screen.getByPlaceholderText("Name"), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByTestId("signup-submit"));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:5000/api/auth/signup",
        expect.objectContaining({
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: "John Doe",
            email: "john@example.com",
            password: "password123",
          }),
        })
      );
    });

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith("new-user-token");
    });

    await waitFor(() => {
      expect(screen.getByText("Signup successful")).toBeInTheDocument();
    });

    await waitFor(
      () => {
        expect(mockOnClose).toHaveBeenCalled();
      },
      { timeout: 2500 }
    );
  });

  it("displays error message on signup failure", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ error: "Email already in use" }),
      })
    );

    render(<AuthForm onClose={mockOnClose} />);

    fireEvent.click(screen.getByTestId("signup-tab"));

    fireEvent.change(screen.getByPlaceholderText("Name"), {
      target: { value: "John Doe" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "john@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByTestId("signup-submit"));

    await waitFor(() => {
      expect(screen.getByText("Email already in use")).toBeInTheDocument();
    });

    expect(mockLogin).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it("closes the form when user is already logged in", async () => {
    const mockOnClose = jest.fn();
    useAuth.mockReturnValue({ isLoggedIn: true, login: jest.fn() });

    render(<AuthForm onClose={mockOnClose} />);

    await waitFor(() => {
      expect(
        screen.getByText("You are already logged in.")
      ).toBeInTheDocument();
    });

    await waitFor(
      () => {
        expect(mockOnClose).toHaveBeenCalled();
      },
      { timeout: 2500 }
    );
  });
  it("handles network errors during form submission", async () => {
    global.fetch = jest.fn(() => Promise.reject(new Error("Network error")));

    render(<AuthForm onClose={mockOnClose} />);

    fireEvent.change(screen.getByPlaceholderText("Email"), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByTestId("login-submit"));

    await waitFor(() => {
      expect(
        screen.getByText("An error occurred. Please try again.")
      ).toBeInTheDocument();
    });

    expect(mockLogin).not.toHaveBeenCalled();
    expect(mockOnClose).not.toHaveBeenCalled();
  });
});
