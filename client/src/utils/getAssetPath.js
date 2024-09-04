export const getAssetPath = (path) => {
  const basePath = import.meta.env.PROD ? "/tune-site" : "";
  return `${basePath}${path}`;
};
