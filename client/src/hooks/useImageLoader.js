import { useState, useEffect } from "react";

export const useImageLoader = (imageSrc) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const image = new Image();
    image.src = imageSrc;

    const handleLoad = () => {
      setIsLoading(false);
    };

    const handleError = () => {
      console.error("Failed to load background image");
      setIsLoading(false);
    };

    if (image.complete) {
      setIsLoading(false);
    } else {
      image.addEventListener("load", handleLoad);
      image.addEventListener("error", handleError);
    }

    return () => {
      image.removeEventListener("load", handleLoad);
      image.removeEventListener("error", handleError);
    };
  }, [imageSrc]);

  return isLoading;
};
