import React from "react";
import { Link } from "react-router-dom";

const TuneDisplay = ({ tunesOfTheWeek, upNextTunes }) => {
  return (
    <div className="tunes-week tunes-container">
      <h2 className="centered-content sub-heading">
        Tune{tunesOfTheWeek.length > 1 ? "s" : ""} of the week:
      </h2>
      {tunesOfTheWeek.length > 0 ? (
        tunesOfTheWeek.map((tune) => (
          <p key={tune.id} className="tune-name">
            <Link to={`/tune/${tune.id}`}>{tune.title}</Link>
          </p>
        ))
      ) : (
        <p className="tune-name">TBD</p>
      )}

      <h2 className="centered-content sub-heading">Up next:</h2>
      {upNextTunes.length > 0 ? (
        upNextTunes.map((tune) => (
          <p key={tune.id} className="tune-name">
            <Link to={`/tune/${tune.id}`}>{tune.title}</Link>
          </p>
        ))
      ) : (
        <p className="tune-name">TBD</p>
      )}
    </div>
  );
};

export default TuneDisplay;
