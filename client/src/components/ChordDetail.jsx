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
  const [imageError, setImageError] = useState(false);
  const { id } = useParams();

  useEffect(() => {
    console.log("Fetching chord data...");
    const fetchChord = async () => {
      try {
        const response = await fetch(`${VITE_API_URL}/api/tune/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch tune data");
        }
        const data = await response.json();
        console.log("Received tune data:", {
          hasChords: !!data.chords,
          chordPath: data.chords,
        });

        setTune(data);

        // If there are no chords, we can stop loading immediately
        if (!data.chords) {
          console.log("No chords data, stopping loader");
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Error in fetchChord:", err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchChord();
  }, [id]);

  const handleImageLoad = () => {
    console.log("Image loaded successfully");
    setIsLoading(false);
  };

  const handleImageError = () => {
    console.error("Image failed to load");
    setImageError(true);
    setIsLoading(false);
  };

  if (error) {
    return (
      <>
        <Header isFixed={false} />
        <div className="centered-content error-message">
          <p>Error: {error}</p>
          <Link to="/chords" className="button">
            Back to Chord List
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
          <Link to="/chords" className="button">
            Back to Chord List
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <Header isFixed={false} />
      <div>
        <p className={tune.chordsDescription ? "centered-content text" : ""}>
          {tune.chordsDescription}
        </p>

        {tune.chords ? (
          <div className="sheetMusicContainer">
            {imageError ? (
              <div className="centered-content error-message">
                <p>
                  Failed to load chord diagram. The image might be missing or in
                  a different format.
                </p>
              </div>
            ) : (
              <>
                <img
                  className="img-tune"
                  src={`${VITE_API_URL}${tune.chords}`}
                  alt={`Chord diagram for ${tune.title}`}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
                {isLoading && <Spinner loading={true} />}
              </>
            )}
          </div>
        ) : (
          <p className="centered-content">
            No chord diagram available for this tune.
          </p>
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
