const nodemailer = require("nodemailer");

const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
    debug: true, // Enable debug logs
  });
};

const sendResetEmail = async (email, resetUrl) => {
  const transporter = createTransporter();

  try {
    let info = await transporter.sendMail({
      from: '"Your App Name" <noreply@yourapp.com>',
      to: email,
      subject: "Password Reset",
      text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
             Please click on the following link, or paste this into your browser to complete the process:\n\n
             ${resetUrl}\n\n
             If you did not request this, please ignore this email and your password will remain unchanged.\n`,
      html: `<p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
             <p>Please click on the following link, or paste this into your browser to complete the process:</p>
             <a href="${resetUrl}">${resetUrl}</a>
             <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`,
    });

    return info;
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  } finally {
    transporter.close();
  }
};

module.exports = { sendResetEmail };
