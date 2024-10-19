const mongoose = require("mongoose");

const appImagesSchema = new mongoose.Schema(
  {
    infoname: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    image: {
      type: String,
    },
  },
  { timestamps: true }
);

const appImages = mongoose.model("appImages", appImagesSchema);

module.exports = appImages;
