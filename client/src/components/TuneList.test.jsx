import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import TuneList from "./TuneList";
import { useAuth } from "../useAuth";

// Mock apiTest
jest.mock("../utils/apiTest", () => ({
  testApiConnection: jest.fn().mockResolvedValue({ success: true, data: [] }),
}));

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

  test("displays loading state initially", () => {
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

  test("displays message when no tunes are available", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve([]),
    });
    renderComponent();
    await waitFor(() => {
      expect(screen.getByTestId("no-tunes-message")).toBeInTheDocument();
    });
  });

  test("renders tune list correctly", async () => {
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

  // describe("Authentication behavior", () => {
  //   beforeEach(() => {
  //     fetch.mockResolvedValueOnce({
  //       ok: true,
  //       json: () => Promise.resolve(mockTunes),
  //     });
  //   });

  //   test("shows login required message when clicking internal tune link while logged out", async () => {
  //     // Mock user as logged out
  //     useAuth.mockReturnValue({ isLoggedIn: false });

  //     // Render component
  //     renderComponent();

  //     // Wait for tunes to load
  //     await waitFor(() => {
  //       expect(screen.getByText("Tune A")).toBeInTheDocument();
  //     });

  //     // Click the internal tune link
  //     fireEvent.click(screen.getByText("Tune A"));

  //     // Check if login message appears
  //     expect(screen.getByText("(login required)")).toBeInTheDocument();

  //     // Verify the message disappears after 3 seconds
  //     await waitFor(
  //       () => {
  //         expect(
  //           screen.queryByText("(login required)")
  //         ).not.toBeInTheDocument();
  //       },
  //       { timeout: 3500 }
  //     );
  //   });

  //   test("allows navigation to tune details when logged in", async () => {
  //     // Mock user as logged in
  //     useAuth.mockReturnValue({ isLoggedIn: true });

  //     // Mock window.location.href
  //     const originalLocation = window.location;
  //     delete window.location;
  //     window.location = { href: jest.fn() };

  //     // Render component
  //     renderComponent();

  //     // Wait for tunes to load
  //     await waitFor(() => {
  //       expect(screen.getByText("Tune A")).toBeInTheDocument();
  //     });

  //     // Click the internal tune link
  //     fireEvent.click(screen.getByText("Tune A"));

  //     // Verify navigation occurred
  //     expect(window.location.href).toBe("/tune/1");

  //     // Cleanup
  //     window.location = originalLocation;
  //   });

  //   test("external links work regardless of login status", async () => {
  //     // Mock user as logged out
  //     useAuth.mockReturnValue({ isLoggedIn: false });

  //     renderComponent();

  //     await waitFor(() => {
  //       const externalLink = screen.getByText("Tune C");
  //       expect(externalLink).toHaveAttribute("href", "https://example.com");
  //       expect(externalLink).toHaveAttribute("target", "_blank");
  //     });
  //   });
  // });

  describe("Authentication behavior", () => {
    beforeEach(() => {
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
      });
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
