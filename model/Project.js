const mongoose = require("mongoose");
const { Schema } = mongoose;

const projectSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  initiator: { type: String, required: true },
  created: { type: String, required: true },
  status: { type: String, required: true, default: "Open" },
  tickets: { type: [Schema.Types.ObjectId], ref: "Ticket" },
  //need to add users also
});

const virtual = projectSchema.virtual("id");
virtual.get(function () {
  return this._id;
});
projectSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

exports.Project = mongoose.model("Project", projectSchema);
