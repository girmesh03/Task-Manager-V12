// backend/models/DepartmentModel.js
import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import Company from "./CompanyModel.js"; // For company updates
import User from "./UserModel.js"; // For User check
// import Task from "./TaskModel.js"; // Removed as not currently used
// import RoutineTask from "./RoutineTaskModel.js"; // Removed as not currently used
import CustomError from "../errorHandler/CustomError.js";
import ERROR_CODES from "../constants/ErrorCodes.js"; // Import ERROR_CODES

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
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
    },
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

// Ensure that find queries by default only return non-deleted departments
departmentSchema.pre(/^find/, function(next) {
  if (this.getOptions().withDeleted !== true) {
    this.where({ isDeleted: { $ne: true } });
  }
  next();
});

// Prevent updates to soft-deleted departments unless explicitly un-deleting
departmentSchema.pre('findOneAndUpdate', async function(next) {
  const docToUpdate = await this.model.findOne(this.getQuery());
  if (docToUpdate && docToUpdate.isDeleted) {
    const update = this.getUpdate();
    if (!(update && (update.$set && update.$set.isDeleted === false || update.isDeleted === false))) {
        return next(new CustomError("Cannot update a deleted department.", 403, ERROR_CODES.UNAUTHORIZED_ACCESS)); // Used ERROR_CODES
    }
  }
  next();
});

// Virtuals
departmentSchema.virtual("activeMembersCount").get(async function () {
  if (!this.populated('members')) {
    const count = await mongoose.model('User').countDocuments({ department: this._id, isDeleted: false });
    return count;
  }
  return this.members.filter(member => member && !member.isDeleted).length;
});


// Method to perform soft delete
departmentSchema.methods.softDelete = async function (options = {}) {
  const session = options.session || await mongoose.startSession();
  const runInTransaction = async (transactionBody) => {
    if (options.session) {
        return transactionBody(session);
    }
    let result;
    await session.withTransaction(async (sess) => {
        result = await transactionBody(sess);
    });
    return result;
  };

  return runInTransaction(async (currentSession) => {
    if (this.isDeleted) {
      throw new CustomError("Department is already deleted.", 400, ERROR_CODES.BAD_REQUEST); // Used ERROR_CODES
    }

    const activeMemberCount = await User.countDocuments({
      department: this._id,
      isDeleted: { $ne: true }
    }).session(currentSession);

    if (activeMemberCount > 0) {
      throw new CustomError(
        `Cannot delete department: ${activeMemberCount} active user(s) still belong to this department. Please reassign them first.`,
        400,
        ERROR_CODES.OPERATION_FAILED // Used ERROR_CODES
      );
    }

    this.isDeleted = true;
    this.deletedAt = new Date();

    if (this.company) {
      await Company.findByIdAndUpdate(
        this.company,
        { $pull: { departments: this._id } },
        { session: currentSession }
      );
    }

    await this.save({ session: currentSession });
    return this;
  });
};


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
