const express = require("express");
const server = express();
const mongoose = require("mongoose");
const cors = require("cors");
const userRouter = require("./routes/User");
const ticketRouter = require("./routes/Tickets");
const projectRouter = require("./routes/Project");

//middleware
server.use(
  cors({
    exposedHeaders: ["X-Total-Count"],
  })
);
server.use(express.json());
server.use("/users", userRouter.router);
server.use("/tickets", ticketRouter.router);
server.use("/project", projectRouter.router);

main().catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/bugtracker");
  console.log("database connected");
}

server.get("/", (req, res) => {
  res.json({ status: "success" });
});

server.listen(8081, () => {
  console.log("server started");
});
