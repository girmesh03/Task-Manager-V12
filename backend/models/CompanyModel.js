import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      unique: true,
      minLength: [3, "Company name must be at least 3 characters long"],
      maxLength: [50, "Company name cannot exceed 50 characters"],
    },
    address: {
      type: String,
      required: [true, "Company address is required"],
      trim: true,
      minLength: [3, "Address must be at least 3 characters long"],
      maxLength: [100, "Address cannot exceed 100 characters"],
    },
    phone: {
      type: String,
      required: [true, "Company phone number is required"],
      trim: true,
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
      match: [/.+\@.+\..+/, "Invalid email address format"],
    },
    subscriptionStatus: {
      type: String,
      enum: ["active", "inactive", "pending"],
      default: "pending",
      required: [true, "Subscription status is required"],
    },
    superAdmins: [
      // SuperAdmins can be more than one in a company
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

// Format name/address on save
companySchema.pre("save", function (next) {
  const capitalize = (str) =>
    str.trim().replace(/\b\w/g, (char) => char.toUpperCase());

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
