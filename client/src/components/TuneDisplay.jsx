import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../useAuth";

const TuneDisplay = ({ tunesOfTheWeek, upNextTunes }) => {
  const [loginMessages, setLoginMessages] = useState({});
  const { isLoggedIn } = useAuth();

  const handleTuneClick = (tune, e) => {
    if (!tune) return;

    // Always prevent default to handle navigation manually
    e.preventDefault();

    if (tune.hasExternalLink && tune.externalLinkUrl) {
      // Use window.open for external links
      window.open(tune.externalLinkUrl, "_blank");
      return;
    }

    if (!isLoggedIn) {
      // Show login message for this specific tune
      setLoginMessages((prev) => ({
        ...prev,
        [tune.id]: true,
      }));

      // Clear message after 3 seconds
      setTimeout(() => {
        setLoginMessages((prev) => ({
          ...prev,
          [tune.id]: false,
        }));
      }, 3000);

      return;
    }

    // If logged in, navigate to tune detail
    window.location.href = `/tune/${tune.id}`;
  };

  const renderTuneLink = (tune) => {
    if (!tune || !tune.id || !tune.title) return null;

    if (tune.hasExternalLink && tune.externalLinkUrl) {
      return (
        <a
          href={tune.externalLinkUrl}
          onClick={(e) => handleTuneClick(tune, e)}
          target="_blank"
          rel="noopener noreferrer"
        >
          {tune.title}
        </a>
      );
    }

    return (
      <>
        <Link to={`/tune/${tune.id}`} onClick={(e) => handleTuneClick(tune, e)}>
          {tune.title}
        </Link>
        {!isLoggedIn && loginMessages[tune.id] && (
          <span className="login-message"> (login required)</span>
        )}
      </>
    );
  };

  return (
    <div className="tunes-week tunes-container">
      <h2 className="centered-content sub-heading">
        Tune{tunesOfTheWeek.length > 1 ? "s" : ""} of the week:
      </h2>
      {tunesOfTheWeek.length > 0 ? (
        tunesOfTheWeek.map((tune) => (
          <p key={tune.id} className="tune-name">
            {renderTuneLink(tune)}
          </p>
        ))
      ) : (
        <p className="tune-name">TBD</p>
      )}

      <h2 className="centered-content sub-heading">Up next:</h2>
      {upNextTunes.length > 0 ? (
        upNextTunes.map((tune) => (
          <p key={tune.id} className="tune-name">
            {renderTuneLink(tune)}
          </p>
        ))
      ) : (
        <p className="tune-name">TBD</p>
      )}
    </div>
  );
};

export default TuneDisplay;
