const express = require("express");
const {
  fetchTicketById,
  fetchAllTickets,
  createTicket,
  updateTicket,
} = require("../controller/Tickets");

const router = express.Router();
//  the /tickets is already added in base path
router
  .post("/", createTicket)
  .get("/", fetchAllTickets)
  .get("/:id", fetchTicketById)
  .patch("/:id", updateTicket);

exports.router = router;
