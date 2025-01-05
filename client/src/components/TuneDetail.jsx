import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import SpotifyMusicPlayer from "./SpotifyMusicPlayer";
import YouTubePlayer from "./YouTubePlayer";
import Header from "./Header";
import Spinner from "./Spinner";
import { VITE_API_URL } from "../env";

const TuneDetail = () => {
  const [tune, setTune] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const { id } = useParams();

  // Fetch tune data
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
      } finally {
        // Only set loading false if there are no images to load
        if (!tune?.sheetMusicFile && !tune?.versions?.length) {
          setIsLoading(false);
        }
      }
    };

    fetchTune();
  }, [id]);

  // Handle image loading
  useEffect(() => {
    if (!tune) return;

    const imageSources = [tune.sheetMusicFile, ...(tune.versions || [])].filter(
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
    <div data-testid="tune-detail-container">
      <Header isFixed={false} />
      <div className="centered-content chord-nav">
        {tune.chords && (
          <Link to={`/chords/${id}`} data-testid="chords-link">
            Click to show chords
          </Link>
        )}

        {tune.description && (
          <p className="text" data-testid="tune-description">
            {tune.description}
          </p>
        )}

        {imagesLoaded && (
          <>
            <div className="sheetMusicContainer">
              <img
                className="img-tune"
                src={`${VITE_API_URL}${tune.sheetMusicFile}`}
                alt={tune.title}
                data-testid="main-sheet-music"
              />
            </div>

            {tune.versionDescription && (
              <p className="text" data-testid="version-description">
                {tune.versionDescription}
              </p>
            )}

            {tune.versions?.map((version, index) => (
              <div
                key={`version-${index + 2}`}
                className="sheetMusicContainer"
                data-testid={`version-${index + 2}`}
              >
                <img
                  className="img-tune"
                  src={`${VITE_API_URL}${version}`}
                  alt={`${tune.title} - Version ${index + 2}`}
                />
              </div>
            ))}
          </>
        )}

        {tune.spotifyTrackId && (
          <div className="musicPlayer" data-testid="spotify-container">
            <SpotifyMusicPlayer spotifyTrackId={tune.spotifyTrackId} />
          </div>
        )}

        {tune.youtubeTrackId && (
          <div className="musicPlayer" data-testid="youtube-container">
            <YouTubePlayer youtubeTrackId={tune.youtubeTrackId} />
          </div>
        )}
      </div>
    </div>
  );
};

export default TuneDetail;
