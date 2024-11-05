import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import SpotifyMusicPlayer from "./SpotifyMusicPlayer";
import Header from "./Header";
import TuneDisplay from "./TuneDisplay";
import { sortTunes } from "../utils/sorting";
import { VITE_API_URL } from "../env.js";
import { useAuth } from "../useAuth";

const instruments = `${VITE_API_URL}/images/instruments.jpg`;

const TuneList = () => {
  const [tunes, setTunes] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [clickedTuneId, setClickedTuneId] = useState(null);
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTunes = async () => {
      try {
        const response = await fetch(`${VITE_API_URL}/api/tuneList`, {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          console.error("Response not OK:", {
            status: response.status,
            statusText: response.statusText,
            url: response.url,
          });
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setTunes(data);
      } catch (err) {
        console.error("Error fetching tunes:", {
          message: err.message,
          apiUrl: VITE_API_URL,
          error: err,
          origin: window.location.origin,
        });
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTunes();
  }, []);

  const handleInternalTuneClick = (tuneId, e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      setClickedTuneId(tuneId);
      setTimeout(() => setClickedTuneId(null), 3000);
      return;
    }
    navigate(`/tune/${tuneId}`);
  };

  if (isLoading) {
    return <div data-testid="loading-indicator">Loading...</div>;
  }

  if (error) {
    return <div data-testid="error-message">Error: {error}</div>;
  }

  if (!tunes || tunes.length === 0) {
    return <div data-testid="no-tunes-message">No tunes available</div>;
  }

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
                  <>
                    <Link
                      to={`/tune/${tune.id}`}
                      onClick={(e) => handleInternalTuneClick(tune.id, e)}
                    >
                      {tune.title}
                    </Link>
                    {!isLoggedIn && clickedTuneId === tune.id && (
                      <span className="login-message"> (login required)</span>
                    )}
                  </>
                )}
                <span>: {tune.description}</span>
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
