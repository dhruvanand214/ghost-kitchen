/* eslint-disable react-hooks/set-state-in-effect */
import { gql } from "@apollo/client";
import { useEffect, useState } from "react";
import Modal from "../../components/ui/Modal";
import { socket } from "../../sockets/socket";
import { useQuery, useMutation } from "@apollo/client/react";

/* ---------------- GraphQL ---------------- */

const GET_ORDERS = gql`
  query GetOrdersByKitchen($kitchenId: ID!) {
    getOrdersByKitchen(kitchenId: $kitchenId) {
      id
      orderNumber
      status
      createdAt
      eta
      deliveredAt
    }
  }
`;

const UPDATE_ETA = gql`
  mutation UpdateETA($orderId: ID!, $eta: String!, $note: String) {
    updateOrderETA(orderId: $orderId, eta: $eta, note: $note) {
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

/* ---------------- Types ---------------- */

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  createdAt: string;
  eta?: string;
  deliveredAt?: string;

  isNew?: boolean;
};

/* ---------------- Helpers ---------------- */

const statusColor: Record<string, string> = {
  RECEIVED: "bg-blue-900 text-blue-300",
  PREPARING: "bg-yellow-900 text-yellow-300",
  OUT_FOR_DELIVERY: "bg-purple-900 text-purple-300",
  DELIVERED: "bg-green-900 text-green-300",
  CANCELLED: "bg-red-900 text-red-300",
};

const STATUS_FLOW = ["RECEIVED", "PREPARING", "OUT_FOR_DELIVERY", "DELIVERED"];

/* ---------------- Page ---------------- */

export default function OrdersPage() {
  const kitchenId = localStorage.getItem("kitchenId");
  const [orders, setOrders] = useState<Order[]>([]);

  const [open, setOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [etaMinutes, setEtaMinutes] = useState<number | "">("");
  const [note, setNote] = useState("");

  const { data } = useQuery<{ getOrdersByKitchen: Order[] }>(GET_ORDERS, {
    variables: { kitchenId },
    skip: !kitchenId,
  });

  const [updateETA] = useMutation(UPDATE_ETA);
  const [cancelOrder] = useMutation(CANCEL_ORDER);

  /* ---------------- Effects ---------------- */

  useEffect(() => {
    if (data?.getOrdersByKitchen) {
      setOrders(data.getOrdersByKitchen);
    }
  }, [data]);

  useEffect(() => {
    if (!kitchenId) return;

    socket.connect();
    socket.emit("JOIN_KITCHEN", kitchenId);

    socket.on("NEW_ORDER", (order: Order) => {
      setOrders((prev) => [{ ...order, isNew: true }, ...prev]);

      // Remove glow after 6 seconds
      setTimeout(() => {
        setOrders((prev) =>
          prev.map((o) => (o.id === order.id ? { ...o, isNew: false } : o)),
        );
      }, 6000);
    });

    socket.on("ORDER_CANCELLED", (order: Order) => {
      setOrders((prev) => prev.filter((o) => o.id !== order.id));
    });

    return () => {
      socket.disconnect();
    };
  }, [kitchenId]);

  /* ---------------- Handlers ---------------- */

  const openEtaModal = (order: Order) => {
    setSelectedOrder(order);
    setEtaMinutes("");
    setNote("");
    setOpen(true);
  };

  const saveEta = async () => {
    if (!selectedOrder || !etaMinutes) return;

    const eta = new Date(
      Date.now() + Number(etaMinutes) * 60 * 1000,
    ).toISOString();

    await updateETA({
      variables: {
        orderId: selectedOrder.id,
        eta,
        note,
      },
    });

    setOpen(false);
  };

  /* ---------------- UI ---------------- */

  return (
    <div className='space-y-6'>
      <h1 className='text-2xl font-semibold'>Live Orders</h1>

      {orders.length === 0 && <p className='text-gray-400'>No orders yet 🍳</p>}

      <div className='grid grid-cols-3 gap-6'>
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
              ${order.status === "DELIVERED" ? "opacity-80" : ""}
            `}
          >
            {/* Header */}
            <div className='flex justify-between items-start'>
              <div>
                <p className='text-sm text-gray-400'>Order</p>
                <h3 className='font-semibold text-lg'>{order.orderNumber}</h3>
              </div>

              <span
                className={`
                  px-3 py-1 text-xs rounded-full
                  ${statusColor[order.status]}
                `}
              >
                {order.status}
              </span>
            </div>

            {/* Meta */}
            <p className='text-sm text-gray-400 mt-3'>
              Placed at {new Date(order.createdAt).toLocaleString()}
            </p>

            {order.eta && (
              <p className='text-sm text-accent mt-1'>
                ETA: {new Date(order.eta).toLocaleTimeString()}
              </p>
            )}

            {order.status === "DELIVERED" && order.deliveredAt && (
              <div className="mt-4 rounded-lg bg-green-900/30 border border-green-700
                    p-3 text-green-300 text-sm">
                ✅ Delivered at{" "}
                {new Date(order.deliveredAt).toLocaleString()}
              </div>
            )}


            {/* Actions */}
            <div className="flex mt-5 space-x-2">
              {order.status === "RECEIVED" && (
                <button
                  className="btn-secondary w-full"
                  onClick={() => openEtaModal(order)}
                >
                  Update ETA
                </button>
              )}

              {order.status === "PREPARING" && (
                <>
                  <button
                    className="btn-secondary w-full"
                    onClick={() => openEtaModal(order)}
                  >
                    Update ETA
                  </button>

                  <button
                    className="btn-danger w-full"
                    onClick={() =>
                      cancelOrder({
                        variables: {
                          orderId: order.id,
                          reason: "Cancelled by kitchen"
                        }
                      })
                    }
                  >
                    Cancel Order
                  </button>
                </>
              )}

              {order.status === "OUT_FOR_DELIVERY" && (
                <>
                  <button
                    className="btn-secondary w-full"
                    onClick={() => openEtaModal(order)}
                  >
                    Update ETA
                  </button>

                  <button
                    className="btn-danger w-full"
                    onClick={() =>
                      cancelOrder({
                        variables: {
                          orderId: order.id,
                          reason: "Cancelled by kitchen"
                        }
                      })
                    }
                  >
                    Cancel Order
                  </button>
                </>
              )}
            </div>


            <div className='flex items-center gap-4 mt-4 ml-6'>
              {STATUS_FLOW.map((step, index) => {
                const currentIndex = STATUS_FLOW.indexOf(order.status);

                const isCompleted = index < currentIndex;
                const isActive = index === currentIndex;

                return (
                  <div key={step} className='flex items-center gap-4'>
                    <div
                      className={`
            w-3 h-3 rounded-full
            ${isCompleted
                          ? "bg-green-500"
                          : isActive
                            ? "bg-indigo-500 animate-pulse"
                            : "bg-gray-600"
                        }
          `}
                    />

                    {index < STATUS_FLOW.length - 1 && (
                      <div
                        className={`
              w-6 h-[2px]
              ${isCompleted ? "bg-green-500" : "bg-gray-600"}
            `}
                      />
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Received</span>
              <span>Preparing</span>
              <span className="mr-4">Out</span>
              <span>Done</span>
            </div>

          </div>
        ))}
      </div>

      {/* ETA Modal */}
      <Modal open={open} onClose={() => setOpen(false)} title='Update ETA'>
        <div className='space-y-4'>
          <input
            className='input'
            type='number'
            placeholder='ETA in minutes'
            value={etaMinutes}
            onChange={(e) => setEtaMinutes(Number(e.target.value))}
          />

          <input
            className='input'
            placeholder='Note for customer (optional)'
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />

          <div className='flex gap-3'>
            <button
              className='btn-secondary flex-1'
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>

            <button className='btn-primary flex-1' onClick={saveEta}>
              Save ETA
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
