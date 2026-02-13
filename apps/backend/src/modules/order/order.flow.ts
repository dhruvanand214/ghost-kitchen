import { OrderStatus } from "../../shared/order-status.enum";

export const ORDER_FLOW: Record<OrderStatus, OrderStatus[]> = {
  RECEIVED: [OrderStatus.PREPARING],
  PREPARING: [OrderStatus.OUT_FOR_DELIVERY],
  OUT_FOR_DELIVERY: [OrderStatus.DELIVERED],
  DELIVERED: [],
  CANCELLED: [OrderStatus.PREPARING, OrderStatus.RECEIVED]
};

export const canUpdateOrderStatus = (
  current: OrderStatus,
  next: OrderStatus
): boolean => {
  return ORDER_FLOW[current].includes(next);
};
