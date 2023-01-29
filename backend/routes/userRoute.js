const express = require("express");
const router = express.Router();
const { registerUser, loginUser, logout, getUser} = require("../controllers/userController.js");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logout);
router.get("/getuser", getUser);

module.exports = router;
