import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import TuneDetail from "./TuneDetail";

// Mock child components
jest.mock("./Header", () => () => <div data-testid="header">Header</div>);
jest.mock("./SpotifyMusicPlayer", () => ({ spotifyTrackId }) => (
  <div data-testid="spotify-player">{spotifyTrackId}</div>
));
jest.mock("./YouTubePlayer", () => ({ youtubeTrackId }) => (
  <div data-testid="youtube-player">{youtubeTrackId}</div>
));
jest.mock("./Spinner", () => {
  return function DummySpinner({ loading }) {
    if (!loading) return null;
    return <div data-testid="loading-spinner">Loading...</div>;
  };
});

// Mock router hook
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ id: "1" }),
}));

// Mock environment variable
jest.mock("../env", () => ({
  VITE_API_URL: "http://localhost:5000",
}));

describe("TuneDetail Component", () => {
  // Sample tune data for testing
  const mockTune = {
    id: "1",
    title: "Test Tune",
    description: "Test tune description",
    sheetMusicFile: "/sheet-music/test-tune.png",
    versions: ["/sheet-music/version2.png", "/sheet-music/version3.png"],
    versionDescriptions: ["Version 2 description", "Version 3 description"],
    chords: true,
    spotifyTrackId: "spotify123",
    youtubeTrackId: "youtube456",
  };

  // Mock the Image constructor
  beforeAll(() => {
    global.Image = class {
      constructor() {
        setTimeout(() => {
          this.onload && this.onload();
        }, 0);
      }
    };
  });

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter initialEntries={["/tune/1"]}>
        <Routes>
          <Route path="/tune/:id" element={<TuneDetail />} />
        </Routes>
      </MemoryRouter>
    );
  };

  test("shows loading spinner initially", () => {
    global.fetch.mockImplementationOnce(() => new Promise(() => {}));
    renderComponent();
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  test("makes request to correct API endpoint", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTune),
    });

    renderComponent();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "http://localhost:5000/api/tune/1"
      );
    });
  });

  test("displays error message when fetch fails", async () => {
    const errorMessage = "Failed to fetch tune data";
    global.fetch.mockRejectedValueOnce(new Error(errorMessage));

    renderComponent();

    await waitFor(() => {
      const errorElement = screen.getByTestId("error-message");
      expect(errorElement).toBeInTheDocument();
      expect(errorElement).toHaveTextContent(`Error: ${errorMessage}`);
    });
  });

  test("shows 'No tune found' when no tune data is returned", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(null),
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId("no-tune-message")).toHaveTextContent(
        "No tune found"
      );
    });
  });

  test("renders tune details correctly after loading", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTune),
    });

    renderComponent();

    await waitFor(() => {
      // Check header
      expect(screen.getByTestId("header")).toBeInTheDocument();

      // Check description
      expect(screen.getByTestId("tune-description")).toHaveTextContent(
        mockTune.description
      );

      // Check chords link
      expect(screen.getByTestId("chords-link")).toHaveTextContent(
        "Click to show chords"
      );

      // Check main sheet music
      const mainImage = screen.getByTestId("main-sheet-music");
      expect(mainImage).toBeInTheDocument();
      expect(mainImage).toHaveAttribute(
        "src",
        `http://localhost:5000${mockTune.sheetMusicFile}`
      );

      // Check version descriptions
      expect(screen.getByTestId("version-description-2")).toHaveTextContent(
        mockTune.versionDescriptions[0]
      );
      expect(screen.getByTestId("version-description-3")).toHaveTextContent(
        mockTune.versionDescriptions[1]
      );

      // Check additional versions
      mockTune.versions.forEach((_, index) => {
        expect(screen.getByTestId(`version-${index + 2}`)).toBeInTheDocument();
      });

      // Check music players
      expect(screen.getByTestId("spotify-container")).toBeInTheDocument();
      expect(screen.getByTestId("youtube-container")).toBeInTheDocument();
    });
  });

  test("handles missing optional fields gracefully", async () => {
    const minimalTune = {
      id: "1",
      title: "Minimal Tune",
      sheetMusicFile: "/sheet-music/minimal.png",
    };

    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(minimalTune),
    });

    renderComponent();

    await waitFor(() => {
      // These should exist
      expect(screen.getByTestId("main-sheet-music")).toBeInTheDocument();

      // These should not exist
      expect(screen.queryByTestId("chords-link")).not.toBeInTheDocument();
      expect(screen.queryByTestId("tune-description")).not.toBeInTheDocument();
      expect(
        screen.queryByTestId("version-description-2")
      ).not.toBeInTheDocument();
      expect(screen.queryByTestId("spotify-container")).not.toBeInTheDocument();
      expect(screen.queryByTestId("youtube-container")).not.toBeInTheDocument();
    });
  });

  test("waits for all images to load before displaying", async () => {
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTune),
    });

    renderComponent();

    // Should show loading initially
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();

    // After images load, should show content
    await waitFor(() => {
      expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
      expect(screen.getByTestId("main-sheet-music")).toBeInTheDocument();
    });
  });
});
