import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import SpotifyMusicPlayer from "./SpotifyMusicPlayer";
import YouTubePlayer from "./YouTubePlayer";
import Header from "./Header";
import Spinner from "./Spinner";
import { VITE_API_URL } from "../env";

const ChordDetail = () => {
  const [tune, setTune] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);
  const { id } = useParams();

  useEffect(() => {
    const fetchChord = async () => {
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
      } finally {
        if (!tune?.chords) {
          setIsLoading(false);
        }
      }
    };

    fetchChord();
  }, [id]);

  const handleImageLoad = () => {
    setImageLoaded(true);
    setIsLoading(false);
  };

  if (error) return <div>Error: {error}</div>;
  if (isLoading) return <Spinner loading={isLoading} />;
  if (!tune) return <div>No tune found</div>;

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
              src={`${VITE_API_URL}${tune.chords}`}
              alt={`Chord diagram for ${tune.title}`}
              onLoad={handleImageLoad}
              style={{ display: imageLoaded ? "block" : "none" }}
            />
            {!imageLoaded && <Spinner loading={!imageLoaded} />}
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
