const express = require("express");
const {
  createUser,
  loginUser,
  getAllUsers,
  updateUser,
} = require("../controller/User");

const router = express.Router();
//  the /users is already added in base path
router
  .post("/signup", createUser)
  .post("/login", loginUser)
  .get("/", getAllUsers)
  .patch("/:id", updateUser);

exports.router = router;
