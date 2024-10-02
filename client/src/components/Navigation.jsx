import React from "react";
import { Link } from "react-router-dom";
import { VITE_API_URL } from "../env.js";

const Navigation = ({ isLoggedIn, logout }) => {
  const handleLogout = (e) => {
    e.preventDefault();
    logout();
  };

  return (
    <nav>
      <ul className="nav">
        <li className="nav-item">
          <Link to="/tunelist">Tunes</Link>
          <Link to="/chords">Chords</Link>
          <Link to="/resources">Resources</Link>
          {isLoggedIn ? (
            <button onClick={handleLogout}>Log Out</button>
          ) : (
            <Link to="/login">Log In</Link>
          )}
          <a
            href="https://www.facebook.com/groups/whangareifolkrootstraditionalmusic"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={`${VITE_API_URL}/images/facebook.png`}
              alt="facebook logo"
              width="17"
              height="17"
              style={{ marginLeft: "10px" }}
            />
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;
