// backend/models/DepartmentModel.js
import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import Company from "./CompanyModel.js"; // For company updates
import User from "./UserModel.js";
import Task from "./TaskModel.js";
import RoutineTask from "./RoutineTaskModel.js";

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Department name is required"],
      trim: true,
      unique: true,
      minLength: [2, "Department name must be at least 2 characters long"],
      maxLength: [50, "Department name cannot exceed 50 characters"],
    },
    description: {
      type: String,
      trim: true,
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

// Cascade hard delete to users and tasks within the department
departmentSchema.pre("deleteOne", { document: true }, async function (next) {
  const session = this.$session();
  try {
    // 1. Delete all users in this department
    if (this.members && this.members.length > 0) {
      const usersInDept = await User.find({
        _id: { $in: this.members },
      }).session(session);

      // Trigger pre-delete hooks for each user to cascade further
      for (const user of usersInDept) {
        await user.deleteOne({ session });
      }
    }

    // 2. Delete all tasks and routine tasks belonging to this department
    await Promise.all([
      Task.deleteMany({ department: this._id }).session(session),
      RoutineTask.deleteMany({ department: this._id }).session(session),
    ]);

    // 3. Remove this department's reference from its parent company
    if (this.company) {
      await Company.findByIdAndUpdate(
        this.company,
        { $pull: { departments: this._id } },
        { session }
      );
    }

    next();
  } catch (error) {
    next(error);
  }
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
      .trim()
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  next();
});

// Paginate plugin
departmentSchema.plugin(mongoosePaginate);

const Department = mongoose.model("Department", departmentSchema);

export default Department;
