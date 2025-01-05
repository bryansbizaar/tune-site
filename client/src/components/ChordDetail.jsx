import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import SpotifyMusicPlayer from "./SpotifyMusicPlayer";
import YouTubePlayer from "./YouTubePlayer";
import Header from "./Header";
import Spinner from "./Spinner";
import { VITE_API_URL } from "../env";

const ChordDetail = () => {
  const [tune, setTune] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const { id } = useParams();

  // Fetch chord data
  useEffect(() => {
    const fetchChord = async () => {
      try {
        const response = await fetch(`${VITE_API_URL}/api/chords/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch chord data");
        }
        const data = await response.json();
        setTune(data);
      } catch (err) {
        console.error("Error fetching chord:", err);
        setError(err.message);
      } finally {
        // Only keep loading if there are images to load
        if (!tune?.chords && !(tune?.chordVersions?.length > 0)) {
          setIsLoading(false);
        }
      }
    };

    fetchChord();
  }, [id]);

  // Handle image loading
  useEffect(() => {
    if (!tune) return;

    const imageSources = [tune.chords, ...(tune.chordVersions || [])].filter(
      Boolean
    );

    if (imageSources.length === 0) {
      setIsLoading(false);
      setImagesLoaded(true);
      return;
    }

    let loadedCount = 0;
    const totalImages = imageSources.length;

    imageSources.forEach((src) => {
      const img = new Image();
      img.src = `${VITE_API_URL}${src}`;

      img.onload = () => {
        loadedCount++;
        if (loadedCount === totalImages) {
          setImagesLoaded(true);
          setIsLoading(false);
        }
      };

      img.onerror = () => {
        console.error(`Failed to load image: ${src}`);
        loadedCount++;
        if (loadedCount === totalImages) {
          setImagesLoaded(true);
          setIsLoading(false);
        }
      };
    });
  }, [tune]);

  if (isLoading) {
    return <Spinner loading={true} data-testid="loading-spinner" />;
  }

  if (error) {
    return (
      <div role="alert" data-testid="error-message">
        Error: {error}
      </div>
    );
  }

  if (!tune) {
    return <div data-testid="no-tune-message">No tune found</div>;
  }

  return (
    <div data-testid="chord-detail-container">
      <Header isFixed={false} />
      <div>
        {tune.chordsDescription && (
          <p className="centered-content text" data-testid="chords-description">
            {tune.chordsDescription}
          </p>
        )}

        {imagesLoaded && (
          <>
            {tune.chords && (
              <div className="sheetMusicContainer">
                <img
                  className="img-tune"
                  src={`${VITE_API_URL}${tune.chords}`}
                  alt={`Chord diagram for ${tune.title}`}
                  data-testid="main-chord-diagram"
                />
              </div>
            )}

            {tune.chordVersions?.map((version, index) => (
              <div
                key={`chord-version-${index + 2}`}
                className="sheetMusicContainer"
                data-testid={`version-${index + 2}`}
              >
                <img
                  className="img-tune"
                  src={`${VITE_API_URL}${version}`}
                  alt={`${tune.title} - Chord Version ${index + 2}`}
                />
              </div>
            ))}
          </>
        )}

        {!tune.chords && !tune.chordVersions?.length && (
          <p data-testid="no-chords-message">
            No chord diagram available for this tune.
          </p>
        )}

        <div className="link-container">
          <Link to="/chords" data-testid="back-to-chords">
            Back to Chord List
          </Link>
          {tune.sheetMusicFile && (
            <Link to={`/tune/${id}`} data-testid="back-to-tune">
              Back to Tune Details
            </Link>
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
    </div>
  );
};

export default ChordDetail;
