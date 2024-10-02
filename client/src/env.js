const getEnv = () => {
  if (typeof process !== "undefined" && process.env) {
    return process.env;
  }
  if (typeof import.meta !== "undefined" && import.meta.env) {
    return import.meta.env;
  }
  return {};
};

export const VITE_API_URL = getEnv().VITE_API_URL || "http://localhost:5000";
