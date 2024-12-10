import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import TuneDetail from "./TuneDetail";

// Mock the Header component
jest.mock("./Header", () => () => <div data-testid="header">Header</div>);

// Mocke the SpotifyMusicPlayer and YouTubePlayer components
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
  VITE_API_URL: "http://localhost:3000",
}));

// Mock the Spinner
jest.mock("./Spinner", () => {
  return function DummySpinner({ loading }) {
    if (!loading) return null;
    return (
      <div data-testid="loading-spinner">
        <div className="clip-loader">Loading...</div>
      </div>
    );
  };
});

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

  const renderComponent = () => {
    return render(
      <MemoryRouter initialEntries={["/tune/1"]}>
        <Routes>
          <Route path="/tune/:id" element={<TuneDetail />} />
        </Routes>
      </MemoryRouter>
    );
  };

  test("shows loading state initially", async () => {
    // First, mock a successful tune response
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockTune),
      })
    );

    let { container } = renderComponent();

    // Wait for the tune data to load and the image to be rendered
    await waitFor(() => {
      expect(screen.getByAltText(mockTune.title)).toBeInTheDocument();
    });

    // At this point, while the image is loading, we should see the spinner
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();

    // Simulate image load completion
    const img = screen.getByAltText(mockTune.title);
    fireEvent.load(img);

    // Spinner should disappear after image loads
    await waitFor(() => {
      expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
    });
  });

  test("shows error state on fetch failure", async () => {
    // Mock fetch to fail
    global.fetch.mockRejectedValueOnce(new Error("Failed to fetch"));

    renderComponent();

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

    renderComponent();

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

    renderComponent();

    await waitFor(() => {
      // Check basic elements are rendered
      expect(screen.getByText(mockTune.description)).toBeInTheDocument();
      expect(screen.getByText("Click to show chords")).toBeInTheDocument();
      expect(screen.getByTestId("spotify-player")).toBeInTheDocument();
    });
  });
});
