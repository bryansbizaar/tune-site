// import React, { useState, useEffect } from "react";
// import { useParams, Link } from "react-router-dom";
// import SpotifyMusicPlayer from "./SpotifyMusicPlayer";
// import YouTubePlayer from "./YouTubePlayer";
// import Header from "./Header";
// import Spinner from "./Spinner";
// import { VITE_API_URL } from "../env";

// const TuneDetail = () => {
//   const [tune, setTune] = useState(null);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [imagesLoaded, setImagesLoaded] = useState(new Set());
//   const { id } = useParams();

//   useEffect(() => {
//     const fetchTune = async () => {
//       try {
//         const response = await fetch(`${VITE_API_URL}/api/tune/${id}`);
//         if (!response.ok) {
//           throw new Error("Failed to fetch tune data");
//         }
//         const data = await response.json();
//         setTune(data);
//         setError(null);
//       } catch (err) {
//         setError(err.message);
//         setTune(null);
//       }
//     };

//     fetchTune();
//   }, [id]);

//   useEffect(() => {
//     if (!tune) return;

//     const imageSources = [
//       `${VITE_API_URL}${tune.sheetMusicFile}`,
//       ...(tune.versions || []).map((version) => `${VITE_API_URL}${version}`),
//     ];

//     setIsLoading(true);

//     const loadImage = (src) => {
//       return new Promise((resolve, reject) => {
//         const img = new Image();
//         img.src = src;
//         img.onload = () => resolve(src);
//         img.onerror = () => reject(`Failed to load image: ${src}`);
//       });
//     };

//     Promise.all(imageSources.map((src) => loadImage(src)))
//       .then((loadedSrcs) => {
//         setImagesLoaded(new Set(loadedSrcs));
//         setIsLoading(false);
//       })
//       .catch((err) => {
//         console.error(err);
//         setError("Failed to load one or more images");
//         setIsLoading(false);
//       });
//   }, [tune]);

//   if (error) return <div>Error: {error}</div>;
//   if (isLoading) return <Spinner loading={true} />;
//   if (!tune) return <div>No tune found</div>;

//   const isImageLoaded = (src) => imagesLoaded.has(`${VITE_API_URL}${src}`);

//   return (
//     <>
//       <Header isFixed={false} />
//       <div className="centered-content chord-nav">
//         {tune.chords && <Link to={`/chords/${id}`}>Click to show chords</Link>}
//         {tune.description && <p className="text">{tune.description}</p>}

//         <div className="sheetMusicContainer">
//           <img
//             className="img-tune"
//             src={`${VITE_API_URL}${tune.sheetMusicFile}`}
//             alt={tune.title}
//             style={{
//               display: isImageLoaded(tune.sheetMusicFile) ? "block" : "none",
//             }}
//           />
//           {!isImageLoaded(tune.sheetMusicFile) && <Spinner loading={true} />}
//         </div>

//         {tune.versionDescription && (
//           <p className="text">{tune.versionDescription}</p>
//         )}

//         {tune.versions && tune.versions.length > 0 && (
//           <>
//             {tune.versions.map((version, index) => (
//               <div key={`version-${index + 2}`} className="sheetMusicContainer">
//                 <img
//                   className="img-tune"
//                   src={`${VITE_API_URL}${version}`}
//                   alt={`${tune.title} - Version ${index + 2}`}
//                   style={{ display: isImageLoaded(version) ? "block" : "none" }}
//                 />
//                 {!isImageLoaded(version) && <Spinner loading={true} />}
//               </div>
//             ))}
//           </>
//         )}

//         {tune.spotifyTrackId && (
//           <div className="musicPlayer">
//             <SpotifyMusicPlayer spotifyTrackId={tune.spotifyTrackId} />
//           </div>
//         )}

//         {tune.youtubeTrackId && (
//           <div className="musicPlayer">
//             <YouTubePlayer youtubeTrackId={tune.youtubeTrackId} />
//           </div>
//         )}
//       </div>
//     </>
//   );
// };

// export default TuneDetail;

// TuneDetail.jsx

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
  const [tune, setTune] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [imagesLoaded, setImagesLoaded] = useState(new Set());
  const { id } = useParams();

  useEffect(() => {
    const fetchTune = async (retryCount = 0) => {
      try {
        const response = await fetch(`${VITE_API_URL}/api/tune/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch tune data");
        }
        const data = await response.json();
        setTune(data);
      } catch (err) {
        console.error(`Attempt ${retryCount + 1} failed:`, err);
        if (retryCount < MAX_RETRIES) {
          setTimeout(() => fetchTune(retryCount + 1), RETRY_DELAY);
        } else {
          setError(err.message);
          setIsLoading(false);
        }
      }
    };

    fetchTune();
  }, [id]);

  useEffect(() => {
    if (!tune) return;

    const imageSources = [tune.sheetMusicFile, ...(tune.versions || [])].filter(
      Boolean
    );

    if (imageSources.length === 0) {
      setIsLoading(false);
      return;
    }

    const loadImage = async (src, retryCount = 0) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        const fullSrc = `${VITE_API_URL}${src}`;

        img.onload = () => resolve(src);
        img.onerror = async () => {
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

    Promise.all(imageSources.map((src) => loadImage(src)))
      .then((loadedSrcs) => {
        setImagesLoaded(new Set(loadedSrcs));
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Image loading error:", err);
        setError(`Failed to load images: ${err}`);
        setIsLoading(false);
      });
  }, [tune]);

  if (error) {
    return (
      <div role="alert" data-testid="error-message">
        Error: {error}
      </div>
    );
  }

  if (isLoading) {
    return <Spinner loading={true} data-testid="loading-spinner" />;
  }

  if (!tune) {
    return <div>No tune found</div>;
  }

  const isImageLoaded = (src) => imagesLoaded.has(src);

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

        <div
          className="sheetMusicContainer"
          role="img"
          aria-label={`Sheet music for ${tune.title}`}
        >
          <img
            className="img-tune"
            src={`${VITE_API_URL}${tune.sheetMusicFile}`}
            alt={tune.title}
            data-testid="main-sheet-music"
            style={{
              display: isImageLoaded(tune.sheetMusicFile) ? "block" : "none",
            }}
          />
        </div>

        {tune.versionDescription && (
          <p className="text" data-testid="version-description">
            {tune.versionDescription}
          </p>
        )}

        {tune.versions?.length > 0 && (
          <div data-testid="version-container">
            {tune.versions.map((version, index) => (
              <div
                key={`version-${index + 2}`}
                className="sheetMusicContainer"
                data-testid={`version-${index + 2}`}
              >
                <img
                  className="img-tune"
                  src={`${VITE_API_URL}${version}`}
                  alt={`${tune.title} - Version ${index + 2}`}
                  style={{
                    display: isImageLoaded(version) ? "block" : "none",
                  }}
                />
              </div>
            ))}
          </div>
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
