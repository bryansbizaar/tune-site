import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SpotifyMusicPlayer from "./SpotifyMusicPlayer";
import Header from "./Header";
import TuneDisplay from "./TuneDisplay";
import instruments from "/images/instruments.jpg";
import { sortTunes } from "../utils/sorting";

const TuneList = () => {
  const [tunes, setTunes] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTunes = async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/tuneList`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch tune data");
        }
        const data = await response.json();
        setTunes(data);
      } catch (err) {
        console.error("Error fetching tunes:", err);
        setError(err.message);
      }
    };

    fetchTunes();
  }, []);

  if (error) return <div>Error: {error}</div>;
  if (!tunes) return <div>Loading...</div>;
  // if (tunes.length === 0) return <div>No tunes available</div>;

  const tunesOfTheWeek = tunes.filter((tune) => tune.tunesOfTheWeek === true);
  const upNextTunes = tunes.filter((tune) => tune.upNextTunes === true);

  const sortedTunes = sortTunes(tunes);

  return (
    <>
      <Header isFixed={true} />
      <div>
        <img className="img" src={instruments} alt="instruments" />
      </div>
      <div>
        <h1 className="centered-content name">Session Class Tunes</h1>
        <div className="container-content cc-tunes">
          <div className="text">
            <p>
              The Monday Session Classes are welcome to all ability levels. This
              is a great opportunity where folks can participate in a group
              setting and build up their repertoire. We begin at 4pm and spend
              the first hour or so learning new tunes, technique and more. The
              second portion (5-6pm) is spent reviewing all of the tunes we know
              together. This is the closest thing to a public session that
              happens in the community at the moment. Drop in to either whenever
              it suits.
            </p>
            <br></br>
            <p>
              Some of the tunes below redirect to either the NZ Irish Session
              (irish.session.nz) or The Session (thesession.org). Both sites are
              worth checking out as they offer slightly different features. For
              example, The NZ Irish Session allows you to slow a tune down while
              keeping the pitch constant. On The Session, there are usually
              multiple versions, who has recorded the tune, tune name
              variations, discussion and more. All other tunes have been
              transcribed by Bryan Owens. Keep an eye on below as the list will
              grow with time.
            </p>
          </div>
        </div>
        <TuneDisplay
          tunesOfTheWeek={tunesOfTheWeek}
          upNextTunes={upNextTunes}
        />
        <div className="container">
          <ul>
            <h2 className="centered-content sub-heading">
              Session Class Repertoire:
            </h2>
            {sortedTunes.map((tune) => (
              <li className="tune-name" key={tune.id}>
                {tune.hasExternalLink ? (
                  <a
                    href={tune.externalLinkUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {tune.title}
                  </a>
                ) : (
                  <Link to={`/tune/${tune.id}`}>{tune.title}</Link>
                )}
                : {tune.description}
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="musicPlayer">
        <SpotifyMusicPlayer spotifyPlaylistId="3PoOBseX7VUjZZXb4ij42D" />
      </div>
    </>
  );
};

export default TuneList;
