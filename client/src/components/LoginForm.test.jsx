import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import LoginForm from "./LoginForm";

// Mock the environment utility
jest.mock("../env", () => ({
  VITE_API_URL: "http://localhost:3000",
}));

// Mock the useAuth hook
jest.mock("../useAuth", () => ({
  useAuth: () => ({
    isLoggedIn: false,
    login: jest.fn(),
    logout: jest.fn(),
  }),
}));

// Mock react-router-dom's useNavigate hook
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ success: true }),
  })
);

describe("LoginForm", () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test("renders LoginForm component", () => {
    render(<LoginForm />);
    expect(screen.getByText("Login")).toBeInTheDocument();
  });

  test("renders email and password input fields", () => {
    render(<LoginForm />);
    expect(screen.getByLabelText("Email:")).toBeInTheDocument();
    expect(screen.getByLabelText("Password:")).toBeInTheDocument();
  });

  test("shows error message when submitting empty form", async () => {
    render(<LoginForm />);
    const form = screen.getByTestId("login-form");

    fireEvent.submit(form);

    await waitFor(() => {
      const errorMessage = screen.queryByTestId("error-message");
      expect(errorMessage).toHaveTextContent(
        "Please enter both email and password"
      );
    });
  });

  test("updates input values when typing", () => {
    render(<LoginForm />);
    const emailInput = screen.getByLabelText("Email:");
    const passwordInput = screen.getByLabelText("Password:");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    expect(emailInput.value).toBe("test@example.com");
    expect(passwordInput.value).toBe("password123");
  });

  test("shows no error message when submitting form with both fields filled", async () => {
    render(<LoginForm />);
    const form = screen.getByTestId("login-form");
    const emailInput = screen.getByLabelText("Email:");
    const passwordInput = screen.getByLabelText("Password:");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.submit(form);

    await waitFor(() => {
      const errorMessage = screen.queryByTestId("error-message");
      expect(errorMessage).not.toBeInTheDocument();
    });
  });

  test("shows error message when submitting form with only email", async () => {
    render(<LoginForm />);
    const form = screen.getByTestId("login-form");
    const emailInput = screen.getByLabelText("Email:");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.submit(form);

    await waitFor(() => {
      const errorMessage = screen.queryByTestId("error-message");
      expect(errorMessage).toHaveTextContent("Please enter password");
    });
  });

  test("shows error message when submitting form with only password", async () => {
    render(<LoginForm />);
    const form = screen.getByTestId("login-form");
    const passwordInput = screen.getByLabelText("Password:");

    fireEvent.change(passwordInput, { target: { value: "password123" } });
    fireEvent.submit(form);

    await waitFor(() => {
      const errorMessage = screen.queryByTestId("error-message");
      expect(errorMessage).toHaveTextContent("Please enter email");
    });
  });

  test("disables submit button while form is submitting and re-enables after submission", async () => {
    render(<LoginForm />);
    const emailInput = screen.getByLabelText("Email:");
    const passwordInput = screen.getByLabelText("Password:");
    const submitButton = screen.getByTestId("submit-button");

    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent("Logging in...");

    await waitFor(
      () => {
        expect(submitButton).not.toBeDisabled();
        expect(submitButton).toHaveTextContent("Log In");
      },
      { timeout: 2000 }
    ); // Increase timeout to ensure async operations complete
  });
});
