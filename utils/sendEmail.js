const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, text, html }) => {
  const transporter = nodemailer.createTransport({
    host: "smtp-relay.brevo.com",
    // port: 587,
    port: 2525,
    auth: {
      user: process.env.BREVO_EMAIL,
      pass: process.env.BREVO_PASSWORD,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    // from: "Dev@gmail.com",
    from: "ndukwesamuel23@gmail.com",
    to: to,
    subject: subject,
    text: text,
    html,
  };

  const info = await transporter.sendMail(mailOptions);

  return info;
};

module.exports = sendEmail;
