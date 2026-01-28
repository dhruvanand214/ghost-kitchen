import { Schema, model } from "mongoose";

const productSchema = new Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    restaurantId: {
      type: Schema.Types.ObjectId,
      ref: "Restaurant",
      required: true
    },
    isAvailable: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const Product = model("Product", productSchema);
