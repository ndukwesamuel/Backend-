const mongoose = require("mongoose");

const Schema = mongoose.Schema;

// Create a schema for user profile
const AdminProfileSchema = new Schema(
  {
    level: {
      type: String,
    },

    // Add other profile-related fields as needed
  },
  { timestamps: true }
);

const AdminProfile = mongoose.model("AdminProfile", AdminProfileSchema);

module.exports = AdminProfile;
