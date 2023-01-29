const asyncHandler = require("express-async-handler");
const User = require("../models/userModel.js");

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
            password
        })
        if (user) {
            const { _id, name, email, bio, photo, phone } = user;
            res.status(201).json({
                _id, name, email, bio, photo, phone
            })
        } else {
            res.status(400);
            throw new Error("Invalid user data")
        }
    
    if (!req.body.email) {
        res.status(400)
        throw new Error("Please add an email")
    }
    res.send("Register User")
});

module.exports = {
    registerUser,
}