import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import ChordList from "./ChordList";

// Mock child components
jest.mock("./Header", () => () => <div data-testid="header">Header</div>);

// Mock the API_URL
jest.mock("../env", () => ({
  VITE_API_URL: "http://localhost:5000",
}));

// Mock the sorting utility
jest.mock("../utils/sorting", () => ({
  sortTunes: (tunes) => tunes.sort((a, b) => a.title.localeCompare(b.title)),
}));

// Mock fetch
global.fetch = jest.fn();

describe("ChordList Component", () => {
  const mockTunes = [
    { id: "1", title: "Tune A", hasChords: true },
    { id: "2", title: "Tune B", hasChords: false },
    { id: "3", title: "Tune C", hasChords: true },
  ];

  beforeEach(() => {
    fetch.mockClear();
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <ChordList />
      </MemoryRouter>
    );
  };

  test("displays loading state initially", async () => {
    fetch.mockImplementationOnce(() => new Promise(() => {}));
    renderComponent();
    expect(screen.getByTestId("loading-indicator")).toBeInTheDocument();
  });

  test("displays error message when fetch fails", async () => {
    fetch.mockRejectedValueOnce(new Error("API Error"));
    renderComponent();
    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "Error: API Error"
      );
    });
  });

  test("displays message when no tunes with chords are available", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve([{ id: "1", title: "Tune A", hasChords: false }]),
    });
    renderComponent();
    await waitFor(() => {
      expect(screen.getByTestId("no-tunes-message")).toBeInTheDocument();
    });
  });

  test("renders chord list correctly", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTunes),
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Chords")).toBeInTheDocument();
      expect(screen.getByText("Tune A")).toBeInTheDocument();
      expect(screen.getByText("Tune C")).toBeInTheDocument();
      expect(screen.queryByText("Tune B")).not.toBeInTheDocument();
    });
  });

  test("renders links to chord pages correctly", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTunes),
    });

    renderComponent();

    await waitFor(() => {
      const tuneALink = screen.getByText("Tune A");
      expect(tuneALink).toHaveAttribute("href", "/chords/1");

      const tuneCLink = screen.getByText("Tune C");
      expect(tuneCLink).toHaveAttribute("href", "/chords/3");
    });
  });
});
