import mongoose from "mongoose";

const KitchenSchema = new mongoose.Schema(
  {
    name: {type: String, required: true},

    location: {type: String},

    isActive: {type: Boolean, default: true},
  },
  {
    timestamps: true,
  },
);

export const Kitchen = mongoose.model("Kitchen", KitchenSchema);
