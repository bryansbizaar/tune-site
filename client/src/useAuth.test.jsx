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
      <button onClick={() => login("test-token")}>Login Default</button>
      <button onClick={() => login("test-token", "365d")}>
        Login Extended
      </button>
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
    // Clear timezone-related issues by using a fixed date
    jest.useFakeTimers();
    jest.setSystemTime(new Date("2024-01-01"));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should initialize with isLoggedIn false when no token exists", () => {
    localStorageMock.getItem.mockReturnValue(null);
    renderWithAuth();
    expect(screen.getByTestId("login-status")).toHaveTextContent("Logged Out");
  });

  it("should initialize with isLoggedIn true when valid token exists", () => {
    const futureTime = new Date().getTime() + 24 * 60 * 60 * 1000; // 1 day in future
    localStorageMock.getItem
      .mockReturnValueOnce("fake-token") // for token
      .mockReturnValueOnce(futureTime.toString()); // for expiry

    renderWithAuth();
    expect(screen.getByTestId("login-status")).toHaveTextContent("Logged In");
  });

  it("should initialize with isLoggedIn false when token is expired", () => {
    const pastTime = new Date().getTime() - 1000; // 1 second in past
    localStorageMock.getItem
      .mockReturnValueOnce("fake-token")
      .mockReturnValueOnce(pastTime.toString());

    renderWithAuth();
    expect(screen.getByTestId("login-status")).toHaveTextContent("Logged Out");
    expect(localStorageMock.removeItem).toHaveBeenCalledWith("token");
    expect(localStorageMock.removeItem).toHaveBeenCalledWith("tokenExpiry");
  });

  it("should set correct expiry time for default login (1 day)", async () => {
    renderWithAuth();
    fireEvent.click(screen.getByText("Login Default"));

    const expectedExpiry = new Date().getTime() + 24 * 60 * 60 * 1000;

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "token",
        "test-token"
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "tokenExpiry",
        expectedExpiry.toString()
      );
      expect(screen.getByTestId("login-status")).toHaveTextContent("Logged In");
    });
  });

  it("should set correct expiry time for extended login (365 days)", async () => {
    renderWithAuth();
    fireEvent.click(screen.getByText("Login Extended"));

    const expectedExpiry = new Date().getTime() + 365 * 24 * 60 * 60 * 1000;

    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "token",
        "test-token"
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        "tokenExpiry",
        expectedExpiry.toString()
      );
      expect(screen.getByTestId("login-status")).toHaveTextContent("Logged In");
    });
  });

  it("should clear token and expiry on logout", async () => {
    localStorageMock.getItem.mockReturnValue("fake-token");
    renderWithAuth();
    fireEvent.click(screen.getByText("Logout"));

    await waitFor(() => {
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("token");
      expect(localStorageMock.removeItem).toHaveBeenCalledWith("tokenExpiry");
      expect(mockNavigate).toHaveBeenCalledWith("/");
      expect(screen.getByTestId("login-status")).toHaveTextContent(
        "Logged Out"
      );
    });
  });

  it("should handle missing expiry time for existing token", () => {
    localStorageMock.getItem
      .mockReturnValueOnce("fake-token") // token exists
      .mockReturnValueOnce(null); // but no expiry time

    renderWithAuth();
    expect(screen.getByTestId("login-status")).toHaveTextContent("Logged Out");
    expect(localStorageMock.removeItem).toHaveBeenCalledWith("token");
  });
});
