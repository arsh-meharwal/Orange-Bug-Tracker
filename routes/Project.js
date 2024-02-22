const express = require("express");
const {
  fetchAllProjects,
  createProject,
  fetchProjectById,
  updateProject,
} = require("../controller/Project");

const router = express.Router();
//  the /tickets is already added in base path
router
  .post("/", createProject)
  .get("/", fetchAllProjects)
  .get("/:id", fetchProjectById)
  .patch("/:id", updateProject);

exports.router = router;
