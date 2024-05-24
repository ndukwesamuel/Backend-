const UserProfile = require("../models/userProfile");
const wallet = require("../models/wallet");
const anchorService = require("../services/AncorService");
const Beneficiaries = require("../models/beneficiaries");
const customError = require("../utils/customError");
const { log } = require("console");
const sendEmail = require("../utils/sendEmail");
const fs = require("fs").promises;

exports.TestService = async () => {
  // Updating userProfile model
  const htmlFilePath = "../utils/test.html";

  const htmlContent = await fs.readFile(htmlFilePath, "utf8");

  const info = await sendEmail({
    to: "ndukwesamuel23@gmail.com",
    subject: "This is a Test",

    html: htmlContent,
  });

  console.log("Message sent: %s", info.messageId);
  return `has been added as a beneficiary `;
};
