import mongoose from 'mongoose';

// Import referenced models to ensure they are registered with Mongoose,
// although direct usage in this file is only for `ref`
// import './UserModel.js'; // Not strictly necessary if User model is imported elsewhere and Mongoose knows about it
// import './DepartmentModel.js'; // Same as above

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Company name is required'],
      trim: true,
      unique: true, // Assuming company names should be unique
    },
    address: {
      type: String,
      required: [true, 'Company address is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Company phone number is required'],
      trim: true,
      // Add regex validation for phone number format if needed
      // match: [/^\+[1-9]\d{1,14}$/, 'Please fill a valid phone number']
    },
    email: {
      type: String,
      required: [true, 'Company email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/.+\@.+\..+/, 'Please fill a valid email address'],
    },
    subscriptionStatus: {
      type: String,
      enum: ['active', 'inactive', 'pending'],
      default: 'pending',
      required: true,
    },
    superAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      // This will be set after the first user (SuperAdmin) is created.
      // Adding 'required: true' here might be problematic for the initial company creation step
      // before the SuperAdmin user record exists and is assigned.
      // We will handle this linkage lógica in the user registration step.
      // For now, it can be null/undefined initially.
    },
    departments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department',
      },
    ],
    // users array was removed as per discussion, users will be derived via departments.
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps
  }
);

// Pre-save hook example (if needed later, e.g., for complex validation)
// companySchema.pre('save', async function(next) {
//   // Example: ensure superAdmin, if set, has 'SuperAdmin' role
//   if (this.isModified('superAdmin') && this.superAdmin) {
//     const User = mongoose.model('User'); // Or import User model
//     const adminUser = await User.findById(this.superAdmin);
//     if (!adminUser || adminUser.role !== 'SuperAdmin') {
//       // This validation might be better handled at the controller level during assignment
//       // to provide clearer user feedback.
//       // return next(new Error('Assigned SuperAdmin does not have the SuperAdmin role.'));
//     }
//   }
//   next();
// });

const Company = mongoose.model('Company', companySchema);

export default Company;
