// backend/models/TaskModel.js
import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Task title is required"],
      trim: true,
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, "Description cannot exceed 200 characters"],
    },
    status: {
      type: String,
      enum: ["To Do", "In Progress", "Completed", "Pending"],
      default: "To Do",
    },
    location: {
      type: String,
      trim: true,
      maxlength: [100, "Location cannot exceed 100 characters"],
    },
    dueDate: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          const due = new Date(value);
          if (this.isNew) {
            // For new documents, due date must be in the future.
            return due > new Date();
          }
          // For existing documents, due date must be on or after creation date.
          return due >= this.createdAt;
        },
        message:
          "Due date must be in the future for new tasks and cannot be before the creation date for existing tasks.",
      },
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      validate: {
        validator: async function (userId) {
          const user = await mongoose.model("User").findById(userId);
          return user && user?.department?.equals(this.department);
        },
        message: "Creator must belong to task department",
      },
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: true,
    },
  },
  {
    discriminatorKey: "taskType",
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.id;
        return ret;
      },
    },
    toObject: {
      transform: (doc, ret) => {
        delete ret.id;
        return ret;
      },
    },
  }
);

// Virtual for task activities (reverse populate)
taskSchema.virtual("activities", {
  ref: "TaskActivity",
  localField: "_id",
  foreignField: "task",
  options: { sort: { createdAt: -1 } },
});

// Indexes
taskSchema.index({ status: 1, department: 1 });
taskSchema.index({ project: 1 });
taskSchema.plugin(mongoosePaginate);

// Cascade delete notifications and activities
taskSchema.pre("deleteOne", { document: true }, async function (next) {
  const session = this.$session();
  try {
    // 1. Fetch all related TaskActivities
    const activities = await mongoose
      .model("TaskActivity")
      .find({ task: this._id })
      .session(session);

    // 2. Delete Cloudinary attachments from TaskActivities
    if (activities.length > 0) {
      const { deleteFromCloudinary } = await import(
        "../utils/cloudinaryHelper.js"
      );
      const activityAttachmentIds = activities.flatMap(
        (activity) =>
          activity.attachments?.map((a) => a.public_id).filter(Boolean) || []
      );

      if (activityAttachmentIds.length > 0) {
        await deleteFromCloudinary(activityAttachmentIds, "raw");
      }
    }

    // 3. Bulk delete TaskActivities and their notifications
    await Promise.all([
      mongoose
        .model("TaskActivity")
        .deleteMany({ task: this._id })
        .session(session),

      mongoose
        .model("Notification")
        .deleteMany({
          $or: [
            { task: this._id },
            { linkedDocument: this._id, linkedDocumentType: "Task" },
          ],
        })
        .session(session),
    ]);

    next();
  } catch (error) {
    next(error);
  }
});

export default mongoose.model("Task", taskSchema);
