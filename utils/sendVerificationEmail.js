const nodemailer = require("nodemailer");

const Mailgen = require("mailgen");

const sendVerificationEmail = (intro, name) => {
  const mailGenerator = new Mailgen({
    theme: "default",
    product: {
      // Appears in header & footer of e-mails
      name: "Webuyam",
      link: "https://mailgen.js/",
      // Optional product logo
      // logo: 'https://mailgen.js/img/logo.png'
    },
  });

  const email = {
    body: {
      name: name,
      intro: intro,
      // action: {
      //   instructions: "Please click the button below to verify your account:",
      //   button: {
      //     color: "#22BC66", // Optional action button color
      //     text: "Verify Account",
      //     // link: verificationLink,
      //   },
      // },
      outro: "If you didn't request this, you can ignore this email.",
    },
  };

  const emailBody = mailGenerator.generate(email);
  const emailText = mailGenerator.generatePlaintext(email);

  return { emailBody, emailText };
};

module.exports = { sendVerificationEmail };
