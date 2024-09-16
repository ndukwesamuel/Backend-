const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const passwordResetSchema = new Schema({
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
const passwordReset = mongoose.model("passwordReset", passwordResetSchema);
module.exports = passwordReset;
