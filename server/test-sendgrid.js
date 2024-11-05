require("dotenv").config(); // Load environment variables
const sgMail = require("@sendgrid/mail");

// Set your API key
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = {
  to: "bryansbizaar@gmail.com", // Your email address to receive the test
  from: process.env.SENDGRID_VERIFIED_SENDER, // Must be your verified sender email
  subject: "SendGrid Test Email",
  text: "If you receive this, SendGrid is working correctly!",
  html: "<strong>If you receive this, SendGrid is working correctly!</strong>",
};

async function testSendGrid() {
  try {
    console.log("Attempting to send test email...");
    console.log("Using sender:", msg.from);
    console.log("Sending to:", msg.to);

    const response = await sgMail.send(msg);
    console.log("Email sent successfully!");
    console.log("Response:", response[0].statusCode);
  } catch (error) {
    console.error("Error sending email:");
    console.error("Status Code:", error.code);
    console.error("Response:", error.response?.body);
    console.error("Full error:", error);
  }
}

testSendGrid();
