const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const emailVerification = require("../Models/emailVerification");
const userPasswordReset = require("../Models/passwordReset");
const { v4: uuidv4 } = require("uuid");
const sendEmail = require("../utils/sendEmail");
const customError = require("../utils/customError");
const { EmailFunction } = require("../utils/EmailFunction");
require("dotenv").config();

// Nodemailer
var transporter = nodemailer.createTransport({
  host: "smtp.elasticemail.com",
  port: 2525,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.ELASTIC_PASSWORD,
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
const BravoSendPasswordResetEmail = async ({ _id, email, fullName }, res) => {
  const uniqueString = uuidv4() + _id;
  const redirectUrl = "https://www.webuyam.com";
  const first_name = fullName.split(/\s+/)[0];

  try {
    const subject = "Password Reset";
    const intro = `<p>
    Hi ${first_name}, <br>

    Trouble signing in? <br>
    Resetting your password is easy.

    Just click the link below and follow the instructions. We'll have you up and running in no time.
    <a href="${redirectUrl}/reset-password?userId=${_id}&uniqueString=${uniqueString}">Click here</a>.</p>

    <p>Kind Regards.</p>
`;

    const { emailBody, emailText } = EmailFunction(intro, first_name);

    const info = await sendEmail({
      to: email,
      subject,
      text: emailText,
      html: emailBody,
    });

    const hashedUniqueString = await bcrypt.hash(uniqueString, 10);
    const passwordReset = new userPasswordReset({
      userId: _id,
      uniqueString: hashedUniqueString,
      createdAt: Date.now(),
      expireAt: Date.now() + 3600000,
    });

    await passwordReset.save();

    res.status(200).json({
      status: "pending",
      message: `Password reset email sent to ${info.envelope.to}`,
    });
  } catch (err) {
    res.status(500).json({
      message:
        "Error occurred during the process of sending password reset email",
    });
  }
};

// Email verification

const BrevosendVerificationEmail = async ({ _id, email, fullName }, res) => {
  const uniqueString = uuidv4() + _id;
  const redirectUrl = "https://www.webuyam.com"; // this is for live
  // const redirectUrl = "http://localhost:3000";
  const first_name = fullName?.split(/\s+/)[0];

  try {
    const hashedUniqueString = await bcrypt.hash(uniqueString, 10);
    const verification = new emailVerification({
      userId: _id,
      uniqueString: hashedUniqueString,
      createdAt: Date.now(),
      expireAt: Date.now() + 86400000, ////1 day
    });

    await verification.save();

    const subject = "Account Verification";
    const intro = `<p>Hello ${first_name},<br> You registered an account on <a href="https://www.webuyam.com">Webuyam</a> website. 
    Before being able to use your account, you need to verify that this is your email
    address by clicking <a href="${redirectUrl}/verify-email?userId=${_id}&uniqueString=${uniqueString}">here</a>.
    </p> \n <b>Verification link expires in 1 day.</b><p>Kind Regards.</p>`;

    const { emailBody, emailText } = EmailFunction(intro, first_name);

    const info = await sendEmail({
      to: email,
      subject,
      text: emailText,
      html: emailBody,
    });

    return {
      success: true,
      status: "pending",
      message: `Verification link has been sent to ${info.envelope.to}`,
    };
  } catch (error) {
    // console.error("Error during email verification:", error);
    throw new Error(
      "Error occurred during the process of sending verification email"
    );
  }
};

module.exports = { BrevosendVerificationEmail, BravoSendPasswordResetEmail };
