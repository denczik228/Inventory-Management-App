const express = require("express");
const router = express.Router();
const { registerUser, loginUser, logout, getUser} = require("../controllers/userController.js");
const protect = require("../middleWare/authMiddleware.js")

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/logout", logout);
router.get("/getuser", protect, getUser);

module.exports = router;
