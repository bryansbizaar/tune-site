export const getEnv = () => {
  if (import.meta && import.meta.env) {
    return import.meta.env;
  }
  return process.env;
};

export const VITE_API_URL = (() => {
  const url = getEnv().VITE_API_URL || "http://localhost:5000";
  return url;
})();

// Validate API URL
if (!VITE_API_URL) {
  console.error("API URL is not defined!");
}

// Test if URL is properly formatted
try {
  new URL(VITE_API_URL);
} catch (e) {
  console.error("Invalid API URL format:", VITE_API_URL);
}
