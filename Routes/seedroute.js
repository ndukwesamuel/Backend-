const express = require("express");
const seedDB = require("../script/seedGroup"); // ../scripts/seed");

const router = express.Router();

router.get("/seed", async (req, res) => {
  try {
    await seedDB();
    res.status(200).send("Database seeded successfully!");
  } catch (error) {
    res.status(500).send("Error seeding database: " + error.message);
  }
});

module.exports = router;
