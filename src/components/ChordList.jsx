import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Header from "./Header";
import instruments from "/images/instruments.jpg";
import { sortTunes } from "../utils/sorting";

const ChordList = () => {
  const [tunes, setTunes] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChords = async () => {
      try {
        const response = await fetch("/data/tuneList.json");
        if (!response.ok) {
          throw new Error("Failed to fetch tune data");
        }
        const data = await response.json();
        // Filter tunes to only those with chord image files
        const tunesWithChords = data.filter((tune) => tune.hasChords);
        setTunes(tunesWithChords);
      } catch (err) {
        console.error("Error fetching tunes:", err);
        setError(err.message);
      }
    };

    fetchChords();
  }, []);

  if (error) return <div>Error: {error}</div>;
  if (!tunes) return <div>Loading...</div>;
  // if (tunes.length === 0) return <div>No chords available</div>;

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
