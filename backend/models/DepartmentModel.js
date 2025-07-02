// backend/models/DepartmentModel.js
import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Department name is required"],
      trim: true,
      unique: true,
      minLength: [3, "Department name must be at least 3 characters long"],
      maxLength: [50, "Department name cannot exceed 50 characters"],
    },
    description: {
      type: String,
      trim: true,
      minLength: [10, "Description must be at least 10 characters long"],
      maxLength: [300, "Description cannot exceed 300 characters"],
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: [true, "Company reference is required"],
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    managers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Members in this list should have 'Manager' or 'SuperAdmin' role
      },
    ],
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.id;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.id;
        return ret;
      },
    },
  }
);

// Virtuals
departmentSchema.virtual("membersCount", {
  ref: "User",
  localField: "_id",
  foreignField: "department",
  count: true,
});

// Format name/description on save
departmentSchema.pre("save", function (next) {
  const capitalize = (str) =>
    str.toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());

  if (this.isModified("name")) {
    this.name = capitalize(this.name);
  }

  if (this.isModified("description") && this.description) {
    this.description = this.description
      .toLowerCase()
      .replace(/(^\w|\.\s*\w)/g, (match) => match.toUpperCase());
  }

  next();
});

// Paginate plugin
departmentSchema.plugin(mongoosePaginate);

const Department = mongoose.model("Department", departmentSchema);

export default Department;
