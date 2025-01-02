import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import SpotifyMusicPlayer from "./SpotifyMusicPlayer";
import YouTubePlayer from "./YouTubePlayer";
import Header from "./Header";
import Spinner from "./Spinner";
import { VITE_API_URL } from "../env";

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

const ChordDetail = () => {
  // Combine all state to prevent race conditions
  const [state, setState] = useState({
    tune: null,
    isLoading: true, // Start with loading true
    error: null,
    imagesLoaded: new Set(),
  });
  const { id } = useParams();

  // Fetch chord data with retry logic
  useEffect(() => {
    const fetchChord = async (retryCount = 0) => {
      try {
        // Always start with loading true and no error
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        const response = await fetch(`${VITE_API_URL}/api/chords/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch chord data");
        }
        const data = await response.json();

        setState((prev) => ({
          ...prev,
          tune: data,
          // Keep loading true if there are images to load
          isLoading: Boolean(
            data.chords || (data.chordVersions && data.chordVersions.length > 0)
          ),
        }));
      } catch (err) {
        // In test environment, don't retry
        if (process.env.NODE_ENV === "test") {
          setState((prev) => ({
            ...prev,
            error: err.message,
            isLoading: false,
          }));
          return;
        }

        console.error(`Attempt ${retryCount + 1} failed:`, err);
        if (retryCount < MAX_RETRIES) {
          setTimeout(() => fetchChord(retryCount + 1), RETRY_DELAY);
        } else {
          setState((prev) => ({
            ...prev,
            error: err.message,
            isLoading: false,
          }));
        }
      }
    };

    fetchChord();
    return () => setState((prev) => ({ ...prev, imagesLoaded: new Set() }));
  }, [id]);

  // Handle image loading with retry logic
  useEffect(() => {
    if (!state.tune) return;

    // Only collect images that actually exist
    const imageSources = [
      state.tune.chords,
      ...(state.tune.chordVersions || []),
    ]
      .filter(Boolean)
      .filter((src) => src.trim() !== "");

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
    <div data-testid="chord-detail-container">
      <Header isFixed={false} />
      <div>
        <p
          className={
            state.tune.chordsDescription ? "centered-content text" : ""
          }
        >
          {state.tune.chordsDescription}
        </p>

        {state.tune.chords && (
          <div className="sheetMusicContainer">
            <img
              className="img-tune"
              src={`${VITE_API_URL}${state.tune.chords}`}
              alt={`Chord diagram for ${state.tune.title}`}
              data-testid="main-chord-diagram"
              style={{
                display: isImageLoaded(state.tune.chords) ? "block" : "none",
              }}
            />
          </div>
        )}

        {state.tune.chordVersions?.map((version, index) => (
          <div
            key={`chord-version-${index + 2}`}
            className="sheetMusicContainer"
            data-testid={`version-${index + 2}`}
          >
            <img
              className="img-tune"
              src={`${VITE_API_URL}${version}`}
              alt={`${state.tune.title} - Chord Version ${index + 2}`}
              style={{
                display: isImageLoaded(version) ? "block" : "none",
              }}
            />
          </div>
        ))}

        {!state.tune.chords && !state.tune.chordVersions?.length && (
          <p>No chord diagram available for this tune.</p>
        )}

        <div className="link-container">
          <Link to="/chords">Back to Chord List</Link>
          {state.tune.sheetMusicFile && (
            <Link to={`/tune/${id}`}>Back to Tune Details</Link>
          )}
        </div>

        <div className="musicPlayer">
          {state.tune.spotifyTrackId && (
            <SpotifyMusicPlayer spotifyTrackId={state.tune.spotifyTrackId} />
          )}
          {state.tune.youtubeTrackId && (
            <YouTubePlayer youtubeTrackId={state.tune.youtubeTrackId} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChordDetail;
