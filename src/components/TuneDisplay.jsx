import React from "react";
import { Link } from "react-router-dom";

const TuneDisplay = ({ tuneOfTheWeek, upNextTune }) => {
  return (
    <div className="tunes-week tunes-container">
      <h2 className="centered-content sub-heading">Tune of the week:</h2>
      {tuneOfTheWeek ? (
        <p className="tune-name">
          <Link to={`/tune/${tuneOfTheWeek.id}`}>{tuneOfTheWeek.title}</Link>
        </p>
      ) : (
        <p className="tune-name">TBD</p>
      )}

      <h2 className="centered-content sub-heading">Up next:</h2>
      {upNextTune ? (
        <p className="tune-name">
          <Link to={`/tune/${upNextTune.id}`}>{upNextTune.title}</Link>
        </p>
      ) : (
        <p className="tune-name">TBD</p>
      )}
    </div>
  );
};

export default TuneDisplay;
