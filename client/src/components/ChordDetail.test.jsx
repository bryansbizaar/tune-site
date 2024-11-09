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

// Mock the YouTubePlayer component (which was missing in the provided code but referenced)
jest.mock("./YouTubePlayer", () => {
  return function DummyYouTubePlayer({ youtubeTrackId }) {
    return <div data-testid="youtube-player">{youtubeTrackId}</div>;
  };
});

// Mock the API_URL
jest.mock("../env.js", () => ({
  VITE_API_URL: "http://localhost:5000",
}));

// Mock fetch
global.fetch = jest.fn();

// Mock the Spinner component
jest.mock("./Spinner", () => {
  return function DummySpinner({ loading }) {
    return loading ? <div data-testid="loading-spinner">Loading...</div> : null;
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

  // test("displays loading state initially", () => {
  //   fetch.mockImplementationOnce(() => new Promise(() => {}));
  //   renderComponent();
  //   expect(screen.getByText("Loading...")).toBeInTheDocument();
  // });

  test("displays loading state initially", () => {
    fetch.mockImplementationOnce(() => new Promise(() => {}));
    renderComponent();
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
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
        "http://localhost:5000/chord-diagrams/test-tune-chords.png"
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

  // test("removes loading state after data is loaded", async () => {
  //   fetch.mockResolvedValueOnce({
  //     ok: true,
  //     json: () => Promise.resolve(mockTune),
  //   });

  //   renderComponent();

  //   // Initially shows loading spinner
  //   expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();

  //   // After data loads, spinner should disappear
  //   await waitFor(() => {
  //     expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
  //   });
  // });
  test("handles loading states correctly", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTune),
    });

    renderComponent();

    // Initially shows loading spinner
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();

    // Wait for the image to appear in the DOM
    await waitFor(() => {
      expect(
        screen.getByText("These are the chords for Test Tune")
      ).toBeInTheDocument();
    });

    // Now we can find the image and simulate its load
    const image = screen.getByAltText("Chord diagram for Test Tune");
    fireEvent.load(image);

    // After image loads, spinner should be gone
    await waitFor(() => {
      expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
    });
  });
});
