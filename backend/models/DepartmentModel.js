import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Department name is required'],
      trim: true,
      unique: true, // Assuming department names are unique within a company context, will need compound index or app-level validation
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'Company reference is required'],
    },
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    managers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Users in this list should have 'Manager' or 'SuperAdmin' role
      },
    ],
    // We can add other fields like description, department-specific settings, etc., later.
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps
  }
);

// Potential hook to ensure users listed in 'managers' also exist in 'users' and have the correct role,
// or handle this at the application/controller level.
// departmentSchema.pre('save', async function(next) {
//   if (this.isModified('managers') || this.isModified('users')) {
//     const User = mongoose.model('User'); // Or import User model
//     // Validate managers are part of users and have correct roles
//     for (const managerId of this.managers) {
//       if (!this.users.includes(managerId)) {
//         return next(new Error(`Manager with ID ${managerId} must also be in the department's user list.`));
//       }
//       const managerUser = await User.findById(managerId);
//       if (!managerUser || !['Manager', 'SuperAdmin'].includes(managerUser.role)) {
//         return next(new Error(`User with ID ${managerId} assigned as manager does not have 'Manager' or 'SuperAdmin' role.`));
//       }
//     }
//   }
//   next();
// });

const Department = mongoose.model('Department', departmentSchema);

export default Department;
