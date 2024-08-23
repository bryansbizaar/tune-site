const getRoutePath = (path) => {
  return process.env.NODE_ENV === "production" ? `/tune-site${path}` : path;
};
