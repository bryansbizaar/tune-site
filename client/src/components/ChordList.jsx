import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "./Header";
import { sortTunes } from "../utils/sorting";
import { VITE_API_URL } from "../env";
import { useAuth } from "../useAuth";
import Spinner from "./Spinner";
import { useImageLoader } from "../hooks/useImageLoader";
import instrumentsImage from "../assets/images/instruments.jpg";

const ChordList = () => {
  const [tunes, setTunes] = useState([]);
  const [error, setError] = useState(null);
  const [isFetchLoading, setIsFetchLoading] = useState(true);
  const [clickedChordId, setClickedChordId] = useState(null);
  const { isLoggedIn } = useAuth();

  const isImageLoading = useImageLoader(instrumentsImage);

  useEffect(() => {
    const fetchChords = async () => {
      try {
        const response = await fetch(`${VITE_API_URL}/api/tuneList`);
        if (!response.ok) {
          throw new Error("Failed to fetch tune data");
        }
        const data = await response.json();
        const tunesWithChords = data.filter((tune) => tune.hasChords);
        setTunes(tunesWithChords);
      } catch (err) {
        console.error("Error fetching tunes:", err);
        setError(err.message);
      } finally {
        setIsFetchLoading(false);
      }
    };

    fetchChords();
  }, []);

  const handleChordClick = (tuneId, e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setClickedChordId(tuneId);
      setTimeout(() => setClickedChordId(null), 3000);
      return;
    }
    window.location.href = `/chords/${tuneId}`;
  };

  if (isImageLoading || isFetchLoading) {
    return <Spinner loading={true} />;
  }

  if (error) {
    return <div data-testid="error-message">Error: {error}</div>;
  }

  if (!tunes || tunes.length === 0) {
    return <div data-testid="no-tunes-message">No tunes available</div>;
  }

  const sortedTunes = sortTunes(tunes);

  return (
    <>
      <Header isFixed={true} />
      <div>
        <img className="img" src={instrumentsImage} alt="instruments" />
      </div>
      <div className="container">
        <h1 className="centered-content name">Chords</h1>
        <ul>
          {sortedTunes.map((tune) => (
            <li className="tune-name" key={tune.id}>
              <Link
                to={`/chords/${tune.id}`}
                onClick={(e) => handleChordClick(tune.id, e)}
              >
                {tune.title}
              </Link>
              {!isLoggedIn && clickedChordId === tune.id && (
                <span className="login-message"> (login required)</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default ChordList;
