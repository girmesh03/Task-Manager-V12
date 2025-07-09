// backend/models/UserModel.js
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import mongoosePaginate from "mongoose-paginate-v2";
import crypto from "crypto";
import Department from "./DepartmentModel.js";
import Company from "./CompanyModel.js";
import Task from "./TaskModel.js";
import AssignedTask from "./AssignedTaskModel.js";
import RoutineTask from "./RoutineTaskModel.js";
import TaskActivity from "./TaskActivityModel.js";
import Notification from "./NotificationModel.js";
import { deleteFromCloudinary } from "../utils/cloudinaryHelper.js";

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
        "Invalid email address format",
      ],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters long"],
      select: false,
    },
    role: {
      type: String,
      enum: ["SuperAdmin", "Manager", "User"],
      required: [true, "User role is required"],
    },
    position: {
      // E.g., Director, Manager, Supervisor, Regular User
      type: String,
      required: [true, "Position is required"],
      trim: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: [true, "Department is required"],
    },
    profilePicture: {
      url: String,
      public_id: String,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    pendingEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    emailChangeToken: { type: String, select: false },
    emailChangeTokenExpiry: { type: Date, select: false },
    verificationToken: { type: String, select: false },
    verificationTokenExpiry: { type: Date, select: false },
    resetPasswordToken: { type: String, select: false },
    resetPasswordExpiry: { type: Date, select: false },
    refreshToken: { type: String, select: false },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.id;
        // ensure password is not returned even if selected elsewhere by mistake
        delete ret.password;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.id;
        delete ret.password;
        return ret;
      },
    },
  }
);

userSchema.index({ verificationTokenExpiry: 1 }, { expireAfterSeconds: 900 }); // 15 minutes
userSchema.index({ emailChangeTokenExpiry: 1 }, { expireAfterSeconds: 900 }); // 15 minutes
userSchema.index({ resetPasswordExpiry: 1 }, { expireAfterSeconds: 3600 }); // 1 hour
userSchema.index({ email: 1 });

// Virtuals
userSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Format firstName, lastName, and position fields on save
userSchema.pre("save", function (next) {
  const capitalize = (str) =>
    str.trim().replace(/\b\w/g, (char) => char.toUpperCase());

  if (this.isModified("firstName")) {
    this.firstName = capitalize(this.firstName);
  }
  if (this.isModified("lastName")) {
    this.lastName = capitalize(this.lastName);
  }
  if (this.isModified("position")) {
    this.position = capitalize(this.position);
  }
  next();
});

// Password hashing on save
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Hard delete cascade
userSchema.pre("deleteOne", { document: true }, async function (next) {
  const session = this.$session();
  try {
    // 1. Remove user reference from their Department
    if (this.department) {
      await Department.findByIdAndUpdate(
        this.department,
        { $pull: { members: this._id } },
        { session }
      );
    }

    // 2. Remove user reference from Company.superAdmins
    const departmentDoc = await Department.findById(this.department).session(
      session
    );
    if (departmentDoc && departmentDoc.company) {
      await Company.findByIdAndUpdate(
        departmentDoc.company,
        { $pull: { superAdmins: this._id } },
        { session }
      );
    }

    // 3. Delete all content created by or assigned to the user
    await Promise.all([
      // Delete all tasks created by this user
      Task.deleteMany({ createdBy: this._id }).session(session),
      // Delete all routine tasks performed by this user
      RoutineTask.deleteMany({ performedBy: this._id }).session(session),
      // Delete all task activities performed by this user
      TaskActivity.deleteMany({ performedBy: this._id }).session(session),
      // Pull user from any tasks they were assigned to
      AssignedTask.updateMany(
        { assignedTo: this._id },
        { $pull: { assignedTo: this._id } },
        { session }
      ),
      // Delete all notifications for this user
      Notification.deleteMany({ user: this._id }).session(session),
    ]);

    // 4. Delete Profile Picture from Cloudinary
    if (this.profilePicture && this.profilePicture.public_id) {
      await deleteFromCloudinary(this.profilePicture.public_id, "image");
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Password comparison method
userSchema.methods.matchPassword = async function (enteredPassword) {
  // The service/controller calling this method is responsible for fetching the user
  // with the password field selected, e.g., User.findOne({ email }).select('+password')
  if (!this.password) return false;
  return bcrypt.compare(enteredPassword, this.password);
};

// Verification token
userSchema.methods.generateVerificationToken = function () {
  const token = crypto.randomBytes(3).toString("hex").toUpperCase();
  this.verificationToken = token;
  this.verificationTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 minutes
  return { token, expiry: this.verificationTokenExpiry };
};

// Password  reset token
userSchema.methods.generatePasswordResetToken = function () {
  const token = crypto.randomBytes(32).toString("hex");
  this.resetPasswordToken = token;
  this.resetPasswordExpiry = Date.now() + 3600 * 1000; // 1 hour
  return { token, expiry: this.resetPasswordExpiry };
};

// Paginate plugin
userSchema.plugin(mongoosePaginate);

const User = mongoose.model("User", userSchema);

export default User;
