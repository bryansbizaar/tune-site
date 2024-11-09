import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import SpotifyMusicPlayer from "./SpotifyMusicPlayer";
import YouTubePlayer from "./YouTubePlayer";
import Header from "./Header";
import Spinner from "./Spinner";
import { VITE_API_URL } from "../env";

const TuneDetail = () => {
  const [state, setState] = useState({
    tune: null,
    isLoading: true,
    error: null,
  });

  const { id } = useParams();

  useEffect(() => {
    const fetchTune = async () => {
      try {
        const response = await fetch(`${VITE_API_URL}/api/tune/${id}`);
        if (!response.ok) {
          throw new Error("Failed to fetch tune data");
        }
        const data = await response.json();
        setState({
          tune: data,
          isLoading: false,
          error: null,
        });
      } catch (err) {
        setState({
          tune: null,
          isLoading: false,
          error: err.message,
        });
      }
    };

    fetchTune();
  }, [id]);

  const { tune, isLoading, error } = state;

  if (isLoading) {
    return <Spinner />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!tune) {
    return <div>No tune found</div>;
  }

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
          />
        </div>

        {tune.v2 && (
          <div className="sheetMusicContainer">
            <img
              className="img-tune"
              src={`${VITE_API_URL}${tune.v2}`}
              alt={`${tune.title} - Version 2`}
            />
          </div>
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
