import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import AuthButton from "./AuthButton";
import { useAuth } from "../useAuth";

// Mock the environment utility
jest.mock("../env", () => ({
  VITE_API_URL: "http://localhost:5000",
}));

// Mock the useAuth hook
jest.mock("../useAuth", () => ({
  useAuth: jest.fn(),
}));

// Mock the Dialog component
jest.mock("./ui/Dialog", () => ({
  Dialog: ({ children, open }) => (open ? <div>{children}</div> : null),
  DialogContent: ({ children }) => <div>{children}</div>,
  DialogTitle: ({ children }) => <h2>{children}</h2>,
  DialogDescription: ({ children }) => <p>{children}</p>,
}));

describe("AuthButton", () => {
  it("renders Login button when user is not logged in", () => {
    useAuth.mockReturnValue({ isLoggedIn: false });
    render(<AuthButton />);
    expect(screen.getByText("Log In")).toBeInTheDocument();
  });

  it("renders Logout button when user is logged in", () => {
    useAuth.mockReturnValue({ isLoggedIn: true, logout: jest.fn() });
    render(<AuthButton />);
    expect(screen.getByText("Log Out")).toBeInTheDocument();
  });

  it("opens modal when Login button is clicked", () => {
    useAuth.mockReturnValue({ isLoggedIn: false });
    render(<AuthButton />);
    fireEvent.click(screen.getByText("Log In"));
    expect(screen.getByText("Authentication")).toBeInTheDocument();
  });

  it("calls logout function when Logout button is clicked", () => {
    const mockLogout = jest.fn();
    useAuth.mockReturnValue({ isLoggedIn: true, logout: mockLogout });
    render(<AuthButton />);
    fireEvent.click(screen.getByText("Log Out"));
    expect(mockLogout).toHaveBeenCalled();
  });
});
