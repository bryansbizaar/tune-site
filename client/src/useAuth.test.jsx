import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useAuth, AuthProvider } from "./useAuth";
import { MemoryRouter } from "react-router-dom";

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
};
Object.defineProperty(window, "localStorage", { value: localStorageMock });

// Mock navigate function
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
}));

// Helper component to test the hook
const TestComponent = () => {
  const { isLoggedIn, login, logout } = useAuth();
  return (
    <div>
      <div data-testid="login-status">
        {isLoggedIn ? "Logged In" : "Logged Out"}
      </div>
      <button onClick={() => login("test-token")}>Login</button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

const renderWithAuth = () => {
  return render(
    <MemoryRouter>
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    </MemoryRouter>
  );
};

describe("useAuth", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should initialize with isLoggedIn false when no token in localStorage", () => {
    localStorageMock.getItem.mockReturnValue(null);
    renderWithAuth();
    expect(screen.getByTestId("login-status")).toHaveTextContent("Logged Out");
  });

  it("should initialize with isLoggedIn true when token exists in localStorage", () => {
    localStorageMock.getItem.mockReturnValue("fake-token");
    renderWithAuth();
    expect(screen.getByTestId("login-status")).toHaveTextContent("Logged In");
  });

  it("should set isLoggedIn to true and store token in localStorage on login", async () => {
    localStorageMock.getItem.mockReturnValue(null);
    renderWithAuth();
    fireEvent.click(screen.getByText("Login"));
    await waitFor(() => {
      expect(screen.getByTestId("login-status")).toHaveTextContent("Logged In");
    });
    expect(localStorageMock.setItem).toHaveBeenCalledWith(
      "token",
      "test-token"
    );
  });

  it("should set isLoggedIn to false, remove token from localStorage, and navigate to login on logout", async () => {
    localStorageMock.getItem.mockReturnValue("fake-token");
    renderWithAuth();
    fireEvent.click(screen.getByText("Logout"));
    await waitFor(() => {
      expect(screen.getByTestId("login-status")).toHaveTextContent(
        "Logged Out"
      );
    });
    expect(localStorageMock.removeItem).toHaveBeenCalledWith("token");
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });
});
