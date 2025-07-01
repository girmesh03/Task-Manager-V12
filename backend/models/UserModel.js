import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/.+\@.+\..+/, 'Please fill a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'], // Example validation
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    role: {
      type: String,
      enum: ['SuperAdmin', 'Manager', 'User'],
      required: [true, 'User role is required'],
    },
    position: {
      // E.g., Director, Manager, Supervisor, Regular User
      type: String,
      required: [true, 'Position is required'],
      trim: true,
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Department',
      required: [true, 'Department is required'],
    },
    // We will add other fields like isActive, lastLogin, etc., as we flesh out the model later.
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps
  }
);

// Add pre-save hook for password hashing later when bcrypt is integrated
// userSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) {
//     return next();
//   }
//   // const salt = await bcrypt.genSalt(10);
//   // this.password = await bcrypt.hash(this.password, salt);
//   next();
// });

// Method to compare password for login later
// userSchema.methods.matchPassword = async function (enteredPassword) {
//   // return await bcrypt.compare(enteredPassword, this.password);
//   return enteredPassword === this.password; // Placeholder until bcrypt
// };

const User = mongoose.model('User', userSchema);

export default User;
