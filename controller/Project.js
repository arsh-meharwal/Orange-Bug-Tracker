const { Project } = require("../model/Project");
const { User } = require("../model/User");

exports.createProject = async (req, res) => {
  const project = new Project(req.body);
  try {
    const doc = await project.save();
    await User.updateMany(
      {
        $or: [{ classification: "4" }, { classification: "3" }],
      },
      {
        $push: {
          projects: {
            $each: [doc.id],
          },
        },
      }
    );
    res.status(201).json({ status: "Success" }); //sending data back to frontend
  } catch (err) {
    res.status(400).json(err);
    console.log(err);
  }
};

exports.fetchAllProjects = async (req, res) => {
  // search = {_q="Arsh"}
  // sort = {_sort:"price",_order="desc"}
  // pagination = {_page:1,_limit=10}
  let query = Project.find({ deleted: { $ne: true } });
  let totalProjectQuery = Project.find({ deleted: { $ne: true } });

  // Searching for Tickets
  if (req.query._q) {
    const searchRegex = new RegExp(req.query._q, "i");
    query = query.or([
      { name: { $regex: searchRegex } },
      { description: { $regex: searchRegex } },
    ]);
    totalProjectQuery = totalProjectQuery.or([
      { name: { $regex: searchRegex } },
      { description: { $regex: searchRegex } },
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

  const totalDocs = await totalProjectQuery.count().exec();

  try {
    const docs = await query.exec();
    res.set("X-Total-Count", totalDocs);
    res.status(200).json(docs);
  } catch (err) {
    res.status(400).json(err);
  }
};

exports.fetchProjectById = async (req, res) => {
  const { id } = req.params;

  try {
    const project = await Project.findById(id);
    const data = await project.populate("tickets");
    res.status(200).json(data);
  } catch (err) {
    res.status(400).json(err);
  }
};

exports.updateProject = async (req, res) => {
  const { id } = req.params;
  try {
    await Project.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    res.status(200).json({ status: "Success" });
  } catch (err) {
    res.status(400).json(err);
  }
};
