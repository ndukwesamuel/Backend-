const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// Create a schema for user profile
const userProfileSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "user", // This should match the model name for the user schema
      required: true,
    },
    profileImage: {
      type: String, // You can store the image URL or file path here
    },
    address: {
      type: String,
    },
    name: {
      type: String,
    },
    phone: {
      type: String,
    },
    email: {
      type: String,
    },
    // Add other profile-related fields as needed
  },
  { timestamps: true }
);

const UserProfile = mongoose.model("UserProfile", userProfileSchema);

module.exports = UserProfile;
