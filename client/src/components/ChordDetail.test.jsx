import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
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
  // Mock Image loading
  beforeAll(() => {
    // Mock the Image constructor
    global.Image = class {
      constructor() {
        setTimeout(() => {
          this.onload();
        }, 100);
      }
    };
  });

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

    renderComponent();

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("http://localhost:5000/api/tune/1");
    });
  });

  test("shows loading spinner while fetching data", async () => {
    fetch.mockImplementationOnce(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({ ...mockTune, chords: null, chordVersions: [] }),
      })
    );

    renderComponent();
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
    await waitFor(
      () =>
        expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument(),
      { timeout: 3000 }
    );
  });

  test("displays error message when fetch fails", async () => {
    fetch.mockRejectedValueOnce(new Error("API Error"));
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText(/Error: API Error/)).toBeInTheDocument();
    });
  });

  test("renders chord details correctly", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTune),
    });

    renderComponent();

    await waitFor(
      () => {
        expect(
          screen.getByText(mockTune.chordsDescription)
        ).toBeInTheDocument();
        expect(
          screen.getByAltText("Chord diagram for Test Tune")
        ).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  test("renders all chord versions when available", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTune),
    });

    renderComponent();

    await waitFor(() => {
      // Main chord diagram
      expect(
        screen.getByAltText("Chord diagram for Test Tune")
      ).toBeInTheDocument();
    });
    await waitFor(() => {
      // Version 2 and 3
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

  test("does not render 'Back to Tune Details' link when sheetMusicFile is not available", async () => {
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
});
