import React from "react";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Navigation from "./Navigation";
import "@testing-library/jest-dom";
import { AuthProvider } from "../useAuth";

// Mock the environment utility
jest.mock("../env", () => ({
  VITE_API_URL: "http://localhost:5000",
}));

// Mock the AuthButton component
jest.mock("./AuthButton", () => {
  return function MockAuthButton() {
    return <button>Mock Auth Button</button>;
  };
});

// Mock react-router-dom
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => jest.fn(),
}));

const renderWithRouter = (ui, { route = "/" } = {}) => {
  window.history.pushState({}, "Test page", route);
  return render(
    <BrowserRouter>
      <AuthProvider>{ui}</AuthProvider>
    </BrowserRouter>
  );
};

describe("Navigation Component", () => {
  test("renders navigation links", () => {
    renderWithRouter(<Navigation />);

    expect(screen.getByText("Tunes")).toBeInTheDocument();
    expect(screen.getByText("Chords")).toBeInTheDocument();
    expect(screen.getByText("Resources")).toBeInTheDocument();
  });

  test("renders Facebook link with correct image", () => {
    renderWithRouter(<Navigation />);

    const fbLink = screen.getByRole("link", { name: /facebook logo/i });
    expect(fbLink).toHaveAttribute(
      "href",
      "https://www.facebook.com/groups/whangareifolkrootstraditionalmusic"
    );

    const fbImage = screen.getByAltText("facebook logo");
    expect(fbImage).toHaveAttribute(
      "src",
      "http://localhost:5000/images/facebook.png"
    );
  });

  test("renders AuthButton component", () => {
    renderWithRouter(<Navigation />);

    expect(screen.getByText("Mock Auth Button")).toBeInTheDocument();
  });
});
