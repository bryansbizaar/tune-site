// const nodemailer = require("nodemailer");

// const createTransporter = () => {
//   return nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: parseInt(process.env.EMAIL_PORT, 10),
//     secure: false, // or process.env.EMAIL_SECURE === 'true'
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//     tls: {
//       rejectUnauthorized: false,
//     },
//   });
// };

// const sendResetEmail = async (email, resetUrl) => {
//   const transporter = createTransporter();

//   try {
//     let info = await transporter.sendMail({
//       from: process.env.EMAIL_FROM || '"Your App" <noreply@yourapp.com>',
//       to: email,
//       subject: "Password Reset",
//       text: `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n
//              Please click on the following link, or paste this into your browser to complete the process:\n\n
//              ${resetUrl}\n\n
//              If you did not request this, please ignore this email and your password will remain unchanged.\n`,
//       html: `<p>You are receiving this because you (or someone else) have requested the reset of the password for your account.</p>
//              <p>Please click on the following link, or paste this into your browser to complete the process:</p>
//              <a href="${resetUrl}">${resetUrl}</a>
//              <p>If you did not request this, please ignore this email and your password will remain unchanged.</p>`,
//     });

//     return info;
//   } catch (error) {
//     console.error("Error sending password reset email:", error);
//     throw error;
//   } finally {
//     transporter.close();
//   }
// };

// module.exports = { sendResetEmail };

// const nodemailer = require("nodemailer");
// const sgMail = require("@sendgrid/mail");

// const createTransporter = async () => {
//   // Use SendGrid in production
//   if (process.env.NODE_ENV === "production") {
//     sgMail.setApiKey(process.env.SENDGRID_API_KEY);
//     return {
//       sendMail: async ({ from, to, subject, text, html }) => {
//         return sgMail.send({
//           from: process.env.SENDGRID_VERIFIED_SENDER,
//           to,
//           subject,
//           text,
//           html,
//         });
//       },
//     };
//   }

//   // Use Mailtrap for development/testing
//   return nodemailer.createTransport({
//     host: process.env.EMAIL_HOST,
//     port: parseInt(process.env.EMAIL_PORT, 10),
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//   });
// };

// const sendResetEmail = async (email, resetUrl) => {
//   try {
//     console.log("Creating email transporter...");
//     const transporter = await createTransporter();

//     const mailOptions = {
//       from:
//         process.env.NODE_ENV === "production"
//           ? process.env.SENDGRID_VERIFIED_SENDER
//           : '"Password Reset" <noreply@your-app.com>',
//       to: email,
//       subject: "Password Reset Request",
//       text: `Please use the following link to reset your password: ${resetUrl}
//              This link will expire in 1 hour.
//              If you did not request this reset, please ignore this email.`,
//       html: `
//         <h2>Password Reset Request</h2>
//         <p>Please click the link below to reset your password:</p>
//         <a href="${resetUrl}">${resetUrl}</a>
//         <p>This link will expire in 1 hour.</p>
//         <p>If you did not request this reset, please ignore this email.</p>
//       `,
//     };

//     console.log("Sending email with options:", {
//       to: mailOptions.to,
//       subject: mailOptions.subject,
//       resetUrl,
//     });

//     const info = await transporter.sendMail(mailOptions);
//     console.log("Email sent successfully:", info);

//     return info;
//   } catch (error) {
//     console.error("Error sending email:", {
//       error: error.message,
//       stack: error.stack,
//       code: error.code,
//       response: error.response,
//     });
//     throw new Error(`Failed to send password reset email: ${error.message}`);
//   }
// };

// module.exports = { sendResetEmail };

const sgMail = require("@sendgrid/mail");

const sendResetEmail = async (email, resetUrl) => {
  console.log("=== Starting email send process ===");

  try {
    console.log("Checking SendGrid configuration...");
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error("SendGrid API key is not configured");
    }
    if (!process.env.SENDGRID_VERIFIED_SENDER) {
      throw new Error("SendGrid verified sender is not configured");
    }

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    console.log("SendGrid API key configured");

    const msg = {
      to: email,
      from: process.env.SENDGRID_VERIFIED_SENDER,
      subject: "Password Reset Request",
      text: `You requested a password reset. Please use this link to reset your password: ${resetUrl}
             This link will expire in 1 hour.
             If you did not request this reset, please ignore this email.`,
      html: `
        <h2>Password Reset Request</h2>
        <p>You requested a password reset. Please click the link below to reset your password:</p>
        <a href="${resetUrl}">${resetUrl}</a>
        <p>This link will expire in 1 hour.</p>
        <p>If you did not request this reset, please ignore this email.</p>
      `,
    };

    console.log("Sending email with configuration:", {
      to: msg.to,
      from: msg.from,
      subject: msg.subject,
      resetUrlProvided: !!resetUrl,
    });

    const response = await sgMail.send(msg);
    console.log("Email sent successfully:", {
      statusCode: response[0].statusCode,
      headers: response[0].headers,
    });

    return response;
  } catch (error) {
    console.error("Error in sendResetEmail:", {
      message: error.message,
      stack: error.stack,
      code: error.code,
      response: error.response?.body,
    });
    throw error;
  }
};

module.exports = { sendResetEmail };
