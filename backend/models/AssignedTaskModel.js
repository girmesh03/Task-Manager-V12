import mongoose from "mongoose";
import Task from "./TaskModel.js";
import MaterialUsageSchema from "./schemas/MaterialUsageSchema.js";

const assignedTaskSchema = new mongoose.Schema(
  {
    assignedTo: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: [true, "Assigned user is required"],
          validate: {
            validator: async function (userId) {
              // Ensure parent document (Task) is available for department access
              const parentDoc = this.parent();
              if (!parentDoc || !parentDoc.department) {
                // This might happen if the task isn't fully constructed or department isn't set
                // For now, assume department should be there if task creation is proceeding correctly.
                // Returning false, but a more specific error might be better if this path is legitimately hit.
                // console.warn("AssignedTask: Parent document or department not found during assignedTo validation.");
                return false;
              }
              const user = await mongoose.model("User").findById(userId);
              return user && user.department && user.department.equals(parentDoc.department);
            },
            message: "User must belong to task department",
          },
        },
      ],
      validate: {
        validator: (users) => users?.length > 0,
        message: "At least one assigned user required",
      },
    },
    materialsUsed: {
      type: [MaterialUsageSchema],
      default: [],
    },
  },
  {
    toJSON: Task.schema.options.toJSON,
    toObject: Task.schema.options.toObject,
  }
);

export default Task.discriminator("AssignedTask", assignedTaskSchema);
