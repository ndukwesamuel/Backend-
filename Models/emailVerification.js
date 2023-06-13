const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const emailVerificationSchema = new Schema({
  userId: {
    type: String,
  },
  uniqueString: {
    type: String,
  },
  createdAt: {
    type: Date,
  },
  expireAt: {
    type: Date,
  },
});
const emailVerification = mongoose.model(
  "emailVerification",
  emailVerificationSchema
);
module.exports = emailVerification;
