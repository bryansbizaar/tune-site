import React from "react";
import { Link } from "react-router-dom";
import { VITE_API_URL } from "../env.js";
import AuthButton from "./AuthButton";

const Navigation = () => {
  return (
    <nav>
      <ul className="nav">
        <li className="nav-item">
          <Link to="/tunelist">Tunes</Link>
          <Link to="/chords">Chords</Link>
          <Link to="/resources">Resources</Link>
          <AuthButton />
          <a
            href="https://www.facebook.com/groups/whangareifolkrootstraditionalmusic"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={`${VITE_API_URL}/images/facebook.png`}
              alt="facebook logo"
              className="facebook-icon"
            />
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default Navigation;
