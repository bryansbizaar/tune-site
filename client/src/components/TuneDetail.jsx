import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import SpotifyMusicPlayer from "./SpotifyMusicPlayer";
import YouTubePlayer from "./YouTubePlayer";
import Header from "./Header";
import Spinner from "./Spinner";
import { VITE_API_URL } from "../env";

const TuneDetail = () => {
  const [tune, setTune] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
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

        // If there's no sheet music file, we can stop loading immediately
        if (!data.sheetMusicFile) {
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Error fetching tune:", err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchTune();
  }, [id]);

  const handleImageLoad = () => {
    console.log("Sheet music loaded successfully");
    setIsLoading(false);
  };

  const handleImageError = () => {
    console.error("Sheet music failed to load");
    setImageError(true);
    setIsLoading(false);
  };

  if (error) {
    return (
      <>
        <Header isFixed={false} />
        <div className="centered-content error-message">
          <p>Error: {error}</p>
          <Link to="/tunelist" className="button">
            Back to Tune List
          </Link>
        </div>
      </>
    );
  }

  if (!tune) {
    return (
      <>
        <Header isFixed={false} />
        <div className="centered-content error-message">
          <p>No tune found</p>
          <Link to="/tunelist" className="button">
            Back to Tune List
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Header isFixed={false} />
      <div className="centered-content chord-nav">
        {tune.chords && <Link to={`/chords/${id}`}>Click to show chords</Link>}
        {tune.description && <p className="text">{tune.description}</p>}

        {tune.sheetMusicFile && (
          <div className="sheetMusicContainer">
            {imageError ? (
              <div className="centered-content error-message">
                <p>
                  Failed to load sheet music. The image might be missing or in a
                  different format.
                </p>
              </div>
            ) : (
              <>
                <img
                  className="img-tune"
                  src={`${VITE_API_URL}${tune.sheetMusicFile}`}
                  alt={tune.title}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
                {isLoading && <Spinner loading={true} />}
              </>
            )}
          </div>
        )}

        {tune.v2 && !imageError && (
          <div className="sheetMusicContainer">
            <img
              className="img-tune"
              src={`${VITE_API_URL}${tune.v2}`}
              alt={`${tune.title} - Version 2`}
              onError={(e) => console.error("Failed to load version 2 image")}
            />
          </div>
        )}

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

export default TuneDetail;
