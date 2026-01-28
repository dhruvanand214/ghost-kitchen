import mongoose from "mongoose";

const RestaurantSchema = new mongoose.Schema(
  {
    name: {type: String, required: true},

    kitchenId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Kitchen"
    },

    cuisineType: {type: String},

    isActive: {type: Boolean, default: true}
  },
  { timestamps: true }
);

export const Restaurant = mongoose.model("Restaurant", RestaurantSchema);

