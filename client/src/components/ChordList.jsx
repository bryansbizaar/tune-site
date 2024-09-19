import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "./Header";
import { sortTunes } from "../utils/sorting";
import { VITE_API_URL } from "../env";

const instruments = `${VITE_API_URL}/images/instruments.jpg`;

const ChordList = () => {
  const [tunes, setTunes] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
        setIsLoading(false);
      }
    };

    fetchChords();
  }, []);

  if (isLoading) {
    return <div data-testid="loading-indicator">Loading...</div>;
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
        <img className="img" src={instruments} alt="instruments" />
      </div>
      <div className="container">
        <h1 className="centered-content name">Chords</h1>
        <ul>
          {sortedTunes.map((tune) => (
            <li className="tune-name" key={tune.id}>
              <Link to={`/chords/${tune.id}`}>{tune.title}</Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
};

export default ChordList;
