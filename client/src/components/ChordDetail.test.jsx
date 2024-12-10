import React from "react";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ChordDetail from "./ChordDetail";

// Mock the Header component
jest.mock("./Header", () => {
  return function DummyHeader() {
    return <div data-testid="header">Header</div>;
  };
});

// Mock the SpotifyMusicPlayer component
jest.mock("./SpotifyMusicPlayer", () => {
  return function DummySpotifyPlayer({ spotifyTrackId }) {
    return <div data-testid="spotify-player">{spotifyTrackId}</div>;
  };
});

// Mock the YouTubePlayer component
jest.mock("./YouTubePlayer", () => {
  return function DummyYouTubePlayer({ youtubeTrackId }) {
    return <div data-testid="youtube-player">{youtubeTrackId}</div>;
  };
});

// Mock the API_URL
jest.mock("../env.js", () => ({
  VITE_API_URL: "http://localhost:3000",
}));

// Mock fetch
global.fetch = jest.fn();

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

describe("ChordDetail Component", () => {
  const mockTune = {
    id: "1",
    title: "Test Tune",
    chordsDescription: "These are the chords for Test Tune",
    chords: "/chord-diagrams/test-tune-chords.png",
    spotifyTrackId: "spotify123",
    youtubeTrackId: "youtube456",
    sheetMusicFile: "/sheet-music/test-tune.png",
  };

  beforeEach(() => {
    fetch.mockClear();
  });

  const renderComponent = () => {
    return render(
      <MemoryRouter initialEntries={["/chords/1"]}>
        <Routes>
          <Route path="/chords/:id" element={<ChordDetail />} />
        </Routes>
      </MemoryRouter>
    );
  };

  test("displays loading state initially", async () => {
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
      expect(
        screen.getByAltText("Chord diagram for Test Tune")
      ).toBeInTheDocument();
    });

    // At this point, while the image is loading, we should see the spinner
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();

    // Simulate image load completion
    const img = screen.getByAltText("Chord diagram for Test Tune");
    fireEvent.load(img);

    // Spinner should disappear after image loads
    await waitFor(() => {
      expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
    });
  });

  test("displays error message when fetch fails", async () => {
    fetch.mockRejectedValueOnce(new Error("API Error"));
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
      expect(screen.getByText(/API Error/)).toBeInTheDocument();
    });
  });

  test("renders chord details correctly", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTune),
    });

    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText("These are the chords for Test Tune")
      ).toBeInTheDocument();
      expect(
        screen.getByAltText("Chord diagram for Test Tune")
      ).toHaveAttribute(
        "src",
        "http://localhost:3000/chord-diagrams/test-tune-chords.png"
      );
      expect(screen.getByText("Back to Chord List")).toHaveAttribute(
        "href",
        "/chords"
      );
      expect(screen.getByText("Back to Tune Details")).toHaveAttribute(
        "href",
        "/tune/1"
      );
    });
  });

  test("displays message when no chord diagram is available", async () => {
    const tuneWithoutChords = { ...mockTune, chords: null };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(tuneWithoutChords),
    });

    renderComponent();

    await waitFor(() => {
      expect(
        screen.getByText("No chord diagram available for this tune.")
      ).toBeInTheDocument();
    });
  });

  test("renders Spotify player when Spotify ID is provided", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTune),
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId("spotify-player")).toHaveTextContent(
        "spotify123"
      );
    });
  });

  test("renders YouTube player when YouTube ID is provided", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTune),
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId("youtube-player")).toHaveTextContent(
        "youtube456"
      );
    });
  });

  test('does not render "Back to Tune Details" link when sheetMusicFile is not available', async () => {
    const tuneWithoutSheetMusic = { ...mockTune, sheetMusicFile: null };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(tuneWithoutSheetMusic),
    });

    renderComponent();

    await waitFor(() => {
      expect(
        screen.queryByText("Back to Tune Details")
      ).not.toBeInTheDocument();
    });
  });

  test("handles loading states correctly", async () => {
    // Mock successful fetch with immediate resolution
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockTune),
      })
    );

    const { container } = renderComponent();

    // Wait for the image element to be rendered
    await waitFor(() => {
      const img = screen.getByAltText("Chord diagram for Test Tune");
      expect(img).toBeInTheDocument();
    });

    // Before image load completes, spinner should still be visible
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();

    // Simulate successful image load
    fireEvent.load(screen.getByAltText("Chord diagram for Test Tune"));

    // After successful image load, spinner should disappear
    await waitFor(() => {
      expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
    });
  });
});
