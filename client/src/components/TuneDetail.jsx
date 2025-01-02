import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import SpotifyMusicPlayer from "./SpotifyMusicPlayer";
import YouTubePlayer from "./YouTubePlayer";
import Header from "./Header";
import Spinner from "./Spinner";
import { VITE_API_URL } from "../env";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const TuneDetail = () => {
  // Combine all state to prevent race conditions
  const [state, setState] = useState({
    tune: null,
    isLoading: true, // Start with loading true
    error: null,
    imagesLoaded: new Set(),
  });
  const { id } = useParams();

  // Fetch tune data with retry logic
  useEffect(() => {
    const fetchTune = async (retryCount = 0) => {
      try {
        // Always start with loading true and no error
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        const response = await fetch(`${VITE_API_URL}/api/tune/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch tune data");
        }
        const data = await response.json();

        setState((prev) => ({
          ...prev,
          tune: data,
          // Keep loading true if there are images to load
          isLoading: Boolean(
            data.sheetMusicFile || (data.versions && data.versions.length > 0)
          ),
        }));
      } catch (err) {
        console.error(`Attempt ${retryCount + 1} failed:`, err);
        if (retryCount < MAX_RETRIES) {
          setTimeout(() => fetchTune(retryCount + 1), RETRY_DELAY);
        } else {
          setState((prev) => ({
            ...prev,
            error: err.message,
            isLoading: false,
          }));
        }
      }
    };

    fetchTune();
    return () => setState((prev) => ({ ...prev, imagesLoaded: new Set() }));
  }, [id]);

  // Handle image loading with retry logic
  useEffect(() => {
    if (!state.tune) return;

    const imageSources = [
      state.tune.sheetMusicFile,
      ...(state.tune.versions || []),
    ].filter(Boolean);

    if (imageSources.length === 0) {
      setState((prev) => ({ ...prev, isLoading: false }));
      return;
    }

    const loadImage = async (src, retryCount = 0) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        const fullSrc = `${VITE_API_URL}${src}`;

        img.onload = () => resolve(src);
        img.onerror = () => {
          if (retryCount < MAX_RETRIES) {
            console.log(
              `Retrying image load for ${src}, attempt ${retryCount + 1}`
            );
            setTimeout(() => {
              loadImage(src, retryCount + 1)
                .then(resolve)
                .catch(reject);
            }, RETRY_DELAY);
          } else {
            reject(
              `Failed to load image after ${MAX_RETRIES} attempts: ${src}`
            );
          }
        };

        img.src = fullSrc;
      });
    };

    // Load all images with retry logic
    Promise.all(imageSources.map((src) => loadImage(src)))
      .then((loadedSrcs) => {
        setState((prev) => ({
          ...prev,
          imagesLoaded: new Set(loadedSrcs),
          isLoading: false,
        }));
      })
      .catch((err) => {
        console.error("Image loading error:", err);
        setState((prev) => ({
          ...prev,
          error: `Failed to load images: ${err}`,
          isLoading: false,
        }));
      });
  }, [state.tune]);

  // Show spinner during any loading state
  if (state.isLoading) {
    return <Spinner loading={true} data-testid="loading-spinner" />;
  }

  // Show error after loading completes if there was an error
  if (state.error) {
    return (
      <div role="alert" data-testid="error-message">
        Error: {state.error}
      </div>
    );
  }

  // Show not found after loading completes if no tune
  if (!state.tune) {
    return <div>No tune found</div>;
  }

  const isImageLoaded = (src) => state.imagesLoaded.has(src);

  // Only show content after loading completes and images are loaded
  return (
    <div data-testid="tune-detail-container">
      <Header isFixed={false} />
      <div className="centered-content chord-nav">
        {state.tune.chords && (
          <Link to={`/chords/${id}`} data-testid="chords-link">
            Click to show chords
          </Link>
        )}

        {state.tune.description && (
          <p className="text" data-testid="tune-description">
            {state.tune.description}
          </p>
        )}

        <div className="sheetMusicContainer">
          <img
            className="img-tune"
            src={`${VITE_API_URL}${state.tune.sheetMusicFile}`}
            alt={state.tune.title}
            data-testid="main-sheet-music"
            style={{
              display: isImageLoaded(state.tune.sheetMusicFile)
                ? "block"
                : "none",
            }}
          />
        </div>

        {state.tune.versionDescription && (
          <p className="text" data-testid="version-description">
            {state.tune.versionDescription}
          </p>
        )}

        {state.tune.versions?.length > 0 && (
          <div data-testid="version-container">
            {state.tune.versions.map((version, index) => (
              <div
                key={`version-${index + 2}`}
                className="sheetMusicContainer"
                data-testid={`version-${index + 2}`}
              >
                <img
                  className="img-tune"
                  src={`${VITE_API_URL}${version}`}
                  alt={`${state.tune.title} - Version ${index + 2}`}
                  style={{
                    display: isImageLoaded(version) ? "block" : "none",
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {state.tune.spotifyTrackId && (
          <div className="musicPlayer" data-testid="spotify-container">
            <SpotifyMusicPlayer spotifyTrackId={state.tune.spotifyTrackId} />
          </div>
        )}

        {state.tune.youtubeTrackId && (
          <div className="musicPlayer" data-testid="youtube-container">
            <YouTubePlayer youtubeTrackId={state.tune.youtubeTrackId} />
          </div>
        )}
      </div>
    </div>
  );
};

export default TuneDetail;
