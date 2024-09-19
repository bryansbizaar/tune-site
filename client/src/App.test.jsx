import React from "react";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom";
import App from "./App";

// Mock all the components
jest.mock("./components/Home", () => () => (
  <div data-testid="home">Home Component</div>
));
jest.mock("./components/TuneList", () => () => (
  <div data-testid="tune-list">TuneList Component</div>
));
jest.mock("./components/TuneDetail", () => () => (
  <div data-testid="tune-detail">TuneDetail Component</div>
));
jest.mock("./components/ChordList", () => () => (
  <div data-testid="chord-list">ChordList Component</div>
));
jest.mock("./components/ChordDetail", () => () => (
  <div data-testid="chord-detail">ChordDetail Component</div>
));
jest.mock("./components/Resources", () => () => (
  <div data-testid="resources">Resources Component</div>
));

describe("App Component", () => {
  const renderWithRouter = (route) => {
    return render(
      <MemoryRouter initialEntries={[route]}>
        <App />
      </MemoryRouter>
    );
  };

  test("renders Home component for / route", () => {
    renderWithRouter("/");
    expect(screen.getByTestId("home")).toBeInTheDocument();
  });

  test("renders TuneList component for /tuneList route", () => {
    renderWithRouter("/tuneList");
    expect(screen.getByTestId("tune-list")).toBeInTheDocument();
  });

  test("renders TuneDetail component for /tune/:id route", () => {
    renderWithRouter("/tune/1");
    expect(screen.getByTestId("tune-detail")).toBeInTheDocument();
  });

  test("renders ChordList component for /chords route", () => {
    renderWithRouter("/chords");
    expect(screen.getByTestId("chord-list")).toBeInTheDocument();
  });

  test("renders ChordDetail component for /chords/:id route", () => {
    renderWithRouter("/chords/1");
    expect(screen.getByTestId("chord-detail")).toBeInTheDocument();
  });

  test("renders Resources component for /resources route", () => {
    renderWithRouter("/resources");
    expect(screen.getByTestId("resources")).toBeInTheDocument();
  });

  test("renders Not Found for unknown route", () => {
    renderWithRouter("/unknown");
    expect(screen.getByText("Not Found")).toBeInTheDocument();
  });
});
