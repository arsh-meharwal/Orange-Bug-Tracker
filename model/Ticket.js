const mongoose = require("mongoose");
const { Schema } = mongoose;

const ticketSchema = new Schema({
  number: { type: String, required: true },
  initiator: { type: String, required: true },
  initiator_id: { type: String, required: true },
  initiator_mail: { type: String, required: true },
  initiator_classification: { type: String, required: true },
  project: { type: Schema.Types.ObjectId, ref: "Project", required: true },
  project_name: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  status: { type: String, required: true },
  priority: { type: String, required: true },
  created_at: { type: String, required: true },
  created_time: { type: String, required: true },
  updated_at: { type: String },
  assigned_to: { type: String, required: true, ref: "User" },
  comments: { type: [Schema.Types.Mixed] },
  deleted: { type: Boolean, default: false },
});

const virtual = ticketSchema.virtual("id");
virtual.get(function () {
  return this._id;
});
ticketSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

exports.Tickets = mongoose.model("Ticket", ticketSchema);
