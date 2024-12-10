import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import AuthButton from "./AuthButton";
import { useAuth } from "../useAuth";
import { useLocation, useNavigate } from "react-router-dom";

// Mock the environment utility
jest.mock("../env", () => ({
  VITE_API_URL: "http://localhost:3000",
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

// Mock the Dialog component
jest.mock("./ui/Dialog", () => ({
  Dialog: ({ children, open }) => (open ? <div>{children}</div> : null),
  DialogContent: ({ children }) => <div>{children}</div>,
  DialogTitle: ({ children }) => <h2>{children}</h2>,
  DialogDescription: ({ children }) => <p>{children}</p>,
}));

// Mock the AuthForm component
jest.mock("./AuthForm", () => {
  return function MockAuthForm({ onClose }) {
    return (
      <div data-testid="mock-auth-form" onClick={onClose}>
        Mock Auth Form
      </div>
    );
  };
});

describe("AuthButton", () => {
  const mockLogout = jest.fn();
  const mockNavigate = jest.fn();

  beforeEach(() => {
    useAuth.mockReturnValue({ isLoggedIn: false, logout: mockLogout });
    useLocation.mockReturnValue({ search: "" });
    useNavigate.mockReturnValue(mockNavigate);
    jest.clearAllMocks();
  });

  it("renders Login button when user is not logged in", () => {
    render(<AuthButton />);
    expect(screen.getByText("Log In")).toBeInTheDocument();
  });

  it("renders Logout button when user is logged in", () => {
    useAuth.mockReturnValue({ isLoggedIn: true, logout: mockLogout });
    render(<AuthButton />);
    expect(screen.getByText("Log Out")).toBeInTheDocument();
  });

  it("opens modal when Login button is clicked", async () => {
    render(<AuthButton />);
    fireEvent.click(screen.getByText("Log In"));
    await waitFor(() => {
      expect(screen.getByTestId("mock-auth-form")).toBeInTheDocument();
    });
  });

  it("navigates away from reset token URL when Login is clicked", async () => {
    useLocation.mockReturnValue({ search: "?reset_token=testtoken" });
    render(<AuthButton />);
    fireEvent.click(screen.getByText("Log In"));

    expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });

    // Wait for the setTimeout to complete
    await waitFor(() => {
      expect(screen.getByTestId("mock-auth-form")).toBeInTheDocument();
    });
  });

  it("calls logout function when Logout button is clicked", () => {
    useAuth.mockReturnValue({ isLoggedIn: true, logout: mockLogout });
    render(<AuthButton />);
    fireEvent.click(screen.getByText("Log Out"));
    expect(mockLogout).toHaveBeenCalled();
  });

  it("opens modal automatically when reset_token is in URL", async () => {
    useLocation.mockReturnValue({ search: "?reset_token=testtoken" });
    render(<AuthButton />);
    await waitFor(() => {
      expect(screen.getByTestId("mock-auth-form")).toBeInTheDocument();
    });
  });

  it("navigates to home page when modal is closed with reset token present", async () => {
    useLocation.mockReturnValue({ search: "?reset_token=testtoken" });
    render(<AuthButton />);

    await waitFor(() => {
      expect(screen.getByTestId("mock-auth-form")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("mock-auth-form"));

    expect(mockNavigate).toHaveBeenCalledWith("/", { replace: true });
  });

  it("closes modal when AuthForm calls onClose without reset token", async () => {
    render(<AuthButton />);
    fireEvent.click(screen.getByText("Log In"));

    await waitFor(() => {
      expect(screen.getByTestId("mock-auth-form")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByTestId("mock-auth-form"));

    await waitFor(() => {
      expect(screen.queryByTestId("mock-auth-form")).not.toBeInTheDocument();
    });
    expect(mockNavigate).not.toHaveBeenCalled();
  });
});
