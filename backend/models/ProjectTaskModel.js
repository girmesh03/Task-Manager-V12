// backend/models/ProjectTaskModel.js
import mongoose from "mongoose";
import Task from "./TaskModel.js";

const projectTaskSchema = new mongoose.Schema(
  {
    clientInfo: {
      name: {
        type: String,
        required: [true, "Client name is required"],
        trim: true,
      },
      phone: {
        type: String,
        required: [true, "Client phone number is required"],
        trim: true,
        validate: {
          validator: function (v) {
            return /^(09\d{8}|\+2519\d{8})$/.test(v);
          },
          message:
            "Invalid phone number. Must be either 09 followed by 8 digits (e.g., 09xxxxxxxx) or +2519 followed by 8 digits (e.g., +2519xxxxxxxx).",
        },
      },
      address: {
        type: String,
        trim: true,
      },
    },
  },
  {
    toJSON: Task.schema.options.toJSON,
    toObject: Task.schema.options.toObject,
  }
);

// Format company name and address on save
projectTaskSchema.pre("save", function (next) {
  const capitalize = (str) =>
    str
      .trim()
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());

  if (this.isModified("clientInfo.name")) {
    this.clientInfo.name = capitalize(this.clientInfo.name);
  }

  if (this.isModified("clientInfo.address") && this.clientInfo.address) {
    this.clientInfo.address = capitalize(this.clientInfo.address);
  }

  // Format phone number
  if (this.isModified("clientInfo.phone")) {
    let formattedPhone = this.clientInfo.phone;
    if (formattedPhone.startsWith("09")) {
      formattedPhone = formattedPhone.replace("09", "+2519");
    }
    this.clientInfo.phone = formattedPhone;
  }

  next();
});

export default Task.discriminator("ProjectTask", projectTaskSchema);
