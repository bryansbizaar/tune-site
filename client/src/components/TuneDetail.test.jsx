import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter } from "react-router-dom";
import TuneDetail from "./TuneDetail";

// Simplify mocks
jest.mock("./Header", () => () => <div data-testid="header">Header</div>);
jest.mock("./Spinner", () => () => <div data-testid="spinner">Loading...</div>);
jest.mock("./SpotifyMusicPlayer", () => ({ spotifyTrackId }) => (
  <div data-testid="spotify-player">{spotifyTrackId}</div>
));
jest.mock("./YouTubePlayer", () => ({ youtubeTrackId }) => (
  <div data-testid="youtube-player">{youtubeTrackId}</div>
));

// Mock router
jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ id: "1" }),
}));

// Mock env
jest.mock("../env", () => ({
  VITE_API_URL: "http://localhost:5000",
}));

describe("TuneDetail Component", () => {
  const mockTune = {
    id: "1",
    title: "Test Tune",
    description: "This is a test tune",
    sheetMusicFile: "/sheet-music/test-tune.png",
    chords: true,
    spotifyTrackId: "spotify123",
  };

  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderTuneDetail = () => {
    return render(
      <MemoryRouter>
        <TuneDetail />
      </MemoryRouter>
    );
  };

  test("shows loading state initially", () => {
    // Mock fetch to never resolve
    global.fetch.mockImplementation(() => new Promise(() => {}));

    renderTuneDetail();

    expect(screen.getByTestId("spinner")).toBeInTheDocument();
  });

  test("shows error state on fetch failure", async () => {
    // Mock fetch to fail
    global.fetch.mockRejectedValueOnce(new Error("Failed to fetch"));

    renderTuneDetail();

    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
    });
  });

  test("shows tune not found when no tune data", async () => {
    // Mock fetch to return null
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(null),
    });

    renderTuneDetail();

    await waitFor(() => {
      expect(screen.getByText("No tune found")).toBeInTheDocument();
    });
  });

  test("shows tune details on successful fetch", async () => {
    // Mock successful fetch
    global.fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTune),
    });

    renderTuneDetail();

    await waitFor(() => {
      // Check basic elements are rendered
      expect(screen.getByText(mockTune.description)).toBeInTheDocument();
      expect(screen.getByText("Click to show chords")).toBeInTheDocument();
      expect(screen.getByTestId("spotify-player")).toBeInTheDocument();
    });
  });
});
