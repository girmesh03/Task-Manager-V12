import mongoose from "mongoose";

const MaterialUsageModel = new mongoose.Schema(
  {
    materialName: {
      type: String,
      required: [true, "Material name is required"],
      trim: true,
      maxlength: [100, "Material name cannot exceed 100 characters"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0.01, "Quantity must be greater than 0"],
    },
    unit: {
      type: String,
      required: [true, "Unit is required"],
      trim: true,
      enum: {
        values: ["pcs", "meter", "kg", "liter", "set", "roll", "box", "other"],
        message:
          "{VALUE} is not a supported unit. Supported units are: pcs, meter, kg, liter, set, roll, box, other.",
      },
    },
    otherUnitDetails: {
      // Optional field if unit is "other"
      type: String,
      trim: true,
      maxlength: [50, "Other unit details cannot exceed 50 characters"],
      validate: {
        validator: function (value) {
          // This field is only relevant if unit is 'other'
          // If unit is 'other', this field can be empty or have a value.
          // If unit is not 'other', this field must be empty.
          return this.unit !== "other" ? !value : true;
        },
        message:
          "Other unit details should only be provided if the unit is 'other', and must be empty otherwise.",
      },
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [250, "Material usage notes cannot exceed 250 characters"],
    },
  },
  { _id: false } // No separate _id for subdocuments unless explicitly needed
);

// Middleware to ensure otherUnitDetails is unset if unit is not 'other'
MaterialUsageModel.pre("validate", function (next) {
  if (this.unit !== "other" && this.otherUnitDetails) {
    this.otherUnitDetails = undefined;
  }
  next();
});

export default MaterialUsageModel;
