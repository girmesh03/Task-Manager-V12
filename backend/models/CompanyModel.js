// backend/models/CompanyModel.js
import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import Department from "./DepartmentModel.js";
import User from "./UserModel.js";
import CustomError from "../errorHandler/CustomError.js";
import ERROR_CODES from "../constants/ErrorCodes.js";

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      unique: true,
      minLength: [2, "Company name must be at least 2 characters long"],
      maxLength: [50, "Company name cannot exceed 50 characters"],
    },
    address: {
      type: String,
      required: [true, "Company address is required"],
      trim: true,
      minLength: [10, "Address must be at least 10 characters long"],
      maxLength: [100, "Address cannot exceed 100 characters"],
    },
    phone: {
      type: String,
      required: [true, "Company phone number is required"],
      trim: true,
      unique: true,
      validate: {
        validator: function (v) {
          return /^(09\d{8}|\+2519\d{8})$/.test(v);
        },
        message:
          "Invalid phone number. Must be either 09 followed by 8 digits (e.g., 09xxxxxxxx) or +2519 followed by 8 digits (e.g., +2519xxxxxxxx).",
      },
    },
    email: {
      type: String,
      required: [true, "Company email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        "Invalid email address format",
      ],
    },
    size: {
      type: String,
      required: [true, "Company size is required"],
      enum: [
        "1-10 Employees",
        "11-50 Employees",
        "51-200 Employees",
        "201-500 Employees",
        "500+ Employees",
      ],
    },
    industry: {
      type: String,
      required: [true, "Company industry is required"],
      enum: [
        "Hospitality",
        "Technology",
        "Healthcare",
        "Finance",
        "Education",
        "Retail",
        "Manufacturing",
        "Consulting",
        "Other",
      ],
    },
    superAdmins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    departments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department",
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

// Ensure that find queries by default only return non-deleted companies
companySchema.pre(/^find/, function(next) {
  if (this.getOptions().withDeleted !== true) {
    this.where({ isDeleted: { $ne: true } });
  }
  next();
});

// Prevent updates to soft-deleted companies unless explicitly un-deleting
companySchema.pre('findOneAndUpdate', async function(next) {
  const docToUpdate = await this.model.findOne(this.getQuery());
  if (docToUpdate && docToUpdate.isDeleted) {
    const update = this.getUpdate();
    if (!(update && (update.$set && update.$set.isDeleted === false || update.isDeleted === false))) {
        return next(new CustomError("Cannot update a deleted company.", 403, ERROR_CODES.UNAUTHORIZED_ACCESS)); // Used ERROR_CODES
    }
  }
  next();
});

// Method to perform soft delete
companySchema.methods.softDelete = async function (options = {}) {
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
      throw new CustomError("Company is already deleted.", 400, ERROR_CODES.BAD_REQUEST); // Used ERROR_CODES
    }

    this.isDeleted = true;
    this.deletedAt = new Date();

    const departmentIds = this.departments;
    if (departmentIds && departmentIds.length > 0) {
      const departments = await Department.find({ _id: { $in: departmentIds } }).session(currentSession);
      for (const department of departments) {
        if (!department.isDeleted) {
          await department.softDelete({ session: currentSession });
        }
      }
    }

    // SuperAdmin handling logic remains complex and tied to User model's soft delete.
    // No direct error codes needed here unless specific checks fail.

    await this.save({ session: currentSession });
    return this;
  });
};


// Format name/address on save
companySchema.pre("save", function (next) {
  const capitalize = (str) =>
    str
      .trim()
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());

  if (this.isModified("name")) {
    this.name = capitalize(this.name);
  }

  if (this.isModified("address")) {
    this.address = capitalize(this.address);
  }

  next();
});

// Paginate plugin
companySchema.plugin(mongoosePaginate);

const Company = mongoose.model("Company", companySchema);

export default Company;
