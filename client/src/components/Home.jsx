import React, { useState, useEffect } from "react";
import Header from "./Header";
import Spinner from "./Spinner";
import { useImageLoader } from "../hooks/useImageLoader";
import instrumentsImage from "../assets/images/instruments.jpg";

const Home = () => {
  // const [isLoading, setIsLoading] = useState(true);

  const isLoading = useImageLoader(instrumentsImage);

  // useEffect(() => {
  //   const image = new Image();
  //   image.src = instrumentsImage;

  //   const handleLoad = () => {
  //     setIsLoading(false);
  //   };

  //   const handleError = () => {
  //     console.error("Failed to load background image");
  //     setIsLoading(false); // Still hide spinner even if image fails
  //   };

  //   if (image.complete) {
  //     // Image is already cached
  //     setIsLoading(false);
  //   } else {
  //     image.addEventListener("load", handleLoad);
  //     image.addEventListener("error", handleError);
  //   }

  //   return () => {
  //     // Cleanup listeners
  //     image.removeEventListener("load", handleLoad);
  //     image.removeEventListener("error", handleError);
  //   };
  // }, []);

  if (isLoading) {
    return <Spinner loading={true} />;
  }
  return (
    <>
      <Header isFixed={true} />
      <img className="img" src={instrumentsImage} alt="instruments" />
      <div className="container">
        <div className="container-content cc-home">
          <p className="text">
            Welcome! We're a collection of musos in the Whangarei area who enjoy
            playing acoustic trad folk and roots music. We currently host a
            weekly Session Class that teaches tunes, musicianship and etiquette.
            We also host Sunday Tunes fortnightly at the Judge Ale House
            including new and old tunes from around the world. This site is a
            place to discover new music and to grow a common repertoire in the
            community. There are many standards included here, as well as unique
            and interesting pieces that are reflective of our individual tastes
            and backgrounds. We are fortunate for all of the great resources out
            there today for learning music, so have fun exploring and we hope
            see you out there!
          </p>
        </div>
      </div>
    </>
  );
};

export default Home;
