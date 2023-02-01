const asyncHandler = require("express-async-handler");
const User = require("../models/userModel.js");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const Token = require("../models/tokenModel.js");
const sendEmail = require("../utils/sendEmails.js");

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
  const user = await User.findById(req.user._id)
  if (user) {
    const { _id, name, email, bio, photo, phone } = user;
    res.status(200).json({
      _id,
      name,
      email,
      bio,
      photo,
      phone
    });
  } else {
    res.status(400);
    throw new Error("User not found")
  }
});

//get login status
const loginStatus = asyncHandler(async (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json(false);
  }
  //verify token
  const verified = jwt.verify(token, process.env.JWT_SECRET);
  if (verified) {
    return res.json(true)
  } else {
    return res.json(false)
  }
});

//update user

const updateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    const { name, email, bio, photo, phone } = user;
    user.email = email;
    user.name = req.body.name || name;
    user.phone = req.body.phone || phone;
    user.bio = req.body.bio || bio;
    user.photo = req.body.photo || photo;
  
    const updatedUser = await user.save();
    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser._name,
      email: updatedUser._email,
      bio: updatedUser._bio,
      photo: updatedUser._photo,
      phone: updatedUser._phone,
    });
  } else {
    res.status(404)
    throw new Error("User not found");
  }
});

const changePassword = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const { oldPassword, password } = req.body;
  
  if (!user) {
    res.status(400);
    throw new Error("User not found, Please sign up");
  }
  //validate
  if (!oldPassword || !password) {
    res.status(400);
    throw new Error("One of the passwords is not correct");
  }
  //check if old password mathces to db password
  const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password);
  //save new password
  if (user && passwordIsCorrect) {
    user.password = password;
    await user.save();
    res.status(200).send("Password changed succesfully");
  } else {
    res.status(400);
    throw new Error("Old password is incorrect");
  }
});

const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    res.status(404)
    throw new Error("User does not exist");
  }
  
  //delete token if it exist in db
  let token = await Token.findOne({ userId: user._id })
  if (token) {
    await token.deleteOne()
  }

  //create reset token
  let resetToken = crypto.randomBytes(32).toString("hex") + user._id;
  //console.log(resetToken);

  //hash token befor saving to db
  const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");
  console.log(hashedToken);
  
  //save token to db
  await new Token({
    userId: user._id,
    token: hashedToken,
    createdAt: Date.now(),
    expiresAt: Date.now() + 30 * (60 * 1000) //30 min
  }).save();
  
  //construct reset url
  const resetUrl = `${process.env.FRONTEND_URL}/resetpassword/${resetToken}`
  
  //reset email
  const message = `
  <h2>Hello ${user.name}</h2>
  <p>Please use the url below to reset a password</p>
  <p>This reset link will be valid just for 30 min!</p>

  <a href=${resetUrl} clicktracking=off>${resetUrl}</a>

  <p>Regards from Den</p>
  <p>DTeam</p>
  `;

  const subject = "Password Reset Request"
  const send_to = user.email;
  const sent_from = proces.env.EMAIL_USER;

  try {
    await sendEmail(subject, message, send_to, sent_from)
    res.status(200).json({ success: true, message: "Reset email sent" })
  } catch (err) {
    res.status(500)
    throw new Error("Email wasnt sent, please try again");
  };
});

//reset password
const resetPassword = asyncHandler(async (req, res) => {
  const { password } = req.body;
  const { resetToken } = req.params;

  //hash token and then compare to token in db
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  
  //find token in db
  const userToken = await Token.findOne({
    token: hashedToken,
    expiresAt:{$gt:Date.now()}
  })
  if (!userToken) {
    res.status(404);
    throw new Error("Invalid or Expired token")
  }
  //find user
  const user = await User.findOne({
    _id:userToken.userId
  })
  user.password = password
  await user.save()
  res.status(200).json({message:"Password reset succesfully"})
})

module.exports = {
    registerUser,
    loginUser,
    logout,
    getUser,
    loginStatus,
    updateUser,
    changePassword,
    forgotPassword,
    resetPassword,
}