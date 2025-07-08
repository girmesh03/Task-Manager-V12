import mongoose from "mongoose";
import mongoosePaginate from "mongoose-paginate-v2";
import CustomError from "../errorHandler/CustomError.js";
import ERROR_CODES from "../constants/ErrorCodes.js";
import MaterialUsageSchema from "./MaterialUsageModel.js";

const routineTaskSchema = new mongoose.Schema(
  {
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      required: [true, "Task department is required"],
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Task performer is required"],
      validate: {
        validator: async function (userId) {
          const user = await mongoose.model("User").findById(userId);
          // Ensure user exists and their department matches this task's department
          return (
            user && user.department && user.department.equals(this.department)
          );
        },
        message: "Performer must belong to task department",
      },
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
      validate: {
        validator: function (date) {
          const logDate = new Date(date);
          const now = new Date();
          // Allow same day but not future dates
          return logDate <= now;
        },
        message: "Log date cannot be in the future",
      },
    },
    performedTasks: [
      {
        _id: false, // No separate _id for these sub-tasks
        description: {
          type: String,
          required: [true, "Routine Task description is required"],
        },
        isCompleted: {
          type: Boolean,
          default: false,
        },
      },
    ],
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
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
    materialsUsed: {
      type: [MaterialUsageSchema],
      default: [],
    },
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

// Validate that performer belongs to the department and calculate progress
routineTaskSchema.pre("save", async function (next) {
  try {
    // PerformedBy department validation is now handled by schema-level validate,
    // but an explicit check here can provide a more specific error if user not found.
    if (this.isModified("performedBy")) {
      const user = await mongoose.model("User").findById(this.performedBy);
      if (!user) {
        // This specific check is useful because the schema validator might just return false
        // without distinguishing between "user not found" and "user in wrong department".
        return next(
          new CustomError(
            "Performer user not found",
            404,
            ERROR_CODES.USER_NOT_FOUND
          )
        );
      }
      // The schema-level validator on performedBy already checks department equality.
      // if (!user.department.equals(this.department)) {
      //   return next(
      //     new CustomError("Performer must belong to task department", 400)
      //   );
      // }
    }

    if (this.isModified("performedTasks")) {
      const total = this.performedTasks.length;
      const completed = this.performedTasks.filter((t) => t.isCompleted).length;
      this.progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    }
    next();
  } catch (error) {
    next(error);
  }
});

// Cascade delete attachments and notifications
routineTaskSchema.pre("deleteOne", { document: true }, async function (next) {
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
        linkedDocumentType: "RoutineTask",
      })
      .session(session);

    next();
  } catch (err) {
    next(err);
  }
});

// Indexes
routineTaskSchema.index({ department: 1, date: -1 });
routineTaskSchema.index({ performedBy: 1, date: -1 });
routineTaskSchema.index({ date: 1, department: 1 }); // For date range queries

routineTaskSchema.plugin(mongoosePaginate);

export default mongoose.model("RoutineTask", routineTaskSchema);
