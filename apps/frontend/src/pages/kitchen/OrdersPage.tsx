/* eslint-disable react-hooks/set-state-in-effect */
import { gql } from "@apollo/client";
import { useCallback, useEffect, useState } from "react";
import { socket } from "../../sockets/socket";
import { useMutation, useQuery } from "@apollo/client/react";

const GET_ORDERS = gql`
  query GetOrdersByKitchen($kitchenId: ID!) {
    getOrdersByKitchen(kitchenId: $kitchenId) {
      id
      orderNumber
      status
      createdAt
    }
  }
`;

const UPDATE_ETA = gql`
  mutation UpdateETA($orderId: ID!, $eta: String!) {
    updateOrderETA(orderId: $orderId, eta: $eta) {
      id
      eta
    }
  }
`;

const CANCEL_ORDER = gql`
  mutation CancelOrder($orderId: ID!, $reason: String!) {
    cancelOrder(orderId: $orderId, reason: $reason) {
      id
      status
    }
  }
`;

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  createdAt: string;
  eta?: string;
  etaNote?: string;

  // UI-only
  isEditingEta?: boolean;
  etaMinutes?: number;
  tempNote?: string;
};

export default function OrdersPage() {
  const kitchenId = localStorage.getItem("kitchenId");
  const [orders, setOrders] = useState<Order[]>([]);
  const [updateETA] = useMutation(UPDATE_ETA);
  const [cancelOrder] = useMutation(CANCEL_ORDER);

  const { data } = useQuery<{ getOrdersByKitchen: Order[] }>(
    GET_ORDERS,
    {
      variables: { kitchenId },
      skip: !kitchenId
    }
  );

  const getSortedOrders = useCallback((orders: Order[]) => {
    const STATUS_PRIORITY: { [key: string]: number } = {
      "RECEIVED": 0,
      "PREPARING": 1,
      "OUT_FOR_DELIVERY": 2,
      "CANCELLED": 3
    };
    return [...orders].sort((a, b) => {
      const priorityA = STATUS_PRIORITY[a.status] ?? 999;
      const priorityB = STATUS_PRIORITY[b.status] ?? 999;
      return priorityA - priorityB;
    });
  }, []);

  // Initial load
  useEffect(() => {
    if (data?.getOrdersByKitchen) {
      setOrders(getSortedOrders(data.getOrdersByKitchen));
    }
  
  }, [data, getSortedOrders]);

  // Socket updates
  useEffect(() => {
    if (!kitchenId) return;

    socket.connect();
    socket.emit("JOIN_KITCHEN", kitchenId);

    socket.on("NEW_ORDER", (order: Order) => {
      setOrders((prev) => [order, ...prev]);
    });

    socket.on("ORDER_CANCELLED", (order) => {
      setOrders((prev) =>
        prev.filter((o) => o.id !== order.id)
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [kitchenId]);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Live Orders</h1>

      {orders.length === 0 && (
        <p className="text-gray-400">No orders yet 🍳</p>
      )}

      <div className="grid grid-cols-3 gap-4">
        {getSortedOrders(orders).map((order) => (
          <div key={order.id} className="card h-fit">
            <div className="flex justify-between">
              <span className="font-medium">
                {order.orderNumber}
              </span>
              <span className="text-accent">
                {order.status}
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-2">
              {new Date(order.createdAt).toLocaleString()}
            </p>
            {/* ETA Section */}
            {order.status !== "CANCELLED" && order.status !== "OUT_FOR_DELIVERY" &&
              <div className="mt-3 space-y-2">
                {order.eta && !order.isEditingEta ? (
                  <>
                    <p className="text-sm text-gray-300">
                      ETA:{" "}
                      <span className="text-accent font-medium">
                        {new Date(order.eta).toLocaleTimeString()}
                      </span>
                    </p>

                    {order.etaNote && (
                      <p className="text-xs text-gray-400">
                        Note: {order.etaNote}
                      </p>
                    )}

                    <button
                      className="btn-secondary w-full"
                      onClick={() =>
                        setOrders((prev) =>
                          prev.map((o) =>
                            o.id === order.id
                              ? { ...o, isEditingEta: true }
                              : o
                          )
                        )
                      }
                    >
                      Edit ETA
                    </button>
                  </>
                ) : (
                  <>
                    <input
                      type="number"
                      min={5}
                      step={5}
                      placeholder="ETA in minutes"
                      className="input"
                      onChange={(e) =>
                        setOrders((prev) =>
                          prev.map((o) =>
                            o.id === order.id
                              ? { ...o, etaMinutes: Number(e.target.value) }
                              : o
                          )
                        )
                      }
                    />

                    <input
                      type="text"
                      placeholder="Note for customer (optional)"
                      className="input"
                      onChange={(e) =>
                        setOrders((prev) =>
                          prev.map((o) =>
                            o.id === order.id
                              ? { ...o, tempNote: e.target.value }
                              : o
                          )
                        )
                      }
                    />

                    <div className="flex gap-2">
                      {[15, 30, 45].map((m) => (
                        <button
                          key={m}
                          className="btn-secondary flex-1"
                          onClick={() =>
                            setOrders((prev) =>
                              prev.map((o) =>
                                o.id === order.id
                                  ? { ...o, etaMinutes: m }
                                  : o
                              )
                            )
                          }
                        >
                          {m} min
                        </button>
                      ))}
                    </div>

                    <button
                      className="btn-primary w-full"
                      onClick={() => {
                        if (!order.etaMinutes) return;

                        const eta = new Date(
                          Date.now() + order.etaMinutes * 60 * 1000
                        ).toISOString();

                        updateETA({
                          variables: {
                            orderId: order.id,
                            eta,
                            note: order.tempNote
                          }
                        });

                        setOrders((prev) =>
                          prev.map((o) =>
                            o.id === order.id
                              ? {
                                ...o,
                                isEditingEta: false,
                                eta: eta,
                                etaNote: order.tempNote
                              }
                              : o
                          )
                        );
                      }}
                    >
                      Save ETA
                    </button>

                  </>
                )}
              </div>
            }

            <div className="mt-3">
              <button
                className="btn-danger w-full mt-2"
                onClick={() =>
                  cancelOrder({
                    variables: {
                      orderId: order.id,
                      reason: "Kitchen cancelled"
                    }
                  })
                }
              >
                Cancel Order
              </button>
            </div>
          </div>

        ))}
      </div>
    </div>
  );
}
