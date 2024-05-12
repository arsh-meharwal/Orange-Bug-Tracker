const { User } = require("../model/User");
const crypto = require("crypto");
const { sanitizeUser } = require("../services/common");
const SECRET_KEY = process.env.SECRET_KEY;
const jwt = require("jsonwebtoken");
const { Project } = require("../model/Project");

exports.createUser = async (req, res) => {
  try {
    const salt = crypto.randomBytes(16);
    crypto.pbkdf2(
      req.body.password,
      salt,
      310000,
      32,
      "sha256",
      async function (err, hashedPassword) {
        const user = new User({ ...req.body, password: hashedPassword, salt });
        const doc = await user.save();

        req.login(sanitizeUser(doc), (err) => {
          // this also calls serializer and adds to session
          if (err) {
            res.status(400).json(err);
          } else {
            const token = jwt.sign(sanitizeUser(doc), SECRET_KEY);
            console.log("Token  - ", token);
            res
              .cookie("jwt", token, {
                expires: new Date(Date.now() + 3600000),
                httpOnly: true,
              })
              .status(201)
              .json({ id: doc.id, role: doc.role });
          }
        });
      }
    );
  } catch (err) {
    res.status(400).json(err);
  }
};

exports.loginUser = async (req, res) => {
  const user = req.user;
  let id = user.id;
  let userd = User.findById(id);
  let data = await userd.populate("projects").exec();
  res
    .cookie("jwt", user.token, {
      expires: new Date(Date.now() + 3600000),
      httpOnly: true,
    })
    .status(201)
    .json(data);
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

exports.resetPassword = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email: email });
  if (user) {
    const salt = crypto.randomBytes(16);
    crypto.pbkdf2(
      password,
      salt,
      310000,
      32,
      "sha256",
      async function (err, hashedPassword) {
        user.password = hashedPassword;
        user.salt = salt;
        try {
          await user.save();
          res.status(201).json({ message: "password successfully reset" });
        } catch (error) {
          res.sendStatus(400);
        }
      }
    );
  } else {
    res.sendStatus(400);
  }
};

exports.logout = async (req, res) => {
  res
    .cookie("jwt", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .sendStatus(200);

  console.log("logout");
};
