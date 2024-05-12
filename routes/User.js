const express = require("express");
const {
  createUser,
  loginUser,
  getAllUsers,
  updateUser,
  logout,
  resetPassword,
} = require("../controller/User");
const passport = require("passport");

const router = express.Router();
//  the /users is already added in base path
router
  .post("/signup", createUser)
  .post("/login", passport.authenticate("local"), loginUser)
  .post("/guestadmin", loginUser)
  .get("/logout", logout)
  .patch("/reset", resetPassword)
  .get("/", getAllUsers)
  .patch("/:id", updateUser);

exports.router = router;
