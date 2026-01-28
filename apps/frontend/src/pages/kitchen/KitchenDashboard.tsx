/* eslint-disable react-hooks/set-state-in-effect */
import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { useEffect, useState } from "react";
import { socket } from "../../sockets/socket";

/* ------------------ GraphQL ------------------ */

const GET_KITCHEN_ORDERS = gql`
  query GetOrdersByKitchen($kitchenId: ID!) {
    getOrdersByKitchen(kitchenId: $kitchenId) {
      id
      orderNumber
      status
      createdAt
    }
  }
`;

const UPDATE_ORDER_STATUS = gql`
  mutation UpdateOrderStatus($orderId: ID!, $status: OrderStatus!) {
    updateOrderStatus(orderId: $orderId, status: $status) {
      id
      status
    }
  }
`;

/* ------------------ Types ------------------ */

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  createdAt: string;
};

export default function KitchenDashboard() {
  const kitchenId = localStorage.getItem("kitchenId");

  const { data, loading } = useQuery<{ getOrdersByKitchen: Order[] }>(
    GET_KITCHEN_ORDERS,
    {
      variables: { kitchenId },
      skip: !kitchenId
    }
  );

  const [orders, setOrders] = useState<Order[]>([]);

  const [updateOrderStatus] = useMutation(UPDATE_ORDER_STATUS);

  /* ---------- Initial load ---------- */
  useEffect(() => {
    if (data?.getOrdersByKitchen) {
      localStorage.setItem("kitchenId", kitchenId || "");
      setOrders(data.getOrdersByKitchen);
    }
  }, [data, kitchenId]);

  /* ---------- Socket setup ---------- */
  useEffect(() => {
    if (!kitchenId) return;

    socket.connect();
    socket.emit("JOIN_KITCHEN", kitchenId);

    socket.on("NEW_ORDER", (order: Order) => {
      setOrders((prev) => [order, ...prev]);
    });

    socket.on(
      "ORDER_UPDATED",
      ({ orderId, status }: { orderId: string; status: string }) => {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId ? { ...o, status } : o
          )
        );
      }
    );

    return () => {
      socket.disconnect();
    };
  }, [kitchenId]);

  /* ---------- Status Update ---------- */
  const handleStatusUpdate = async (
    orderId: string,
    nextStatus: string
  ) => {
    await updateOrderStatus({
      variables: {
        orderId,
        status: nextStatus
      }
    });
  };

  return (
    <div className="flex min-h-screen">
      {/* <Sidebar /> */}

      <main className="flex-1 p-6 space-y-6">
        <h1 className="text-2xl font-semibold">Kitchen Dashboard</h1>

        {loading && (
          <p className="text-gray-400">Loading orders…</p>
        )}

        {!loading && orders.length === 0 && (
          <p className="text-gray-400">
            No active orders yet 🍳
          </p>
        )}

        <div className="grid grid-cols-3 gap-4">
          {orders.map((order) => (
            <div key={order.id} className="card">
              <div className="flex justify-between items-center">
                <span className="font-medium">
                  {order.orderNumber}
                </span>
                <span className="text-accent">
                  {order.status}
                </span>
              </div>

              <div className="mt-4 space-y-2">
                {order.status === "RECEIVED" && (
                  <button
                    onClick={() =>
                      handleStatusUpdate(order.id, "PREPARING")
                    }
                    className="btn-primary w-full"
                  >
                    Start Preparing
                  </button>
                )}

                {order.status === "PREPARING" && (
                  <button
                    onClick={() =>
                      handleStatusUpdate(
                        order.id,
                        "OUT_FOR_DELIVERY"
                      )
                    }
                    className="btn-primary w-full"
                  >
                    Mark Ready
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
