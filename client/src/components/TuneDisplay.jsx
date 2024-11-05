import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../useAuth";

const TuneDisplay = ({ tunesOfTheWeek, upNextTunes }) => {
  const [clickedTuneId, setClickedTuneId] = useState(null);
  const { isLoggedIn } = useAuth();
  const navigate = useNavigate();

  const handleTuneClick = (tune, e) => {
    e.preventDefault();
    if (tune.hasExternalLink) {
      window.open(tune.externalLinkUrl, "_blank");
      return;
    }

    if (!isLoggedIn) {
      setClickedTuneId(tune.id);
      setTimeout(() => setClickedTuneId(null), 3000);
      return;
    }
    navigate(`/tune/${tune.id}`);
  };

  return (
    <div className="tunes-week tunes-container">
      <h2 className="centered-content sub-heading">
        Tune{tunesOfTheWeek.length > 1 ? "s" : ""} of the week:
      </h2>
      {tunesOfTheWeek.length > 0 ? (
        tunesOfTheWeek.map((tune) => (
          <p key={tune.id} className="tune-name">
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
                  onClick={(e) => handleTuneClick(tune, e)}
                >
                  {tune.title}
                </Link>
                {!isLoggedIn && clickedTuneId === tune.id && (
                  <span className="login-message"> (login required)</span>
                )}
              </>
            )}
          </p>
        ))
      ) : (
        <p className="tune-name">TBD</p>
      )}

      <h2 className="centered-content sub-heading">Up next:</h2>
      {upNextTunes.length > 0 ? (
        upNextTunes.map((tune) => (
          <p key={tune.id} className="tune-name">
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
                  onClick={(e) => handleTuneClick(tune, e)}
                >
                  {tune.title}
                </Link>
                {!isLoggedIn && clickedTuneId === tune.id && (
                  <span className="login-message"> (login required)</span>
                )}
              </>
            )}
          </p>
        ))
      ) : (
        <p className="tune-name">TBD</p>
      )}
    </div>
  );
};

export default TuneDisplay;
