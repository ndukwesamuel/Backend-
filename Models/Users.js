const bcrypt = require("bcrypt");
const { isEmail } = require("validator");
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: [true, "Please enter your name"],
    },
    email: {
      type: String,
      required: [true, "Please enter email"],
      lowercase: true,
      unique: true,
      validate: [isEmail, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Please enter password"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    verified: {
      type: Boolean,
      default: false,
    },
    isUserAdmin: {
      type: Boolean,
      default: false,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    wallet: {
      type: Number,
      default: 500000, // Initial wallet balance is 0
    },
    country: {
      type: String,
      required: [true, "Please select your country"],
      enum: ["Nigeria", "Ghana", "Benin"], // Ensure the value is one of the predefined countries
    },
    referralCode: {
      type: String,
      required: true,
    },
    referredBy: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    referredUsers: {
      type: [{ type: Schema.Types.ObjectId, ref: "user" }],
    },
  },
  { timestamps: true }
);

// encrypt user's password before saving to db
userSchema.pre("save", async function (next) {
  const salt = await bcrypt.genSalt();
  this.password = await bcrypt.hash(this.password, salt);
});

// static method to login user
userSchema.statics.login = async function (email, password) {
  const user = await this.findOne({ email });
  if (user) {
    const auth = await bcrypt.compare(password, user.password);
    if (auth) {
      return user;
    }
    throw Error("Incorrect password or email");
  }
  throw Error("Incorrect password or email");
};

const User = mongoose.model("user", userSchema);

module.exports = User;
