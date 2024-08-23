import React from "react";

const SpotifyMusicPlayer = ({ spotifyTrackId, spotifyPlaylistId }) => {
  let embedUrl;
  if (spotifyPlaylistId) {
    embedUrl = `https://open.spotify.com/embed/playlist/${spotifyPlaylistId}`;
  } else {
    embedUrl = `https://open.spotify.com/embed/track/${spotifyTrackId}`;
  }

  return (
    <iframe
      key={spotifyTrackId}
      src={embedUrl}
      allowFullScreen=""
      allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
      loading="lazy"
      title="Spotify music player"
    ></iframe>
  );
};

export default SpotifyMusicPlayer;
