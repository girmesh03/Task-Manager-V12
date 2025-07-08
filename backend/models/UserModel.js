// backend/models/UserModel.js
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import mongoosePaginate from "mongoose-paginate-v2";
import crypto from "crypto";
import Department from "./DepartmentModel.js"; // Added for department updates
import Company from "./CompanyModel.js"; // Added for company updates
import Task from "./TaskModel.js"; // Added for task updates
import AssignedTask from "./AssignedTaskModel.js"; // Added for task updates
import RoutineTask from "./RoutineTaskModel.js"; // Added for task updates
import TaskActivity from "./TaskActivityModel.js"; // Added for task updates
import Notification from "./NotificationModel.js"; // Added for notification deletion
import { deleteFromCloudinary } from "../utils/cloudinaryHelper.js"; // Added for Cloudinary
import CustomError from "../errorHandler/CustomError.js"; // For potential errors

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
    isActive: { // This will now indicate if the user can log in, separate from being deleted
      type: Boolean,
      default: true,
    },
    isDeleted: { // Soft delete flag
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: { // Timestamp for soft delete
      type: Date,
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
userSchema.index({ email: 1, isDeleted: 1 }); // To allow unique email only among non-deleted users potentially


// Ensure that find queries by default only return non-deleted users
// and also respect the isActive flag for general operations.
// For specific cases (e.g. admin needing to see deleted users),
// a separate method or query parameter can bypass this.
userSchema.pre(/^find/, function(next) {
  if (this.getOptions().withDeleted !== true) { // Allow overriding with an option
    this.where({ isDeleted: { $ne: true } });
  }
  next();
});

// Prevent updates to soft-deleted users unless explicitly un-deleting
userSchema.pre('findOneAndUpdate', async function(next) {
  // `this` is the query object
  const docToUpdate = await this.model.findOne(this.getQuery());
  if (docToUpdate && docToUpdate.isDeleted) {
    const update = this.getUpdate();
    // Allow update if it's specifically to change isDeleted or if withDeleted option is used
    // This logic might need refinement based on how undelete is handled.
    // For now, a simple check: if isDeleted is true, only allow un-deleting.
    if (!(update && (update.$set && update.$set.isDeleted === false || update.isDeleted === false))) {
        return next(new CustomError("Cannot update a deleted user account.", 403));
    }
  }
  next();
});


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
  // If password is being set to null (e.g. during soft delete for security), don't hash it
  if (this.password === null) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to perform soft delete and cascade operations
userSchema.methods.softDelete = async function (options = {}) {
  const session = options.session || await mongoose.startSession(); // Start a new session if not provided
  const runInTransaction = async (transactionBody) => {
    if (options.session) { // If session is passed, assume transaction is managed externally
        return transactionBody(session);
    }
    // Otherwise, manage transaction internally
    let result;
    await session.withTransaction(async (sess) => {
        result = await transactionBody(sess);
    });
    return result;
  };


  return runInTransaction(async (currentSession) => {
    if (this.isDeleted) {
      // Optional: throw error or just return if already deleted
      // For now, let's make it idempotent for the fields it sets.
      // throw new CustomError("User is already deleted.", 400);
    }

    this.isDeleted = true;
    this.deletedAt = new Date();
    this.isActive = false; // Deactivated upon soft delete
    this.refreshToken = undefined; // Clear refresh token
    // Optionally, clear other sensitive tokens like passwordResetToken etc.
    this.resetPasswordToken = undefined;
    this.resetPasswordExpiry = undefined;
    this.verificationToken = undefined;
    this.verificationTokenExpiry = undefined;
    this.emailChangeToken = undefined;
    this.emailChangeTokenExpiry = undefined;
    // Consider what to do with the password. Nullifying it can be a security measure.
    // this.password = null; // pre-save hook needs to handle null password

    // 1. Remove from Department.members
    if (this.department) {
      await Department.findByIdAndUpdate(
        this.department,
        { $pull: { members: this._id } },
        { session: currentSession }
      );
    }

    // 2. Remove from Company.superAdmins
    // Assuming a user can be a superAdmin of multiple companies is not the current model,
    // but if it were, we'd need to iterate. For now, find company where this user is superAdmin.
    // This might be better handled by finding the company via the department or a direct link if exists.
    // For simplicity, let's assume a user is linked to one company via their department.
    const departmentDoc = await Department.findById(this.department).session(currentSession);
    if (departmentDoc && departmentDoc.company) {
      await Company.findByIdAndUpdate(
        departmentDoc.company,
        { $pull: { superAdmins: this._id } },
        { session: currentSession }
      );
    }

    // 3. Delete Notifications for this user
    await Notification.deleteMany({ user: this._id }).session(currentSession);

    // 4. Delete Profile Picture from Cloudinary
    if (this.profilePicture && this.profilePicture.public_id) {
      try {
        await deleteFromCloudinary(this.profilePicture.public_id, 'image'); // Assuming it's an image
        this.profilePicture = undefined; // Clear from DB
      } catch (cloudinaryError) {
        // Log Cloudinary error, but don't let it stop the soft delete process
        console.error(`Cloudinary deletion failed for user ${this._id}: ${cloudinaryError.message}`);
        // Decide if this should throw or just log. For soft delete, logging might be enough.
      }
    }

    // 5. Nullify references in Tasks, RoutineTasks, TaskActivities
    // Note: UpdateMany doesn't trigger middleware on the updated documents.
    const userIdToNullify = this._id;
    await Task.updateMany(
      { createdBy: userIdToNullify },
      { $set: { createdBy: null } },
      { session: currentSession }
    );
    await AssignedTask.updateMany( // AssignedTask is a discriminator of Task
      { 'assignedTo': userIdToNullify },
      { $pull: { 'assignedTo': userIdToNullify } },
      { session: currentSession }
    );
    await RoutineTask.updateMany(
      { performedBy: userIdToNullify },
      { $set: { performedBy: null } },
      { session: currentSession }
    );
    await TaskActivity.updateMany(
      { performedBy: userIdToNullify },
      { $set: { performedBy: null } },
      { session: currentSession }
    );

    await this.save({ session: currentSession }); // Save the user document itself
    return this;
  });
};


// Password comparison method
userSchema.methods.matchPassword = async function (enteredPassword) {
  // Ensure password field is available if it was set to null
  const userWithPassword = await this.constructor.findById(this._id).select("+password");
  if (!userWithPassword || !userWithPassword.password) return false; // No password to compare
  return bcrypt.compare(enteredPassword, userWithPassword.password);
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
