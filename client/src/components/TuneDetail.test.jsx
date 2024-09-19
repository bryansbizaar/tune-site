import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import TuneDetail from "./TuneDetail";

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
jest.mock("../env", () => ({
  VITE_API_URL: "http://localhost:5000",
}));

// Mock fetch
global.fetch = jest.fn();

describe("TuneDetail Component", () => {
  const mockTune = {
    id: "1",
    title: "Test Tune",
    description: "This is a test tune",
    sheetMusicFile: "/sheet-music/test-tune.png",
    chords: true,
    spotifyTrackId: "spotify123",
    youtubeTrackId: "youtube456",
  };

  beforeEach(() => {
    fetch.mockClear();
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

  test("displays loading state initially", () => {
    fetch.mockImplementationOnce(() => new Promise(() => {}));
    renderComponent();
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  test("displays error message when fetch fails", async () => {
    fetch.mockRejectedValueOnce(new Error("API Error"));
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText(/Error:/)).toBeInTheDocument();
      expect(screen.getByText(/API Error/)).toBeInTheDocument();
    });
  });

  test("renders tune details correctly", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTune),
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("This is a test tune")).toBeInTheDocument();
      expect(screen.getByAltText("Test Tune")).toHaveAttribute(
        "src",
        "http://localhost:5000/sheet-music/test-tune.png"
      );
      expect(screen.getByText("Click to show chords")).toHaveAttribute(
        "href",
        "/chords/1"
      );
      expect(screen.getByTestId("spotify-player")).toHaveTextContent(
        "spotify123"
      );
    });
  });

  test("renders YouTube player when no Spotify ID is provided", async () => {
    const tuneWithoutSpotify = { ...mockTune, spotifyTrackId: null };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(tuneWithoutSpotify),
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId("youtube-player")).toHaveTextContent(
        "youtube456"
      );
    });
  });

  test("does not render music player when neither Spotify nor YouTube ID is provided", async () => {
    const tuneWithoutMusic = {
      ...mockTune,
      spotifyTrackId: null,
      youtubeTrackId: null,
    };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(tuneWithoutMusic),
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.queryByTestId("spotify-player")).not.toBeInTheDocument();
      expect(screen.queryByTestId("youtube-player")).not.toBeInTheDocument();
    });
  });

  test("renders second version of sheet music when available", async () => {
    const tuneWithV2 = { ...mockTune, v2: true };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(tuneWithV2),
    });

    renderComponent();

    await waitFor(() => {
      const images = screen.getAllByRole("img");
      expect(images).toHaveLength(2);
      expect(images[1]).toHaveAttribute("alt", "Test Tune - Version 2");
    });
  });
});
