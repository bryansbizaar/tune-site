import React, { useState, useEffect } from "react";
import Header from "./Header";
import Spinner from "./Spinner";
import { useImageLoader } from "../hooks/useImageLoader";
import instrumentsImage from "../assets/images/instruments.jpg";

function Resources() {
  const isLoading = useImageLoader(instrumentsImage);

  if (isLoading) {
    return <Spinner loading={true} />;
  }

  return (
    <>
      <Header isFixed={true} />
      <div>
        <img className="img" src={instrumentsImage} alt="instruments" />
      </div>
      <div className="container">
        <div className="container-content cc-resources">
          <div className="text">
            <p>
              There are many great places to learn tunes online. Aside from the
              abundance of listening options (YouTube, Spotify etc), here are
              just a few excellent resources for exploring and expanding your
              repertoire:
            </p>
          </div>
          <div className="resources">
            <p className="resource-content">
              <span className="group">Celtic:</span>
              <span className="space"></span>
              <a
                href="https://irish.session.nz/"
                target="_blank"
                rel="noopener noreferrer"
              >
                NZ Irish Sessions
              </a>
              ,<span className="space"></span>
              <a
                href="https://thesession.org/"
                target="_blank"
                rel="noopener noreferrer"
              >
                The Session
              </a>
              ,<span className="space"></span>
              <a
                href="https://www.youtube.com/@TradTG4"
                target="_blank"
                rel="noopener noreferrer"
              >
                TradTG4
              </a>
              ,<span className="space"></span>
              <a
                href="https://www.youtube.com/channel/UCE_cHdA5wcltfuaXyK67GQw/featured"
                target="_blank"
                rel="noopener noreferrer"
              >
                Comhaltas Foinn Seisiun
              </a>
              ,<span className="space"></span>
              <a
                href="https://www.youtube.com/@MartinHayesFiddle/videos"
                target="_blank"
                rel="noopener noreferrer"
              >
                Martin Hayes
              </a>
              ,<span className="space"></span>
              <a
                href="https://www.youtube.com/playlist?list=PL8B7WrVadMy6TUR_PLEKXhglaretoOnHy"
                target="_blank"
                rel="noopener noreferrer"
              >
                Fergal Scahill
              </a>
            </p>
            <p className="resource-content">
              <span className="group">North America:</span>
              <span className="space"></span>
              <a
                href="https://tunearch.org/wiki/TTA"
                target="_blank"
                rel="noopener noreferrer"
              >
                The Traditional Tune Archive
              </a>
            </p>
            <p className="resource-content">
              <span className="group">Nordic:</span>
              <span className="space"></span>
              <a
                href="https://www.youtube.com/@TheStringway/videos"
                target="_blank"
                rel="noopener noreferrer"
              >
                Daniel Pettersson-Spelman
              </a>
            </p>
            <p className="resource-content">
              <span className="group">Various:</span>
              <span className="space"></span>
              <a
                href="https://www.youtube.com/@thegoodtunes/videos"
                target="blank"
                rel="noopener noreferrer"
              >
                The Good Tune
              </a>
              ,<span className="space"></span>
              <a
                href="https://www.youtube.com/@TheFolkMusicAcademy/videos"
                target="blank"
                rel="noopener noreferrer"
              >
                Folk Music Academy
              </a>
              ,<span className="space"></span>
              <a
                href="https://artistworks.com/"
                target="blank"
                norel="noopener noreferrer"
              >
                Artist Works
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default Resources;
