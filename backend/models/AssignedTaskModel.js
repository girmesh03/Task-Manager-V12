// backend/models/AssignedTaskModel.js
import mongoose from "mongoose";
import Task from "./TaskModel.js";
import MaterialUsageSchema from "./MaterialUsageModel.js";

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
              // Get the parent document (the AssignedTask instance)
              const taskDoc = this.parent().parent();
              if (!taskDoc || !taskDoc.department) {
                // This might happen if the task isn't fully constructed or department isn't set
                return false;
              }
              const user = await mongoose.model("User").findById(userId);
              return (
                user &&
                user.department &&
                user.department.equals(taskDoc.department)
              );
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
