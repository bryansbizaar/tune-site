import React from "react";
import { Link } from "react-router-dom";
import Navigation from "./Navigation";
import { useAuth } from "../useAuth";

const Header = ({ isFixed = true }) => {
  const { isLoggedIn, logout } = useAuth();

  return (
    <div className={`header ${isFixed ? "header-fixed" : ""}`}>
      <div className="title">
        <h1 className="title-text">
          <Link to="/">Whangarei Tunes</Link>
        </h1>
      </div>
      <Navigation isLoggedIn={isLoggedIn} logout={logout} />
    </div>
  );
};

export default Header;
