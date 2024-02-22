const { Tickets } = require("../model/Ticket");
const { Project } = require("../model/Project");

exports.createTicket = async (req, res) => {
  const ticket = new Tickets(req.body);
  try {
    const doc = await ticket.save();
    const projectId = req.body.project;
    await Project.findByIdAndUpdate(projectId, {
      $push: { tickets: doc.id },
    });
    res.status(201).json({ id: doc.id, number: doc.number }); //sending data back to frontend
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
};

exports.fetchAllTickets = async (req, res) => {
  // search = {_q="Arsh"}
  // sort = {_sort:"price",_order="desc"}
  // pagination = {_page:1,_limit=10}
  let query = Tickets.find({ deleted: { $ne: true } });
  let totalTicketsQuery = Tickets.find({ deleted: { $ne: true } });

  // Searching for Tickets
  if (req.query._q) {
    const searchRegex = new RegExp(req.query._q, "i");
    query = query.or([
      { title: { $regex: searchRegex } },
      { description: { $regex: searchRegex } },
      { number: { $regex: searchRegex } },
      { initiator: { $regex: searchRegex } },
    ]);
    totalTicketsQuery = totalTicketsQuery.or([
      { title: { $regex: searchRegex } },
      { description: { $regex: searchRegex } },
      { number: { $regex: searchRegex } },
      { initiator: { $regex: searchRegex } },
    ]);
  }

  // Sorting Tickets
  if (req.query._sort && req.query._order) {
    query = query.sort({ [req.query._sort]: req.query._order });
  }

  // Paginating Tickets
  if (req.query._page && req.query._limit) {
    const pageSize = req.query._limit;
    const page = req.query._page;
    query = query.skip(pageSize * (page - 1)).limit(pageSize);
  }

  const totalDocs = await totalTicketsQuery.count().exec();

  try {
    const docs = await query.exec();
    res.set("X-Total-Count", totalDocs);
    res.status(200).json(docs);
  } catch (err) {
    res.status(400).json(err);
  }
};

exports.fetchTicketById = async (req, res) => {
  const { id } = req.params;

  try {
    const ticket = await Tickets.findById(id).populate("assigned_to");
    res.status(200).json(ticket);
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
};

exports.updateTicket = async (req, res) => {
  const { id } = req.params;
  try {
    const tt = await Tickets.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    console.log(tt);
    res.status(200).json({ message: "Success" });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
    console.log(err);
  }
};
