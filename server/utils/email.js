const { Resend } = require("resend");

const validateEmailConfig = () => {
  const requiredVars = ["RESEND_API_KEY", "FROM_EMAIL"];
  const missing = requiredVars.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    console.error(
      "Missing required environment variables:",
      missing.join(", ")
    );
    return false;
  }
  return true;
};

exports.sendResetEmail = async (email, resetUrl) => {
  try {
    if (!validateEmailConfig()) {
      throw new Error("Email service not properly configured");
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL, // e.g., "Whangarei Tunes <noreply@whangareitunes.com>"
      to: email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Password Reset Request</h2>
          <p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
          <p>Please click on the following link, or paste it into your browser to complete the process:</p>
          <p style="margin: 20px 0;">
            <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
              Reset Password
            </a>
          </p>
          <p style="color: #666; font-size: 0.9em;">
            If you did not request this, please ignore this email and your password will remain unchanged.
          </p>
          <p style="color: #999; font-size: 0.8em;">
            This link will expire in 1 hour.
          </p>
        </div>
      `,
    });

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Resend Error:", error);
    throw new Error("Failed to send reset email");
  }
};
