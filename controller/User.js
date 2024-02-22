const { User } = require("../model/User");

exports.createUser = async (req, res) => {
  const user = new User(req.body);
  try {
    const doc = await user.save();
    res
      .status(201)
      .json({ id: doc.id, role: doc.role, classification: doc.classification });
  } catch (err) {
    res.status(404).json(err);
    console.log(err);
  }
};

exports.loginUser = async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email }).exec();
    // TODO: this is just temporary, we will use strong password auth
    if (!user) {
      res.status(401).json({ message: "no such user email" });
    } else if (user.password === req.body.password) {
      await user.populate("projects");
      res.status(200).json({
        id: user.id,
        role: user.role,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        classification: user.classification,
        projects: user.projects,
        tickets: user.tickets,
      }); //sending user data fields to frontend
    } else {
      res.status(401).json({ message: "invalid credentials" });
    }
  } catch (err) {
    res.status(400).json(err);
  }
};

exports.getAllUsers = async (req, res) => {
  let user = User.find({ deleted: { $ne: true } });
  let totalUsersQuery = User.find({ deleted: { $ne: true } });

  // Searching
  if (req.query._q) {
    const searchRegex = new RegExp(req.query._q, "i");
    user = user.or([
      { first_name: { $regex: searchRegex } },
      { last_name: { $regex: searchRegex } },
      { email: { $regex: searchRegex } },
      { role: { $regex: searchRegex } },
    ]);
    totalUsersQuery = totalUsersQuery.or([
      { first_name: { $regex: searchRegex } },
      { last_name: { $regex: searchRegex } },
      { email: { $regex: searchRegex } },
      { role: { $regex: searchRegex } },
    ]);
  }

  // Paginating
  if (req.query._page && req.query._limit) {
    const pageSize = req.query._limit;
    const page = req.query._page;
    user = user.skip(pageSize * (page - 1)).limit(pageSize);
  }

  if (req.query._classification === "2") {
    user = user.find({ classification: "1" });
    totalUsersQuery = totalUsersQuery.find({ classification: "1" });
  }

  const totalDocs = await totalUsersQuery.count().exec();

  try {
    const docs = await user.populate("projects").exec();
    const filteredData = docs.map((user) => {
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        projects: user.projects,
        tickets: user.tickets,
        classification: user.classification,
        deleted: user.deleted,
      };
    });

    res.set("X-Total-Count", totalDocs);
    res.status(200).json(filteredData);
  } catch (err) {
    res.status(400).json(err);
  }
};

exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { classification, role, projects } = req.body;
  const updateFields = {};

  if (classification) {
    updateFields.classification = classification;
  }

  if (role) {
    updateFields.role = role;
  }

  if (projects) {
    updateFields.projects = projects;
  }

  try {
    await User.findByIdAndUpdate(id, updateFields, {
      new: true,
    });
    res.status(200).json({ message: "Success" });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};
