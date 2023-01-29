const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

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
      //maxLenght: [23, "Password shouldnt be more than 23 characters"],
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

//encrypting of password befor it will be save in db
 userSchema.pre("save", async function (next) {
   if (!this.isModified("password")) {
     return next();
  }
  //hash password
  const salt = await bcrypt.genSalt(4);
  const hashedPassword = await bcrypt.hash(this.password, salt);
   this.password = hashedPassword;
   next();
})

const User = mongoose.model("User", userSchema);
module.exports = User;