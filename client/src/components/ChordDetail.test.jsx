import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import ChordDetail from "./ChordDetail";

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

// Mock environment variable
jest.mock("../env.js", () => ({
  VITE_API_URL: "http://localhost:5000",
}));

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
    global.fetch = jest.fn();
    // Reset Image mock before each test
    global.Image = class {
      constructor() {
        setTimeout(() => {
          this.onload && this.onload();
        }, 0);
      }
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
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

  test("shows loading spinner initially", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTune),
    });

    renderComponent();
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();
  });

  test("makes API request to correct endpoint", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTune),
    });

    renderComponent();

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith("http://localhost:5000/api/chords/1");
    });
  });

  test("displays error message when fetch fails", async () => {
    fetch.mockRejectedValueOnce(new Error("API Error"));

    renderComponent();

    await waitFor(() => {
      const errorElement = screen.getByTestId("error-message");
      expect(errorElement).toBeInTheDocument();
      expect(errorElement).toHaveTextContent("Error: API Error");
    });
  });

  test("renders complete chord details after successful load", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTune),
    });

    renderComponent();

    await waitFor(() => {
      // Check header and description
      expect(screen.getByTestId("header")).toBeInTheDocument();
      expect(screen.getByTestId("chords-description")).toHaveTextContent(
        mockTune.chordsDescription
      );

      // Check main chord diagram
      const mainDiagram = screen.getByTestId("main-chord-diagram");
      expect(mainDiagram).toBeInTheDocument();
      expect(mainDiagram).toHaveAttribute(
        "src",
        `http://localhost:5000${mockTune.chords}`
      );

      // Check chord versions
      mockTune.chordVersions.forEach((_, index) => {
        expect(screen.getByTestId(`version-${index + 2}`)).toBeInTheDocument();
      });

      // Check navigation links
      expect(screen.getByTestId("back-to-chords")).toBeInTheDocument();
      expect(screen.getByTestId("back-to-tune")).toBeInTheDocument();

      // Check music players
      expect(screen.getByTestId("spotify-player")).toHaveTextContent(
        "spotify123"
      );
      expect(screen.getByTestId("youtube-player")).toHaveTextContent(
        "youtube456"
      );
    });
  });

  test("handles missing optional fields gracefully", async () => {
    const minimalTune = {
      id: "1",
      title: "Minimal Tune",
      chords: "/chord-diagrams/minimal.png",
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(minimalTune),
    });

    renderComponent();

    await waitFor(() => {
      // These should exist
      expect(screen.getByTestId("main-chord-diagram")).toBeInTheDocument();
      expect(screen.getByTestId("back-to-chords")).toBeInTheDocument();

      // These should not exist
      expect(
        screen.queryByTestId("chords-description")
      ).not.toBeInTheDocument();
      expect(screen.queryByTestId("version-2")).not.toBeInTheDocument();
      expect(screen.queryByTestId("back-to-tune")).not.toBeInTheDocument();
      expect(screen.queryByTestId("spotify-player")).not.toBeInTheDocument();
      expect(screen.queryByTestId("youtube-player")).not.toBeInTheDocument();
    });
  });

  test("shows message when no chord diagrams are available", async () => {
    const tuneWithoutChords = {
      id: "1",
      title: "No Chords Tune",
      chordsDescription: "Description only",
    };

    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(tuneWithoutChords),
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId("no-chords-message")).toHaveTextContent(
        "No chord diagram available for this tune."
      );
    });
  });

  test("waits for all images to load before displaying content", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTune),
    });

    renderComponent();

    // Initially shows loading spinner
    expect(screen.getByTestId("loading-spinner")).toBeInTheDocument();

    // After images load, shows content
    await waitFor(() => {
      expect(screen.queryByTestId("loading-spinner")).not.toBeInTheDocument();
      expect(screen.getByTestId("main-chord-diagram")).toBeInTheDocument();
      mockTune.chordVersions.forEach((_, index) => {
        expect(screen.getByTestId(`version-${index + 2}`)).toBeInTheDocument();
      });
    });
  });
});
