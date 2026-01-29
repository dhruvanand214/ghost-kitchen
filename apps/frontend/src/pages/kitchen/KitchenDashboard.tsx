/* eslint-disable react-hooks/set-state-in-effect */
import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { useCallback, useEffect, useMemo, useState } from "react";
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

const GET_KITCHEN_HISTORY = gql`
  query GetOrderHistoryByKitchen($kitchenId: ID!) {
    getOrderHistoryByKitchen(kitchenId: $kitchenId) {
        id
        orderNumber
        status
        createdAt
        deliveredAt
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
  isNew?: boolean; // UI only
};

/* ------------------ Helpers ------------------ */

const statusBadge: Record<string, string> = {
  RECEIVED: "bg-blue-900 text-blue-300",
  PREPARING: "bg-yellow-900 text-yellow-300",
  OUT_FOR_DELIVERY: "bg-purple-900 text-purple-300",
  DELIVERED: "bg-green-900 text-green-300",
  CANCELLED: "bg-red-900 text-red-300"
};

export default function KitchenDashboard() {
  const kitchenId = localStorage.getItem("kitchenId");
  const [orders, setOrders] = useState<Order[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);

  const [soundEnabled, setSoundEnabled] = useState(
    localStorage.getItem("soundEnabled") === "true"
  );

  const playSound = useCallback(() => {
    if (!soundEnabled) return;
    const audio = new Audio("/sounds/new-order.mp3");
    audio.volume = 0.6;
    audio.play().catch(() => { });
  }, [soundEnabled]);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    localStorage.setItem("soundEnabled", String(next));
  };


  const { data: activeData, loading: activeDataLoading } = useQuery<{ getOrdersByKitchen: Order[] }>(
    GET_KITCHEN_ORDERS,
    {
      variables: { kitchenId },
      skip: !kitchenId
    }
  );

  const { data: historyData, loading: historyDataLoading } = useQuery<{ getOrderHistoryByKitchen: Order[] }>(
    GET_KITCHEN_HISTORY,
    {
      variables: { kitchenId },
      skip: !kitchenId
    }
  );

  const [updateOrderStatus] = useMutation(UPDATE_ORDER_STATUS);

  /* ---------- Initial Load ---------- */
  useEffect(() => {
    if (activeData?.getOrdersByKitchen && historyData?.getOrderHistoryByKitchen) {
      setAllOrders(activeData.getOrdersByKitchen.concat(historyData.getOrderHistoryByKitchen));
      setOrders(activeData.getOrdersByKitchen);
    } else if (activeData?.getOrdersByKitchen) {
      setOrders(activeData.getOrdersByKitchen);
    } else if (historyData?.getOrderHistoryByKitchen) {
      setAllOrders(historyData.getOrderHistoryByKitchen);
    }
  }, [activeData, historyData]);
  /* ---------- Socket Setup ---------- */
  useEffect(() => {
    if (!kitchenId) return;

    socket.connect();
    socket.emit("JOIN_KITCHEN", kitchenId);

    socket.on("NEW_ORDER", (order: Order) => {
      playSound();

      setOrders((prev) => [
        { ...order, isNew: true },
        ...prev
      ]);

      setTimeout(() => {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === order.id
              ? { ...o, isNew: false }
              : o
          )
        );
      }, 6000);
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
  }, [kitchenId, playSound]);

  /* ---------- Derived Stats (REAL DATA) ---------- */

  console.log("All Orders:", allOrders);
  console.log("Active Orders:", orders);
  const stats = useMemo(() => {
    return {
      total: allOrders.length,
      preparing: allOrders.filter(
        (o) => o.status === "PREPARING"
      ).length,
      outForDelivery: allOrders.filter(
        (o) => o.status === "OUT_FOR_DELIVERY"
      ).length,
      completed: allOrders.filter(
        (o) =>
          o.status === "DELIVERED" ||
          o.status === "CANCELLED"
      ).length
    };
  }, [allOrders]);

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

  /* ---------- UI ---------- */

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold">
          Kitchen Dashboard
        </h1>
        <p className="text-gray-400">
          Live order operations overview
        </p>
      </div>

      <div className="fixed top-6 right-6 z-50">
        <button
          onClick={toggleSound}
          className="
      flex items-center gap-2
      px-4 py-2
      rounded-lg
      border border-gray-700
      bg-gray-900
      hover:bg-gray-800
      transition 
    "
        >
          {soundEnabled ? "🔔 Sound On" : "🔕 Sound Off"}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6">
        <StatCard title="Live Orders" value={stats.total} />
        <StatCard title="Preparing" value={stats.preparing} />
        <StatCard
          title="Out for Delivery"
          value={stats.outForDelivery}
        />
        <StatCard
          title="Completed"
          value={stats.completed}
        />
      </div>

      {/* Orders */}
      {activeDataLoading && historyDataLoading && (
        <p className="text-gray-400">Loading orders…</p>
      )}

      {!activeDataLoading && !historyDataLoading && orders.length === 0 && (
        <p className="text-gray-400">
          No active orders yet 🍳
        </p>
      )}

      <div className="grid grid-cols-3 gap-6">
        {orders.map((order) => (
          <div
            key={order.id}
            className={`
              rounded-2xl
              bg-gray-900
              border border-gray-700
              p-5
              transition
              hover:shadow-xl
              ${order.isNew ? "order-glow" : ""}
            `}
          >
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-400">
                  Order
                </p>
                <h3 className="text-lg font-semibold">
                  {order.orderNumber}
                </h3>
              </div>

              <span
                className={`
                  px-3 py-1 text-xs rounded-full
                  ${statusBadge[order.status]}
                `}
              >
                {order.status}
              </span>
            </div>

            {/* Meta */}
            <p className="text-sm text-gray-400 mt-3">
              {new Date(order.createdAt).toLocaleString()}
            </p>

            {/* Actions */}
            <div className="mt-5 space-y-2">
              {order.status === "RECEIVED" && (
                <button
                  onClick={() =>
                    handleStatusUpdate(
                      order.id,
                      "PREPARING"
                    )
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

              {order.status === "OUT_FOR_DELIVERY" && (
                <button
                  className="btn-primary w-full"
                  onClick={() =>
                    handleStatusUpdate(order.id, "DELIVERED")
                  }
                >
                  Mark Delivered
                </button>
              )}

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Components ---------------- */

function StatCard({
  title,
  value
}: {
  title: string;
  value: number;
}) {
  return (
    <div className="
      rounded-2xl
      bg-gray-900
      border border-gray-700
      p-5
    ">
      <p className="text-sm text-gray-400">
        {title}
      </p>
      <h3 className="text-2xl font-semibold mt-2">
        {value}
      </h3>
    </div>
  );
}
