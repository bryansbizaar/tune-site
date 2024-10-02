import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Header from "./Header";
import "@testing-library/jest-dom";

// Mock the Navigation component
jest.mock("./Navigation", () => {
  return function DummyNavigation() {
    return <div data-testid="navigation">Navigation Component</div>;
  };
});

// Mock the useAuth hook
jest.mock("../useAuth", () => ({
  useAuth: () => ({
    isLoggedIn: false,
    logout: jest.fn(),
  }),
}));

const renderWithRouter = (ui, { route = "/" } = {}) => {
  window.history.pushState({}, "Test page", route);
  return render(ui, { wrapper: BrowserRouter });
};

describe("Header Component", () => {
  test("renders header with title", () => {
    renderWithRouter(<Header />);
    const titleElement = screen.getByText(/Whangarei Tunes/i);
    expect(titleElement).toBeInTheDocument();
  });

  test("renders Navigation component", () => {
    renderWithRouter(<Header />);
    const navigationElement = screen.getByTestId("navigation");
    expect(navigationElement).toBeInTheDocument();
  });

  test("applies fixed class when isFixed is true", () => {
    const { container } = renderWithRouter(<Header isFixed={true} />);
    const headerElement = container.querySelector(".header");
    expect(headerElement).toHaveClass("header-fixed");
  });

  test("does not apply fixed class when isFixed is false", () => {
    const { container } = renderWithRouter(<Header isFixed={false} />);
    const headerElement = container.querySelector(".header");
    expect(headerElement).not.toHaveClass("header-fixed");
  });

  test("title links to home page", () => {
    renderWithRouter(<Header />);
    const linkElement = screen.getByRole("link", { name: /Whangarei Tunes/i });
    expect(linkElement).toHaveAttribute("href", "/");
  });
});
