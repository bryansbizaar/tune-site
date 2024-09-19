import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import Resources from "./Resources";

// Mock the Header component
jest.mock("./Header", () => {
  return function DummyHeader() {
    return <div data-testid="header">Header</div>;
  };
});

// Mock the VITE_API_URL
jest.mock("../env.js", () => ({
  VITE_API_URL: "http://localhost:5000",
}));

describe("Resources Component", () => {
  beforeEach(() => {
    render(<Resources />);
  });

  test("renders Header component", () => {
    expect(screen.getByTestId("header")).toBeInTheDocument();
  });

  test("renders the resources text", () => {
    expect(
      screen.getByText(/There are many great places to learn tunes online/i)
    ).toBeInTheDocument();
  });

  test("renders and checks a specific link", () => {
    const link = screen.getByText("NZ Irish Sessions");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "https://irish.session.nz/");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });
});
