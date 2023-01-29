const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please add a name"],
    },
    email: {
      type: String,
      required: [true, "Please add a name"],
      unique: true,
      trim: true,
      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please enter a valid email",
      ],
    },
    password: {
      type: String,
      required: [true, "Please add a password"],
      minLenght: [6, "Password must be up to 6 characters"],
      maxLenght: [23, "Password shouldnt be more than 23 characters"],
    },
    photo: {
      type: String,
      required: [true, "Please add a photo"],
      default:
        "https://www.shutterstock.com/image-vector/web-developer-design-vector-illustration-600w-314602454.jpg",
    },
    phone: {
      type: String,
      default: "+972",
    },
    bio: {
      type: String,
      maxLenght: [250, "Bio shouldnt be more than 250 characters"],
      default: "bio",
    },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
module.exports = User;