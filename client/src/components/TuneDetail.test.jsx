import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import TuneDetail from "./TuneDetail";

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

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useParams: () => ({ id: "1" }),
}));

jest.mock("../env", () => ({
  VITE_API_URL: "http://localhost:5000",
}));

// Mock fetch
global.fetch = jest.fn();

describe("TuneDetail Component", () => {
  // Mock Image loading
  beforeAll(() => {
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
    description: "Test tune description",
    sheetMusicFile: "/sheet-music/test-tune.png",
    versions: ["/sheet-music/version2.png", "/sheet-music/version3.png"],
    versionDescription: "Version description",
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
        json: () => Promise.resolve(mockTune),
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

  test("renders tune details correctly", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTune),
    });

    renderComponent();

    await waitFor(
      () => {
        expect(screen.getByText(mockTune.description)).toBeInTheDocument();
        expect(screen.getByAltText(mockTune.title)).toBeInTheDocument();
        expect(screen.getByText("Click to show chords")).toBeInTheDocument();
      },
      { timeout: 3000 }
    );
  });

  test("renders all versions when available", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTune),
    });

    renderComponent();

    await waitFor(() => {
      // Main image
      expect(screen.getByAltText(mockTune.title)).toBeInTheDocument();
      // Version images
      mockTune.versions.forEach((_, index) => {
        expect(
          screen.getByAltText(`${mockTune.title} - Version ${index + 2}`)
        ).toBeInTheDocument();
      });
    });
  });

  test("renders music players when track IDs are provided", async () => {
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockTune),
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByTestId("spotify-player")).toHaveTextContent(
        "spotify123"
      );
      expect(screen.getByTestId("youtube-player")).toHaveTextContent(
        "youtube456"
      );
    });
  });

  test("handles missing versions gracefully", async () => {
    const tuneWithoutVersions = { ...mockTune, versions: [] };
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(tuneWithoutVersions),
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByAltText(mockTune.title)).toBeInTheDocument();
      expect(screen.queryByAltText(/Version/)).not.toBeInTheDocument();
    });
  });
});
