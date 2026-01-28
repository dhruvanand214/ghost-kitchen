import { Types } from "mongoose";
import { OrderStatus } from "@ghost/shared-types";
import { Order } from "./order.model";

export const getKitchenActiveOrders = (kitchenId: string) => {
  return Order.aggregate([
    {
      $match: {
        kitchenId: new Types.ObjectId(kitchenId),
        status: { $ne: OrderStatus.DELIVERED }
      }
    },

    {
      $lookup: {
        from: "products",
        localField: "items.productId",
        foreignField: "_id",
        as: "products"
      }
    },

    {
      $lookup: {
        from: "restaurants",
        localField: "restaurantId",
        foreignField: "_id",
        as: "restaurant"
      }
    },

    {
      $unwind: "$restaurant"
    },

    {
      $sort: { createdAt: -1 }
    }
  ]);
};
