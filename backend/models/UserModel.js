// backend/models/UserModel.js
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import mongoosePaginate from "mongoose-paginate-v2";
import crypto from "crypto";

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
      match: [/.+\@.+\..+/, "Invalid email address format"],
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
    isActive: {
      type: Boolean,
      default: true,
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

userSchema.index({ verificationTokenExpiry: 1 }, { expireAfterSeconds: 900 }); // 15 minutes
userSchema.index({ emailChangeTokenExpiry: 1 }, { expireAfterSeconds: 900 }); // 15 minutes
userSchema.index({ resetPasswordExpiry: 1 }, { expireAfterSeconds: 3600 }); // 1 hour

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

// Password comparison method
userSchema.methods.matchPassword = async function (enteredPassword) {
  const user = await this.constructor.findById(this._id).select("+password");
  return bcrypt.compare(enteredPassword, user.password);
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
