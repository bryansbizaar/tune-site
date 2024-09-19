import React from "react";
import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import SpotifyMusicPlayer from "./SpotifyMusicPlayer";

describe("SpotifyMusicPlayer Component", () => {
  test("renders iframe with correct attributes", () => {
    render(<SpotifyMusicPlayer spotifyTrackId="1234567" />);
    const iframe = screen.getByTitle("Spotify music player");
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute(
      "allow",
      "autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
    );
    expect(iframe).toHaveAttribute("loading", "lazy");
  });

  test("generates correct embed URL for track", () => {
    const trackId = "1234567";
    render(<SpotifyMusicPlayer spotifyTrackId={trackId} />);
    const iframe = screen.getByTitle("Spotify music player");
    expect(iframe).toHaveAttribute(
      "src",
      `https://open.spotify.com/embed/track/${trackId}`
    );
  });

  test("generates correct embed URL for playlist", () => {
    const playlistId = "7890123";
    render(<SpotifyMusicPlayer spotifyPlaylistId={playlistId} />);
    const iframe = screen.getByTitle("Spotify music player");
    expect(iframe).toHaveAttribute(
      "src",
      `https://open.spotify.com/embed/playlist/${playlistId}`
    );
  });

  test("prioritizes playlist URL when both track and playlist IDs are provided", () => {
    const trackId = "1234567";
    const playlistId = "7890123";
    render(
      <SpotifyMusicPlayer
        spotifyTrackId={trackId}
        spotifyPlaylistId={playlistId}
      />
    );
    const iframe = screen.getByTitle("Spotify music player");
    expect(iframe).toHaveAttribute(
      "src",
      `https://open.spotify.com/embed/playlist/${playlistId}`
    );
  });

  // test("updates iframe key when spotifyTrackId changes", () => {
  //   const { rerender } = render(
  //     <SpotifyMusicPlayer spotifyTrackId="1234567" />
  //   );
  //   let iframe = screen.getByTitle("Spotify music player");
  //   expect(iframe).toHaveAttribute("key", "1234567");

  //   rerender(<SpotifyMusicPlayer spotifyTrackId="7890123" />);
  //   iframe = screen.getByTitle("Spotify music player");
  //   expect(iframe).toHaveAttribute("key", "7890123");
  // });

  test("updates iframe src when spotifyTrackId changes", () => {
    const { rerender } = render(
      <SpotifyMusicPlayer spotifyTrackId="1234567" />
    );
    let iframe = screen.getByTitle("Spotify music player");
    expect(iframe).toHaveAttribute(
      "src",
      "https://open.spotify.com/embed/track/1234567"
    );

    rerender(<SpotifyMusicPlayer spotifyTrackId="7890123" />);
    iframe = screen.getByTitle("Spotify music player");
    expect(iframe).toHaveAttribute(
      "src",
      "https://open.spotify.com/embed/track/7890123"
    );
  });
});
