import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import SpotifyMusicPlayer from "./SpotifyMusicPlayer";
import Header from "./Header";

const ChordDetail = () => {
  const [tune, setTune] = useState(null);
  const [error, setError] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    const fetchChord = async () => {
      try {
        const response = await fetch(`/data/tunes/${id}.json`);
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

    fetchChord();
  }, [id]);

  if (error) return <div>Error: {error}</div>;
  if (!tune) return <div>Loading...</div>;

  return (
    <>
      <Header isFixed={false} />
      <div>
        <p className={tune.chordsDescription ? "centered-content text" : ""}>
          {tune.chordsDescription}
        </p>

        {tune.chords ? (
          <div className="sheetMusicContainer">
            <img
              className="img-tune"
              src={tune.chords}
              alt={`Chord diagram for ${tune.title}`}
            />
          </div>
        ) : (
          <p>No chord diagram available for this tune.</p>
        )}

        <div className="link-container">
          <Link to="/chords">Back to Chord List</Link>
          {tune.sheetMusicFile && (
            <Link to={`/tune/${id}`}>Back to Tune Details</Link>
          )}
        </div>
        <div className="musicPlayer">
          {tune.spotifyTrackId && (
            <SpotifyMusicPlayer spotifyTrackId={tune.spotifyTrackId} />
          )}
          {tune.youtubeTrackId && (
            <YouTubePlayer youtubeTrackId={tune.youtubeTrackId} />
          )}
        </div>
      </div>
    </>
  );
};

export default ChordDetail;