const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const categorySchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Please enter category name"],
      unique: [true, "Category name already exist"],
    },
  },
  { timestamps: true }
);

const category = mongoose.model("category", categorySchema);

module.exports = category;
