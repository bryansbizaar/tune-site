import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import TuneList from "./TuneList";
import { useAuth } from "../useAuth";

// Mock child components
jest.mock("./Header", () => () => <div data-testid="header">Header</div>);
jest.mock(
  "./Spinner",
  () =>
    ({ loading }) =>
      loading ? <div data-testid="loading-spinner">Loading...</div> : null
);
jest.mock("./TuneDisplay", () => ({ tunesOfTheWeek, upNextTunes }) => (
  <div data-testid="tune-display">
    <div>Tunes of the week: {tunesOfTheWeek.length}</div>
    <div>Up next tunes: {upNextTunes.length}</div>
  </div>
));
jest.mock("./SpotifyMusicPlayer", () => ({ spotifyPlaylistId }) => (
  <div data-testid="spotify-player">Playlist: {spotifyPlaylistId}</div>
));

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

// Mock useAuth hook
jest.mock("../useAuth", () => ({
  useAuth: jest.fn(),
}));

// Mock useNavigate
const mockNavigate = jest.fn();
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useNavigate: () => mockNavigate,
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
    mockNavigate.mockClear();
    useAuth.mockReturnValue({ isLoggedIn: false });
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter>
        <TuneList />
      </MemoryRouter>
    );
  };

  test("displays loading spinner while loading", () => {
    jest
      .requireMock("../hooks/useImageLoader")
      .useImageLoader.mockReturnValue(true);
    fetch.mockImplementationOnce(() => new Promise(() => {}));

    renderComponent();
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  test("displays error message when fetch fails", async () => {
    jest
      .requireMock("../hooks/useImageLoader")
      .useImageLoader.mockReturnValue(false);
    fetch.mockRejectedValueOnce(new Error("API Error"));

    renderComponent();
    await waitFor(() => {
      expect(screen.getByTestId("error-message")).toHaveTextContent(
        "Error: API Error"
      );
    });
  });

  test("displays message when no tunes are available", async () => {
    jest
      .requireMock("../hooks/useImageLoader")
      .useImageLoader.mockReturnValue(false);
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });

    renderComponent();
    await waitFor(() => {
      expect(screen.getByTestId("no-tunes-message")).toBeInTheDocument();
    });
  });

  test("renders tune list correctly when both loading states are complete", async () => {
    jest
      .requireMock("../hooks/useImageLoader")
      .useImageLoader.mockReturnValue(false);
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTunes),
    });

    renderComponent();

    await waitFor(() => {
      // Header text
      expect(screen.getByText("Session Class Tunes")).toBeInTheDocument();
      expect(screen.getByText("Session Class Repertoire:")).toBeInTheDocument();

      // Tune titles and descriptions
      mockTunes.forEach((tune) => {
        const tuneElement = screen.getByText(tune.title);
        expect(tuneElement).toBeInTheDocument();
        expect(screen.getByText(`: ${tune.description}`)).toBeInTheDocument();
      });

      // Check TuneDisplay component
      const tuneDisplay = screen.getByTestId("tune-display");
      expect(tuneDisplay).toHaveTextContent("Tunes of the week: 1");
      expect(tuneDisplay).toHaveTextContent("Up next tunes: 1");

      // Check Spotify player
      const spotifyPlayer = screen.getByTestId("spotify-player");
      expect(spotifyPlayer).toHaveTextContent(
        "Playlist: 3PoOBseX7VUjZZXb4ij42D"
      );
    });
  });

  describe("Authentication behavior", () => {
    beforeEach(() => {
      jest
        .requireMock("../hooks/useImageLoader")
        .useImageLoader.mockReturnValue(false);
      fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTunes),
      });
    });

    test("shows login required message when clicking internal tune link while logged out", async () => {
      useAuth.mockReturnValue({ isLoggedIn: false });
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText("Tune A")).toBeInTheDocument();
      });

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
    });

    test("allows navigation to tune details when logged in", async () => {
      useAuth.mockReturnValue({ isLoggedIn: true });
      renderComponent();

      await waitFor(() => {
        expect(screen.getByText("Tune A")).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText("Tune A"));
      expect(mockNavigate).toHaveBeenCalledWith("/tune/1");
    });

    test("external links work regardless of login status", async () => {
      useAuth.mockReturnValue({ isLoggedIn: false });
      renderComponent();

      await waitFor(() => {
        const externalLink = screen.getByText("Tune C");
        expect(externalLink).toHaveAttribute("href", "https://example.com");
        expect(externalLink).toHaveAttribute("target", "_blank");
        expect(externalLink).toHaveAttribute("rel", "noopener noreferrer");
      });
    });
  });
});
