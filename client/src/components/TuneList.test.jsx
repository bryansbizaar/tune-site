import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import TuneList from "./TuneList";

// Mock child components
jest.mock("./Header", () => () => <div data-testid="header">Header</div>);
jest.mock("./TuneDisplay", () => ({ tunesOfTheWeek, upNextTunes }) => (
  <div data-testid="tune-display">
    <div>Tunes of the week: {tunesOfTheWeek.length}</div>
    <div>Up next tunes: {upNextTunes.length}</div>
  </div>
));
jest.mock("./SpotifyMusicPlayer", () => ({ spotifyPlaylistId }) => (
  <div data-testid="spotify-player">Playlist: {spotifyPlaylistId}</div>
));

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

describe("TuneList Component", () => {
  const mockTunes = [
    {
      id: "1",
      title: "Tune A",
      description: "Description A",
      tunesOfTheWeek: true,
      upNextTunes: false,
    },
    {
      id: "2",
      title: "Tune B",
      description: "Description B",
      tunesOfTheWeek: false,
      upNextTunes: true,
    },
    {
      id: "3",
      title: "Tune C",
      description: "Description C",
      tunesOfTheWeek: false,
      upNextTunes: false,
      hasExternalLink: true,
      externalLinkUrl: "https://example.com",
    },
  ];

  beforeEach(() => {
    fetch.mockClear();
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <TuneList />
      </MemoryRouter>
    );
  };

  test("displays loading state initially", async () => {
    let resolvePromise;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    fetch.mockImplementationOnce(() => promise);

    render(
      <MemoryRouter>
        <TuneList />
      </MemoryRouter>
    );

    expect(screen.getByTestId("loading-indicator")).toBeInTheDocument();

    resolvePromise({
      ok: true,
      json: () => Promise.resolve([]),
    });

    await waitFor(() => {
      expect(screen.queryByTestId("loading-indicator")).not.toBeInTheDocument();
    });
  });

  test("displays error message when fetch fails", async () => {
    fetch.mockRejectedValueOnce(new Error("API Error"));

    render(
      <MemoryRouter>
        <TuneList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "Error: API Error"
      );
    });
  });

  test("displays message when no tunes are available", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

    render(
      <MemoryRouter>
        <TuneList />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId("no-tunes-message")).toBeInTheDocument();
    });
  });

  test("displays error message when fetch fails", async () => {
    fetch.mockRejectedValueOnce(new Error("API Error"));
    renderComponent();
    expect(await screen.findByText(/Error: API Error/)).toBeInTheDocument();
  });

  test("renders tune list correctly", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTunes),
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Session Class Tunes")).toBeInTheDocument();
      expect(screen.getByText("Session Class Repertoire:")).toBeInTheDocument();

      const tuneAElement = screen.getByText("Tune A");
      expect(tuneAElement).toBeInTheDocument();
      expect(tuneAElement.nextSibling.textContent).toBe(": Description A");

      const tuneBElement = screen.getByText("Tune B");
      expect(tuneBElement).toBeInTheDocument();
      expect(tuneBElement.nextSibling.textContent).toBe(": Description B");

      const tuneCElement = screen.getByText("Tune C");
      expect(tuneCElement).toBeInTheDocument();
      expect(tuneCElement.nextSibling.textContent).toBe(": Description C");
    });
  });

  test("renders TuneDisplay with correct props", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTunes),
    });

    renderComponent();

    await waitFor(() => {
      const tuneDisplay = screen.getByTestId("tune-display");
      expect(tuneDisplay).toHaveTextContent("Tunes of the week: 1");
      expect(tuneDisplay).toHaveTextContent("Up next tunes: 1");
    });
  });

  test("renders external links correctly", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTunes),
    });

    renderComponent();

    await waitFor(() => {
      const externalLink = screen.getByText("Tune C");
      expect(externalLink).toHaveAttribute("href", "https://example.com");
      expect(externalLink).toHaveAttribute("target", "_blank");
      expect(externalLink).toHaveAttribute("rel", "noopener noreferrer");
    });
  });

  test("renders internal links correctly", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTunes),
    });

    renderComponent();

    await waitFor(() => {
      const internalLink = screen.getByText("Tune A");
      expect(internalLink).toHaveAttribute("href", "/tune/1");
    });
  });

  test("renders Spotify player with correct playlist ID", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTunes),
    });

    renderComponent();

    await waitFor(() => {
      const spotifyPlayer = screen.getByTestId("spotify-player");
      expect(spotifyPlayer).toHaveTextContent(
        "Playlist: 3PoOBseX7VUjZZXb4ij42D"
      );
    });
  });
});
