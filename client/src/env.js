export const getEnv = () => {
  console.log("Environment variables:", {
    import_meta: !!import.meta,
    import_meta_env: import.meta?.env,
    process_env: process.env,
  });

  if (import.meta && import.meta.env) {
    console.log("Using import.meta.env:", import.meta.env);
    return import.meta.env;
  }
  console.log("Using process.env:", process.env);
  return process.env;
};

export const VITE_API_URL = (() => {
  const url = getEnv().VITE_API_URL || "http://localhost:5000";
  console.log("Selected API URL:", url);
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
