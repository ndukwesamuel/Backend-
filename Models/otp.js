const mongoose = require("mongoose");

const { Schema } = mongoose;

const otpSchema = new Schema({
  email: {
    type: String,
    trim: true,
    lowercase: true,
    required: true,
  },
  otp: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 3600,
    // expires: 60 * 60, // The document will be automatically deleted after 5 minutes of its creation time
  },
});

const OTP = mongoose.model("OTP", otpSchema);
module.exports = OTP;
