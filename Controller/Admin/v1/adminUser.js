const User = require("../../../Models/Users");
const AdminProfile = require("../../../Models/AdminProfile");

// Function to create an admin user
const createAdminUser = async function ({
  fullName,
  email,
  password,
  country,
  level,
}) {
  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new Error("Admin with this email already exists.");
    }

    // Create a new user with isAdmin set to true
    const newAdmin = new User({
      fullName,
      email,
      password,
      country,
      isAdmin: true, // Set this user as admin
      verified: true, // Optionally set the user as verified
    });

    // Save the admin user to the database
    const savedAdmin = await newAdmin.save();

    // Create the admin profile
    const adminProfile = new AdminProfile({
      level, // Set the admin level
      // Add other fields as needed
    });

    // Save the admin profile and link it with the created admin user
    await adminProfile.save();

    console.log("Admin user created successfully!");
    return savedAdmin;
  } catch (error) {
    console.error("Error creating admin user:", error.message);
    throw error;
  }
};

module.exports = {
  createAdminUser,
};
