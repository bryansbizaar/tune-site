import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import LoginForm from "./LoginForm";

// Mock console.log to capture its output
const originalLog = console.log;
let consoleOutput = [];
const mockLog = (...args) => {
  consoleOutput.push(args.join(" "));
  originalLog(...args);
};

describe("LoginForm", () => {
  beforeEach(() => {
    consoleOutput = [];
    console.log = mockLog;
  });

  afterEach(() => {
    console.log = originalLog;
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

  test("clears error message when filling out fields after an error", async () => {
    render(<LoginForm />);
    const form = screen.getByTestId("login-form");
    const emailInput = screen.getByLabelText("Email:");
    const passwordInput = screen.getByLabelText("Password:");

    // Submit empty form to trigger error
    fireEvent.submit(form);

    await waitFor(() => {
      const errorMessage = screen.queryByTestId("error-message");
      expect(errorMessage).toBeInTheDocument();
    });

    // Fill out fields
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    // Submit form again
    fireEvent.submit(form);

    await waitFor(() => {
      const errorMessage = screen.queryByTestId("error-message");
      expect(errorMessage).not.toBeInTheDocument();
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
    ); // Increase timeout to account for the simulated API call
  });
});
