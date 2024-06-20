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
      default: "https://iau.edu.lc/wp-content/uploads/2016/09/dummy-image.jpg",
    },
    address: {
      type: String,
    },

    // this are not needed in the next version
    name: {
      type: String,
    },
    phone: {
      type: String,
    },
    email: {
      type: String,
    },
    country: {
      type: String,
      // required: [true, "Please select your country"],
      enum: ["Nigeria", "Ghana", "Benin"], // Ensure the value is one of the predefined countries
    },
    // Add other profile-related fields as needed
  },
  { timestamps: true }
);

const UserProfile = mongoose.model("UserProfile", userProfileSchema);

module.exports = UserProfile;
