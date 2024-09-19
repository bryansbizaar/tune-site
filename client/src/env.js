export const getEnv = () => {
  if (import.meta && import.meta.env) {
    return import.meta.env;
  }
  return process.env;
};

export const VITE_API_URL = getEnv().VITE_API_URL || "http://localhost:5000";
