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

jest.mock("../assets/images/instruments.jpg", () => "instruments.jpg");

describe("Home Component", () => {
  test("renders Header component with isFixed prop", () => {
    render(<Home />);
    const headerElement = screen.getByTestId("header");
    expect(headerElement).toBeInTheDocument();
  });

  test("renders instruments image", () => {
    render(<Home />);
    const imageElement = screen.getByAltText("instruments");
    expect(imageElement).toBeInTheDocument();
    expect(imageElement).toHaveAttribute("src", "instruments.jpg");
  });

  test("renders welcome text", () => {
    render(<Home />);
    const welcomeText = screen.getByText(/Welcome!/i);
    expect(welcomeText).toBeInTheDocument();
  });
});
