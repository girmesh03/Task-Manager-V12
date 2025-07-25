// backend/models/CompanyModel.js
import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import Department from "./DepartmentModel.js";

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

// Cascade hard delete to all associated departments
companySchema.pre("deleteOne", { document: true }, async function (next) {
  const session = this.$session();
  try {
    if (this.departments && this.departments.length > 0) {
      // Find all department documents to ensure we can call .deleteOne() on each
      const departmentsToDelete = await Department.find({
        _id: { $in: this.departments },
      }).session(session);

      // Trigger pre-delete hooks for each department
      for (const department of departmentsToDelete) {
        await department.deleteOne({ session });
      }
    }
    next();
  } catch (error) {
    next(error);
  }
});

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
