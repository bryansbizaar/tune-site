import React from "react";
import { Link } from "react-router-dom";
import Navigation from "./Navigation";

const Header = ({ isFixed = true }) => {
  return (
    <>
      <div className={`header ${isFixed ? "header-fixed" : ""}`}>
        <div className="title">
          <h1 className="title-text">
            <Link to="/">Whangarei Tunes </Link>
          </h1>
        </div>
        <Navigation />
      </div>
    </>
  );
};

export default Header;
