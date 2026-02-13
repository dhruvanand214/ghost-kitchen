import { Types } from "mongoose";
import { Order } from "./order.model";
import { OrderStatus } from "../../shared/order-status.enum";

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

export const getKitchenHistoryOrders = (kitchenId: string) => {
  return Order.aggregate([
    {
      $match: {
        kitchenId: new Types.ObjectId(kitchenId),
        status: { $in: [OrderStatus.DELIVERED, OrderStatus.CANCELLED] }
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
