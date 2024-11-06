// import React from "react";
// import { render, screen } from "@testing-library/react";
// import "@testing-library/jest-dom";
// import Resources from "./Resources";

// // Mock the Header component
// jest.mock("./Header", () => {
//   return function DummyHeader() {
//     return <div data-testid="header">Header</div>;
//   };
// });

// // Mock the VITE_API_URL
// jest.mock("../env.js", () => ({
//   VITE_API_URL: "http://localhost:5000",
// }));

// describe("Resources Component", () => {
//   beforeEach(() => {
//     render(<Resources />);
//   });

//   test("renders Header component", () => {
//     expect(screen.getByTestId("header")).toBeInTheDocument();
//   });

//   test("renders the resources text", () => {
//     expect(
//       screen.getByText(/There are many great places to learn tunes online/i)
//     ).toBeInTheDocument();
//   });

//   test("renders and checks a specific link", () => {
//     const link = screen.getByText("NZ Irish Sessions");
//     expect(link).toBeInTheDocument();
//     expect(link).toHaveAttribute("href", "https://irish.session.nz/");
//     expect(link).toHaveAttribute("target", "_blank");
//     expect(link).toHaveAttribute("rel", "noopener noreferrer");
//   });
// });

import React from "react";
import { render, screen, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import Resources from "./Resources";

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

describe("Resources Component", () => {
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

  // Original tests updated to work with loading state
  test("renders Header component after loading", () => {
    render(<Resources />);
    // Simulate image load complete
    act(() => {
      const loadHandler = mockImage.addEventListener.mock.calls.find(
        (call) => call[0] === "load"
      )[1];
      loadHandler();
    });

    expect(screen.getByTestId("header")).toBeInTheDocument();
  });

  test("renders the resources text after loading", () => {
    render(<Resources />);
    // Simulate image load complete
    act(() => {
      const loadHandler = mockImage.addEventListener.mock.calls.find(
        (call) => call[0] === "load"
      )[1];
      loadHandler();
    });

    expect(
      screen.getByText(/There are many great places to learn tunes online/i)
    ).toBeInTheDocument();
  });

  test("renders and checks a specific link after loading", () => {
    render(<Resources />);
    // Simulate image load complete
    act(() => {
      const loadHandler = mockImage.addEventListener.mock.calls.find(
        (call) => call[0] === "load"
      )[1];
      loadHandler();
    });

    const link = screen.getByText("NZ Irish Sessions");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "https://irish.session.nz/");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  // New tests for loading behavior
  test("shows spinner while loading", () => {
    render(<Resources />);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  test("removes spinner after image loads", () => {
    render(<Resources />);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();

    // Simulate image load complete
    act(() => {
      const loadHandler = mockImage.addEventListener.mock.calls.find(
        (call) => call[0] === "load"
      )[1];
      loadHandler();
    });

    expect(screen.queryByTestId("spinner")).not.toBeInTheDocument();
  });

  test("handles image load error gracefully", () => {
    render(<Resources />);
    expect(screen.getByTestId("spinner")).toBeInTheDocument();

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
    expect(
      screen.getByText(/There are many great places to learn tunes online/i)
    ).toBeInTheDocument();
  });

  test("cleans up event listeners on unmount", () => {
    const { unmount } = render(<Resources />);
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
