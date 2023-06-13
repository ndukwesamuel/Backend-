const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const emailVerification = require("../Models/emailVerification");
const userPasswordReset = require("../Models/passwordReset");
const { v4: uuidv4 } = require("uuid");
const jwt = require("jsonwebtoken");

// Nodemailer
var transporter = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "290f5354fdc7e3",
    pass: "f236d8722098c2",
  },
});

// TESTING TRANSPORTER

transporter.verify((error, message) => {
  if (error) {
    console.log(error);
  } else {
    console.log("Messaging portal is set");
  }
});

// Configuration for Password reset email
const sendPasswordResetEmail = async ({ _id, email }, redirectUrl, res) => {
  const uniqueString = uuidv4() + _id;

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Password Reset",
    html: `<p>Please click the link to reset your password: <a href=${redirectUrl}?userId=${_id}&uniqueString=${uniqueString}>here</a></p>
  \n <b>Verification code expires in 1 hour</b>`,
  };

  try {
    const hashedUniqueString = await bcrypt.hash(uniqueString, 10);
    const passwordReset = new userPasswordReset({
      userId: _id,
      uniqueString: hashedUniqueString,
      createdAt: Date.now(),
      expireAt: Date.now() + 3600000,
    });

    await passwordReset.save();
    transporter.sendMail(mailOptions);

    res.status(200).json({
      status: "pending",
      message: "Password reset email sent",
    });
  } catch (err) {
    res.status(500).json({
      message:
        "Error occurred during the process of sending password reset email",
    });
  }
};

// Email verification
const sendVerificationEmail = async ({ _id, email }, res) => {
  const uniqueString = uuidv4() + _id;
  const redirectUrl = "webuy-opal.vercel.app";

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: "Email Verification",
    html: `<p>Please click the link to verify your email: <a href=${redirectUrl}/verify-email?userId=${_id}&uniqueString=${uniqueString}>here</a></p> \n <b>Verification link expires in 1 hour</b>`,
  };

  try {
    const hashedUniqueString = await bcrypt.hash(uniqueString, 10);
    const verification = new emailVerification({
      userId: _id,
      uniqueString: hashedUniqueString,
      createdAt: Date.now(),
      expireAt: Date.now() + 3600000,
    });

    await verification.save();
    transporter.sendMail(mailOptions);

    res.status(200).json({
      status: "pending",
      message: "Verification email sent",
    });
  } catch (err) {
    res.status(500).json({
      message:
        "Error occurred during the process of sending verification email",
    });
  }
};

module.exports = { sendVerificationEmail, sendPasswordResetEmail };
