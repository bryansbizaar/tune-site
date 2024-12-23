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
  const [imagesLoaded, setImagesLoaded] = useState(new Set());
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
        setError(null);
      } catch (err) {
        setError(err.message);
        setTune(null);
      }
    };

    fetchTune();
  }, [id]);

  useEffect(() => {
    if (!tune) return;

    const imageSources = [
      `${VITE_API_URL}${tune.sheetMusicFile}`,
      ...(tune.versions || []).map((version) => `${VITE_API_URL}${version}`),
    ];

    setIsLoading(true);

    const loadImage = (src) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = src;
        img.onload = () => resolve(src);
        img.onerror = () => reject(`Failed to load image: ${src}`);
      });
    };

    Promise.all(imageSources.map((src) => loadImage(src)))
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
  if (isLoading) return <Spinner loading={true} />;
  if (!tune) return <div>No tune found</div>;

  const isImageLoaded = (src) => imagesLoaded.has(`${VITE_API_URL}${src}`);

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
            style={{
              display: isImageLoaded(tune.sheetMusicFile) ? "block" : "none",
            }}
          />
          {!isImageLoaded(tune.sheetMusicFile) && <Spinner loading={true} />}
        </div>

        {tune.versionDescription && (
          <p className="text">{tune.versionDescription}</p>
        )}

        {tune.versions && tune.versions.length > 0 && (
          <>
            {tune.versions.map((version, index) => (
              <div key={`version-${index + 2}`} className="sheetMusicContainer">
                <img
                  className="img-tune"
                  src={`${VITE_API_URL}${version}`}
                  alt={`${tune.title} - Version ${index + 2}`}
                  style={{ display: isImageLoaded(version) ? "block" : "none" }}
                />
                {!isImageLoaded(version) && <Spinner loading={true} />}
              </div>
            ))}
          </>
        )}

        {tune.spotifyTrackId && (
          <div className="musicPlayer">
            <SpotifyMusicPlayer spotifyTrackId={tune.spotifyTrackId} />
          </div>
        )}

        {tune.youtubeTrackId && (
          <div className="musicPlayer">
            <YouTubePlayer youtubeTrackId={tune.youtubeTrackId} />
          </div>
        )}
      </div>
    </>
  );
};

export default TuneDetail;
