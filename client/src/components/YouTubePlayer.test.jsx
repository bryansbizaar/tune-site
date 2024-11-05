// YouTubePlayer.test.jsx
import React from "react";
import { render, screen } from "@testing-library/react";
import YouTubePlayer from "./YouTubePlayer";

describe("YouTubePlayer Component", () => {
  it("renders the YouTube iframe with the correct src when a valid youtubeTrackId is passed", () => {
    const youtubeTrackId = "dQw4w9WgXcQ"; // Example YouTube video ID
    render(<YouTubePlayer youtubeTrackId={youtubeTrackId} />);

    const iframe = screen.getByTitle("YouTube player");
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute(
      "src",
      `https://www.youtube.com/embed/${youtubeTrackId}`
    );
  });

  it("handles missing youtubeTrackId gracefully", () => {
    render(<YouTubePlayer youtubeTrackId={null} />);

    const iframe = screen.queryByTitle("YouTube player");
    expect(iframe).not.toBeInTheDocument(); // No iframe should render if youtubeTrackId is null
  });
});
