import mongoose from "mongoose";
import { OrderStatus } from "@ghost/shared-types";

const OrderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true
    },
    kitchenId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    restaurantId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    items: [
      {
        productId: mongoose.Schema.Types.ObjectId,
        name: String,
        quantity: Number,
        priceSnapshot: Number
      }
    ],
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.RECEIVED
    },
    guestInfo: {
      name: String,
      phone: String
    },
    total: {
      type: Number
    },
    eta: {
      type: Date
    },
    etaNotes: {
      type: String
    },
    cancelReason: {
      type: String
    },
    cancelledBy: {
      type: String
    },
    deliveredAt: {
      type: Date
    }
  },
  { timestamps: true }
);

export const Order = mongoose.model("Order", OrderSchema);
