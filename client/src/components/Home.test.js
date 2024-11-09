import React from "react";
import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import Home from "./Home";

// Mock the Header component
jest.mock("./Header", () => {
  return function DummyHeader() {
    return <div data-testid="header">Header</div>;
  };
});

// Mock the Spinner component
jest.mock("./Spinner", () => {
  return function DummySpinner({ loading }) {
    return loading ? <div data-testid="spinner">Loading...</div> : null;
  };
});

// Mock Image loading behavior
const mockImage = {
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
};

// Store the original Image constructor
const originalImage = window.Image;

describe("Home Component", () => {
  beforeEach(() => {
    // Reset mock image
    mockImage.addEventListener.mockClear();
    mockImage.removeEventListener.mockClear();

    // Mock the Image constructor
    window.Image = jest.fn(() => mockImage);
  });

  afterEach(() => {
    // Restore original Image constructor
    window.Image = originalImage;
  });

  test("shows spinner while loading", () => {
    render(<Home />);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  test("renders full content after image loads", () => {
    render(<Home />);

    // Simulate image load complete
    act(() => {
      const loadHandler = mockImage.addEventListener.mock.calls.find(
        (call) => call[0] === "load"
      )[1];
      loadHandler();
    });

    expect(screen.getByTestId("header")).toBeInTheDocument();
    const welcomeText = screen.getByText(
      /Welcome! We're a collection of musos/
    );
    expect(welcomeText).toBeInTheDocument();
  });

  test("handles image load error gracefully", () => {
    render(<Home />);

    // Simulate image load error
    act(() => {
      const errorHandler = mockImage.addEventListener.mock.calls.find(
        (call) => call[0] === "error"
      )[1];
      errorHandler();
    });

    // Should still show content even if image fails to load
    expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();
    expect(screen.getByTestId("header")).toBeInTheDocument();
    const welcomeText = screen.getByText(
      /Welcome! We're a collection of musos/
    );
    expect(welcomeText).toBeInTheDocument();
  });

  test("cleans up event listeners on unmount", () => {
    const { unmount } = render(<Home />);
    unmount();

    expect(mockImage.removeEventListener).toHaveBeenCalledWith(
      "load",
      expect.any(Function)
    );
    expect(mockImage.removeEventListener).toHaveBeenCalledWith(
      "error",
      expect.any(Function)
    );
  });
});
