const mongoose = require("mongoose");
const { Schema } = mongoose;

const userSchema = new Schema({
  email: { type: String, required: true },
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  password: { type: Buffer, required: true },
  role: { type: String, required: true, default: "member" },
  projects: { type: [Schema.Types.Mixed], ref: "Project" },
  tickets: { type: [Schema.Types.Mixed], ref: "Ticket" },
  classification: { type: String, required: true, default: "1" },
  deleted: { type: Boolean, default: false },
  salt: Buffer,
});

const virtual = userSchema.virtual("id");
virtual.get(function () {
  return this._id;
});
userSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: function (doc, ret) {
    delete ret._id;
  },
});

exports.User = mongoose.model("User", userSchema);
