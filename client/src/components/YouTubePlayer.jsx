const YouTubePlayer = ({ youtubeTrackId }) => {
  const embedUrl = `https://www.youtube.com/embed/${youtubeTrackId}`;

  return (
    <iframe
      src={embedUrl}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowFullScreen
      loading="lazy"
      title="YouTube player"
    ></iframe>
  );
};

export default YouTubePlayer;