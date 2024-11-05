const sgMail = require("@sendgrid/mail");

// Function to validate environment variables
const validateEmailConfig = () => {
  const requiredVars = ["SENDGRID_API_KEY", "FROM_EMAIL"];
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

// Export the function directly
exports.sendResetEmail = async (email, resetUrl) => {
  try {
    // Validate configuration
    if (!validateEmailConfig()) {
      throw new Error("Email service not properly configured");
    }

    // Configure SendGrid
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
      to: email,
      from: process.env.FROM_EMAIL,
      subject: "Password Reset Request",
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
             Please click on the following link, or paste this into your browser to complete the process:\n\n
             ${resetUrl}\n\n
             If you did not request this, please ignore this email and your password will remain unchanged.\n
             This link will expire in 1 hour.`,
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
    };

    const result = await sgMail.send(msg);

    return result;
  } catch (error) {
    console.error("SendGrid Error Details:", {
      name: error.name,
      message: error.message,
      code: error.code,
      response: error.response?.body,
    });

    // Check for specific SendGrid errors
    if (error.code === 401) {
      throw new Error("Email service authentication failed");
    } else if (error.code === 403) {
      throw new Error("Email service permission denied");
    } else {
      throw new Error("Failed to send reset email");
    }
  }
};
