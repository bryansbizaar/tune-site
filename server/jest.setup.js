require("dotenv").config({ path: ".env.test" });

process.env.JWT_SECRET = process.env.JWT_SECRET || "test-jwt-secret";
process.env.FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";
process.env.SENDGRID_API_KEY =
  process.env.SENDGRID_API_KEY || "test-sendgrid-key";
process.env.FROM_EMAIL = process.env.FROM_EMAIL || "test@example.com";
