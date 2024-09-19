import React from "react";
import { render, screen } from "@testing-library/react";
import Home from "./Home";
import "@testing-library/jest-dom";

// Mock the Header component
jest.mock("./Header", () => {
  return function DummyHeader({ isFixed }) {
    return <div data-testid="header">Header Component</div>;
  };
});

// Mock the environment utility
jest.mock("../env", () => ({
  VITE_API_URL: "http://localhost:5000",
}));

describe("Home Component", () => {
  test("renders Header component with isFixed prop", () => {
    render(<Home />);
    const headerElement = screen.getByTestId("header");
    expect(headerElement).toBeInTheDocument();
  });

  test("renders instruments image with correct src", () => {
    render(<Home />);
    const imageElement = screen.getByAltText("instruments");
    expect(imageElement).toBeInTheDocument();
    expect(imageElement).toHaveAttribute(
      "src",
      "http://localhost:5000/images/instruments.jpg"
    );
  });

  test("renders welcome text", () => {
    render(<Home />);
    const welcomeText = screen.getByText(/Welcome!/i);
    expect(welcomeText).toBeInTheDocument();
  });
});
