import React from "react";
import { Link } from "react-router-dom";

const Navigation = () => {
  return (
    <nav>
      <ul className="nav">
        <li className="nav-item">
          <Link to="/tunelist">Tunes</Link>
          <Link to="/chords">Chords</Link>
          <Link to="/resources">Resources</Link>
          <a
            href="https://www.facebook.com/groups/whangareifolkrootstraditionalmusic"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="/images/facebook.png"
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
