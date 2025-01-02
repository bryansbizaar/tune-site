import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ChordDetail from "./ChordDetail";

// Mock child components
jest.mock("./Header", () => {
  return function DummyHeader() {
    return <div data-testid="header">Header</div>;
  };
});

jest.mock("./SpotifyMusicPlayer", () => {
  return function DummySpotifyPlayer({ spotifyTrackId }) {
    return <div data-testid="spotify-player">{spotifyTrackId}</div>;
  };
});

jest.mock("./YouTubePlayer", () => {
  return function DummyYouTubePlayer({ youtubeTrackId }) {
    return <div data-testid="youtube-player">{youtubeTrackId}</div>;
  };
});

jest.mock("./Spinner", () => {
  return function DummySpinner({ loading }) {
    if (!loading) return null;
    return <div data-testid="loading-spinner">Loading...</div>;
  };
});

// Mock the API_URL
jest.mock("../env.js", () => ({
  VITE_API_URL: "http://localhost:5000",
}));

// Mock fetch
global.fetch = jest.fn();

describe("ChordDetail Component", () => {
  const mockTune = {
    id: "1",
    title: "Test Tune",
    chordsDescription: "These are the chords for Test Tune",
    chords: "/chord-diagrams/test-tune-chords.png",
    chordVersions: [
      "/chord-diagrams/test-tune-chords-v2.png",
      "/chord-diagrams/test-tune-chords-v3.png",
    ],
    spotifyTrackId: "spotify123",
    youtubeTrackId: "youtube456",
    sheetMusicFile: "/sheet-music/test-tune.png",
  };

  beforeEach(() => {
    fetch.mockClear();
    // Reset Image mock before each test
    global.Image = class {
      constructor() {
        setTimeout(() => {
          this.onload && this.onload();
        }, 0);
      }
    };
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

  test("makes request to correct API endpoint", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTune),
    });

    await act(async () => {
      renderComponent();
    });

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("http://localhost:5000/api/chords/1");
    });
  });

  test("shows loading spinner while fetching data", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTune),
    });

    await act(async () => {
      renderComponent();
    });

    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();

    // Wait for images to "load"
    await waitFor(() => {
      expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
    });
  });

  test("displays error message when fetch fails", async () => {
    fetch.mockRejectedValueOnce(new Error("API Error"));

    await act(async () => {
      renderComponent();
    });

    await waitFor(() => {
      expect(screen.getByText(/Error: API Error/)).toBeInTheDocument();
    });
  });

  test("renders chord details correctly", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTune),
    });

    await act(async () => {
      renderComponent();
    });

    await waitFor(() => {
      expect(screen.getByText(mockTune.chordsDescription)).toBeInTheDocument();
      expect(
        screen.getByAltText("Chord diagram for Test Tune")
      ).toHaveAttribute("src", `http://localhost:5000${mockTune.chords}`);
    });
  });

  test("renders all chord versions when available", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTune),
    });

    await act(async () => {
      renderComponent();
    });

    await waitFor(() => {
      expect(
        screen.getByAltText("Chord diagram for Test Tune")
      ).toBeInTheDocument();
      mockTune.chordVersions.forEach((_, index) => {
        expect(
          screen.getByAltText(`Test Tune - Chord Version ${index + 2}`)
        ).toBeInTheDocument();
      });
    });
  });

  test("shows no chord diagram message when no diagrams available", async () => {
    const tuneWithoutChords = { ...mockTune, chords: null, chordVersions: [] };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(tuneWithoutChords),
    });

    await act(async () => {
      renderComponent();
    });

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

    await act(async () => {
      renderComponent();
    });

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

    await act(async () => {
      renderComponent();
    });

    await waitFor(() => {
      expect(screen.getByTestId("youtube-player")).toHaveTextContent(
        "youtube456"
      );
    });
  });

  test("does not render 'Back to Tune Details' link when sheetMusicFile is not available", async () => {
    const tuneWithoutSheetMusic = { ...mockTune, sheetMusicFile: null };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(tuneWithoutSheetMusic),
    });

    await act(async () => {
      renderComponent();
    });

    await waitFor(() => {
      expect(
        screen.queryByText("Back to Tune Details")
      ).not.toBeInTheDocument();
    });
  });
});
