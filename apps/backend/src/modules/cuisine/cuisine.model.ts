import mongoose from "mongoose";

const cuisineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export const Cuisine = mongoose.model(
  "Cuisine",
  cuisineSchema
);
