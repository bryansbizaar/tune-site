import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import SpotifyMusicPlayer from "./SpotifyMusicPlayer";
import YouTubePlayer from "./YouTubePlayer";
import Header from "./Header";
import { VITE_API_URL } from "../env";

const TuneDetail = () => {
  const [tune, setTune] = useState(null);
  const [error, setError] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchTune = async () => {
      try {
        const response = await fetch(`${VITE_API_URL}/api/tune/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch tune data");
        }
        const data = await response.json();
        setTune(data);
      } catch (err) {
        console.error("Error fetching tune:", err);
        setError(err.message);
      }
    };

    fetchTune();
  }, [id]);

  if (error) return <div>Error: {error}</div>;
  if (!tune) return <div>Loading...</div>;

  return (
    <>
      <Header isFixed={false} />
      <div className="centered-content chord-nav">
        {tune.chords && <Link to={`/chords/${id}`}>Click to show chords</Link>}
        {tune.description && <p className="text">{tune.description}</p>}
        <div className="sheetMusicContainer">
          <img
            className="img-tune"
            src={`${VITE_API_URL}${tune.sheetMusicFile}`}
            alt={tune.title}
          />
        </div>

        {tune.v2 && (
          <div className="sheetMusicContainer">
            <img
              className="img-tune"
              src={`${VITE_API_URL}${tune.sheetMusicFile}`}
              alt={`${tune.title} - Version 2`}
            />
          </div>
        )}

        {tune.spotifyTrackId ? (
          <div className="musicPlayer">
            <SpotifyMusicPlayer spotifyTrackId={tune.spotifyTrackId} />
          </div>
        ) : tune.youtubeTrackId ? (
          <div className="musicPlayer">
            <YouTubePlayer youtubeTrackId={tune.youtubeTrackId} />
          </div>
        ) : null}
      </div>
    </>
  );
};

export default TuneDetail;
