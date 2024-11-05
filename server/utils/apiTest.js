import { VITE_API_URL } from "../env.js";

export const testApiConnection = async () => {
  console.log("Testing API connection to:", VITE_API_URL);

  try {
    // Test CORS preflight
    const preflightResponse = await fetch(`${VITE_API_URL}/api/tuneList`, {
      method: "OPTIONS",
      headers: {
        Origin: window.location.origin,
        "Access-Control-Request-Method": "GET",
      },
    });
    console.log("Preflight response:", preflightResponse);

    // Test actual request
    const response = await fetch(`${VITE_API_URL}/api/tuneList`, {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });

    console.log("Response status:", response.status);
    console.log("Response headers:", [...response.headers.entries()]);

    const data = await response.json();
    console.log("Response data:", data);

    return {
      success: true,
      status: response.status,
      data,
    };
  } catch (error) {
    console.error("API test failed:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};
