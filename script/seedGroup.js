const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { faker } = require("@faker-js/faker");
const User = require("../Models/Users");
const UserProfile = require("../Models/UserProfile");
const Group = require("../Models/Group");

// Generate a random Nigerian name
function getRandomNigerianName() {
  const firstNames = [
    "Chinwe",
    "Adebayo",
    "Ngozi",
    "Emeka",
    "Yemi",
    "Ifeanyi",
    "Chika",
    "Adeola",
    "Chinedu",
    "Funke",
  ];
  const lastNames = [
    "Okafor",
    "Afolabi",
    "Nwosu",
    "Adeyemi",
    "Olawale",
    "Nwachukwu",
    "Akinyemi",
    "Obi",
    "Ogunleye",
    "Adigun",
  ];
  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  return `${firstName} ${lastName}`;
}

async function createUsers() {
  const users = [];
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash("123456789", salt);

  for (let i = 1; i <= 200; i++) {
    users.push(
      new User({
        fullName: getRandomNigerianName(),
        email: `${i}@gmail.com`,
        password: hashedPassword,
        country: "NGA",
        verified: true,
      })
    );
  }

  return User.insertMany(users);
}

async function createUserProfiles(users) {
  const userProfiles = users.map(
    (user) =>
      new UserProfile({
        user: user._id,
        address: faker.location.streetAddress(),
        phone: faker.phone.number(),
      })
  );

  return UserProfile.insertMany(userProfiles);
}

async function createGroups(users) {
  const usersPerGroup = 10;
  const groups = [];

  for (let i = 0; i < users.length; i += usersPerGroup) {
    const groupMembers = users.slice(i, i + usersPerGroup);
    const group = new Group({
      name: `Group ${i / usersPerGroup + 1}`,
      description: `This is Group ${i / usersPerGroup + 1}`,
      members: groupMembers.map((user) => user._id),
      admins: [groupMembers[0]._id], // First user in the group is the admin
      creator: groupMembers[0]._id,
      country: "NGA",
    });

    groups.push(group);
  }

  return Group.insertMany(groups);
}

async function seedDB() {
  try {
    // Clear existing data
    await User.deleteMany({});
    await UserProfile.deleteMany({});
    await Group.deleteMany({});

    // Create users and profiles
    const users = await createUsers();
    await createUserProfiles(users);

    // Create groups with the users
    await createGroups(users);

    console.log("Database seeded successfully!");
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}

module.exports = seedDB;
