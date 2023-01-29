const asyncHandler = require("express-async-handler");
const User = require("../models/userModel.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" });
};

//register user
const registerUser = asyncHandler(
    async (req, res) => {
      const { name, email, password } = req.body;

      //validation
      if (!name || !email || !password) {
        res.status(400);
        throw new Error("Please fill all required fields");
      }
      if (password.length <= 6) {
        res.status(400);
        throw new Error("Password less then 6 characters");
      }
      //cheking if user email already exist
      const userExist = await User.findOne({ email });
      if (userExist) {
        res.status(400);
        throw new Error("Email has already exist");
      }

      //creating of a new user
      const user = await User.create({
        name,
        email,
        password,
      });

        //generate token
      const token = generateToken(user._id);
        //sending http-only cookie
        res.cookie("token", token, {
            path: "/",
            httpOnly: true,
            expires: new Date(Date.now() + 1000 * 86400), //1 day
            sameSite: "none",
            secure: true
        });

      if (user) {
        const { _id, name, email, bio, photo, phone } = user;
        res.status(201).json({
          _id,
          name,
          email,
          bio,
          photo,
            phone,
          token,
        });
      } else {
        res.status(400);
        throw new Error("Invalid user data");
      }

      if (!req.body.email) {
        res.status(400);
        throw new Error("Please add an email");
      }
    });


    //login user
const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  //validate request
  if (!email || !password) {
    res.status(400);
    throw new Error("Please add email and password");
  }
  //check if user exist
  const user = await User.findOne({ email });
  if (!user) {
    res.status(400);
    throw new Error("User not find, please sign in");
  }

  //user exist, checking if password is correct
  const passwordIsCorrect = await bcrypt.compare(password, user.password);

  //generate token
  const token = generateToken(user._id);
  //sending http-only cookie
  res.cookie("token", token, {
    path: "/",
    httpOnly: true,
    expires: new Date(Date.now() + 1000 * 86400), //1 day
    sameSite: "none",
    secure: true,
  });

  if (user && passwordIsCorrect) {
    const { _id, name, email, bio, photo, phone } = user;
    res.status(200).json({
      _id,
      name,
      email,
      bio,
      photo,
        phone,
      token,
    });
  } else {
    res.status(400);
    throw new Error("Invalid email or password");
  }
})

//logout of user

const logout = asyncHandler(async (req, res) => {
   res.cookie("token", "", {
     path: "/",
     httpOnly: true,
     expires: new Date(0), //1 day
     sameSite: "none",
     secure: true,
   });
  return res.status(200).json({message:"Successfully logged out"})
});

//get user data
const getUser = asyncHandler(async (req, res) => {
  res.send("get user data")
  });

module.exports = {
    registerUser,
    loginUser,
    logout,
    getUser,
}