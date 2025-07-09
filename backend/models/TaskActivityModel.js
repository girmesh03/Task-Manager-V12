// backend/models/TaskActivityModel.js
import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import CustomError from "../errorHandler/CustomError.js";
import ERROR_CODES from "../constants/ErrorCodes.js";

// Status transition rules
const validTransitions = {
  "To Do": ["In Progress", "Pending"],
  "In Progress": ["In Progress", "Completed", "Pending"], // Allow self-transition
  Completed: ["Pending", "In Progress"],
  Pending: ["In Progress", "Completed"],
};

const taskActivitySchema = new mongoose.Schema(
  {
    task: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
      required: [true, "Task reference is required"],
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Performed user is required"],
    },
    description: {
      type: String,
      required: [true, "Activity description is required"],
      trim: true,
      maxlength: [200, "Description cannot exceed 200 characters"],
    },
    statusChange: {
      from: {
        type: String,
        enum: Object.keys(validTransitions),
      },
      to: {
        type: String,
        enum: Object.keys(validTransitions),
        required: [true, "Status change is required"],
      },
    },
    attachments: [
      {
        _id: false,
        url: {
          type: String,
          required: true,
        },
        public_id: {
          type: String,
          required: true,
        },
        type: {
          type: String,
          enum: ["image", "video", "pdf"],
          default: "image",
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
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

// Status transition validation and task update
taskActivitySchema.pre("save", async function (next) {
  try {
    const session = this.$session();
    const task = await mongoose
      .model("Task")
      .findById(this.task)
      .session(session);

    if (!task) {
      return next(
        new CustomError("Task not found", 404, ERROR_CODES.RESOURCE_NOT_FOUND)
      );
    }

    // Validate that performer belongs to task department
    const performer = await mongoose
      .model("User")
      .findById(this.performedBy)
      .session(session);

    if (!performer || !performer.department.equals(task.department)) {
      return next(
        new CustomError(
          "Performer must belong to task department",
          400,
          ERROR_CODES.UNAUTHORIZED_ACCESS
        )
      );
    }

    if (this.statusChange) {
      // Auto-fill 'from' status if not provided
      if (!this.statusChange.from) {
        this.statusChange.from = task.status;
      }

      // Validate transition rules
      if (
        !validTransitions[this.statusChange.from]?.includes(
          this.statusChange.to
        )
      ) {
        return next(
          new CustomError(
            `Invalid status transition from '${this.statusChange.from}' to '${this.statusChange.to}'`,
            400
          )
        );
      }

      // Update parent task status
      task.status = this.statusChange.to;
      await task.save({ session });
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Cascade delete attachments and notifications
taskActivitySchema.pre("deleteOne", { document: true }, async function (next) {
  try {
    const session = this.$session();

    // Delete Cloudinary attachments
    if (this.attachments?.length > 0) {
      const { deleteFromCloudinary } = await import(
        "../utils/cloudinaryHelper.js"
      );
      const publicIds = this.attachments
        .map((a) => a.public_id)
        .filter(Boolean);

      if (publicIds.length > 0) {
        await deleteFromCloudinary(publicIds, "raw");
      }
    }

    // Delete notifications
    await mongoose
      .model("Notification")
      .deleteMany({
        linkedDocument: this._id,
        linkedDocumentType: "TaskActivity",
      })
      .session(session);

    next();
  } catch (err) {
    next(err);
  }
});

// Indexes
taskActivitySchema.index({ task: 1, createdAt: -1 });
taskActivitySchema.index({ performedBy: 1, createdAt: -1 });

taskActivitySchema.plugin(mongoosePaginate);
export default mongoose.model("TaskActivity", taskActivitySchema);
