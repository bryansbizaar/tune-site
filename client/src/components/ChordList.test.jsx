import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import ChordList from "./ChordList";
import { useAuth } from "../useAuth";

// Mock child components
jest.mock("./Header", () => () => <div data-testid="header">Header</div>);
jest.mock(
  "./Spinner",
  () =>
    ({ loading }) =>
      loading ? <div data-testid="loading-spinner">Loading...</div> : null
);

// Mock the image loading hook
jest.mock("../hooks/useImageLoader", () => ({
  useImageLoader: jest.fn(() => false),
}));

// Mock the API_URL
jest.mock("../env", () => ({
  VITE_API_URL: "http://localhost:3000",
}));

// Mock the sorting utility
jest.mock("../utils/sorting", () => ({
  sortTunes: (tunes) => tunes.sort((a, b) => a.title.localeCompare(b.title)),
}));

// Mock useAuth hook with default value
jest.mock("../useAuth", () => ({
  useAuth: jest.fn(),
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
    useAuth.mockReturnValue({ isLoggedIn: false });
    jest
      .requireMock("../hooks/useImageLoader")
      .useImageLoader.mockReturnValue(false);
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <ChordList />
      </MemoryRouter>
    );
  };

  test("displays loading spinner while loading", () => {
    // Mock both image loading and data fetching
    jest
      .requireMock("../hooks/useImageLoader")
      .useImageLoader.mockReturnValue(true);
    fetch.mockImplementationOnce(() => new Promise(() => {}));

    renderComponent();
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
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

  test("renders chord list correctly when loading is complete", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTunes),
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Chords")).toBeInTheDocument();
      expect(screen.getByText("Tune A")).toBeInTheDocument();
      expect(screen.getByText("Tune C")).toBeInTheDocument();
      expect(screen.queryByText("Tune B")).not.toBeInTheDocument(); // Should not show tunes without chords
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

  describe("Authentication behavior", () => {
    beforeEach(() => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTunes),
      });
    });

    test("shows login required message when clicking chord link while logged out", async () => {
      useAuth.mockReturnValue({ isLoggedIn: false });
      const { container } = renderComponent();

      await waitFor(() => {
        expect(screen.getByText("Tune A")).toBeInTheDocument();
      });

      // Mock window.location.href
      const originalLocation = window.location;
      delete window.location;
      window.location = { href: jest.fn() };

      fireEvent.click(screen.getByText("Tune A"));
      expect(screen.getByText("(login required)")).toBeInTheDocument();

      await waitFor(
        () => {
          expect(
            screen.queryByText("(login required)")
          ).not.toBeInTheDocument();
        },
        { timeout: 3500 }
      );

      // Restore window.location
      window.location = originalLocation;
    });

    test("allows navigation to chord details when logged in", async () => {
      useAuth.mockReturnValue({ isLoggedIn: true });

      // Mock window.location.href
      const originalLocation = window.location;
      delete window.location;
      window.location = { href: jest.fn() };

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText("Tune A")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Tune A"));
      expect(window.location.href).toBe("/chords/1");

      // Restore window.location
      window.location = originalLocation;
    });
  });

  describe("Loading states", () => {
    test("shows spinner while image is loading even if data is ready", async () => {
      jest
        .requireMock("../hooks/useImageLoader")
        .useImageLoader.mockReturnValue(true);
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTunes),
      });

      renderComponent();
      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    });

    test("shows spinner while data is loading even if image is ready", async () => {
      jest
        .requireMock("../hooks/useImageLoader")
        .useImageLoader.mockReturnValue(false);
      fetch.mockImplementationOnce(() => new Promise(() => {}));

      renderComponent();
      expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    });

    test("removes spinner when both image and data are loaded", async () => {
      jest
        .requireMock("../hooks/useImageLoader")
        .useImageLoader.mockReturnValue(false);
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTunes),
      });

      renderComponent();

      await waitFor(() => {
        expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
      });
    });
  });

  test("handles failed fetch gracefully", async () => {
    fetch.mockRejectedValueOnce(new Error("Failed to fetch tune data"));
    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "Error: Failed to fetch tune data"
      );
    });
  });
});
