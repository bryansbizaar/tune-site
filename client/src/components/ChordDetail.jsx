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
  const [imagesLoaded, setImagesLoaded] = useState(new Set());
  const { id } = useParams();

  // Fetch tune data
  useEffect(() => {
    const fetchChord = async () => {
      try {
        const response = await fetch(`${VITE_API_URL}/api/chords/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch chord data");
        }
        const data = await response.json();
        setTune(data);

        // If no images to load, we can stop loading immediately
        if (
          !data.chords &&
          (!data.chordVersions || data.chordVersions.length === 0)
        ) {
          setIsLoading(false);
        }
      } catch (err) {
        console.error("Error fetching chord:", err);
        setError(err.message);
        setIsLoading(false);
      }
    };

    fetchChord();
    setImagesLoaded(new Set());
  }, [id]);

  // Handle image loading
  useEffect(() => {
    if (!tune) return;

    const imagesToLoad = [tune.chords, ...(tune.chordVersions || [])].filter(
      Boolean
    );

    if (imagesToLoad.length === 0) return;

    const loadImage = (src) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(src);
        img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
        img.src = `${VITE_API_URL}${src}`;
      });
    };

    Promise.all(imagesToLoad.map(loadImage))
      .then((loadedSrcs) => {
        setImagesLoaded(new Set(loadedSrcs));
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load one or more images");
        setIsLoading(false);
      });
  }, [tune]);

  if (error) return <div>Error: {error}</div>;
  if (!tune) return <div>No tune found</div>;

  // Check if all required images are loaded
  const allImagesLoaded = tune
    ? [tune.chords, ...(tune.chordVersions || [])]
        .filter(Boolean)
        .every((src) => imagesLoaded.has(src))
    : false;

  // Show spinner until everything is loaded
  if (isLoading || !allImagesLoaded) {
    return <Spinner loading={true} />;
  }

  return (
    <>
      <Header isFixed={false} />
      <div>
        <p className={tune.chordsDescription ? "centered-content text" : ""}>
          {tune.chordsDescription}
        </p>

        {tune.chords && (
          <div className="sheetMusicContainer">
            <img
              className="img-tune"
              src={`${VITE_API_URL}${tune.chords}`}
              alt={`Chord diagram for ${tune.title}`}
            />
          </div>
        )}

        {tune.chordVersions?.map((version, index) => (
          <div
            key={`chord-version-${index + 2}`}
            className="sheetMusicContainer"
          >
            <img
              className="img-tune"
              src={`${VITE_API_URL}${version}`}
              alt={`${tune.title} - Chord Version ${index + 2}`}
            />
          </div>
        ))}

        {!tune.chords && !tune.chordVersions?.length && (
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
