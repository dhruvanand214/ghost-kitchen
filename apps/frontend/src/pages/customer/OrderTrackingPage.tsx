import { gql } from "@apollo/client";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { socket } from "../../sockets/socket";
import OrderStatusTimeline from "../../components/OrderStatusTimeline";
import { useMutation, useQuery } from "@apollo/client/react";
import OrderItems from "../../components/OrderItems";
import DeliveryETA from "../../components/DeliveryETA";

/* ---------------- GraphQL ---------------- */

const GET_ORDER = gql`
  query GetOrder($orderId: ID!) {
    getOrderById(orderId: $orderId) {
      id
      orderNumber
      status
      createdAt
      items {
        name
        quantity
        priceSnapshot
      }
      total
      eta
      etaNotes
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

/* ---------------- Page ---------------- */

export default function OrderTrackingPage() {
  const { orderId } = useParams();

  const { data } = useQuery<{
    getOrderById: {
      id: string;
      orderNumber: string;
      status: string;
      createdAt: string;
      items: {
        name: string;
        quantity: number;
        priceSnapshot: number;
      }[];
      total: number;
      eta?: string;
      etaNotes?: string;
    };
  }>(GET_ORDER, {
    variables: { orderId }
  });

  const [cancelOrder] = useMutation(CANCEL_ORDER);

  const order = data?.getOrderById;

  const [status, setStatus] = useState<string | null>(null);
  const [eta, setEta] = useState<string | undefined>();
  const [etaNote, setEtaNote] = useState<string | undefined>();

  /* ---------------- Sync initial data ---------------- */

  useEffect(() => {
    if (order) {
      setStatus(order.status);
      setEta(order.eta);
      setEtaNote(order.etaNotes);
    }
  }, [order]);

  /* ---------------- Socket updates ---------------- */

  useEffect(() => {
    if (!orderId) return;

    socket.connect();
    socket.emit("JOIN_ORDER", orderId);

    socket.on("ORDER_UPDATED", (payload) => {
      if (payload.orderId === orderId) {
        setStatus(payload.status);
      }
    });

    socket.on("ETA_UPDATED", (payload) => {
      if (payload.orderId === orderId) {
        setEta(payload.eta);
        setEtaNote(payload.note);
      }
    });

    socket.on("ORDER_CANCELLED", (payload) => {
      if (payload.id === orderId) {
        setStatus("CANCELLED");
      }
    });

    return () => {
      socket.off("ORDER_UPDATED");
      socket.off("ETA_UPDATED");
      socket.off("ORDER_CANCELLED");
      socket.disconnect();
    };
  }, [orderId]);

  if (!order) return null;

  const currentStatus = status || order.status;

  const canCancel =
    currentStatus === "RECEIVED" ||
    currentStatus === "PREPARING";

  /* ---------------- UI ---------------- */

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-xl font-semibold">
          Order #{order.orderNumber}
        </h1>
        <p className="text-xs text-gray-400">
          Tracking your order live
        </p>
      </div>

      {/* ETA Note */}
      {etaNote && (
        <div className="card text-xs text-gray-300">
          📝 Note from kitchen: {etaNote}
        </div>
      )}

      {/* Cancelled Banner */}
      {currentStatus === "CANCELLED" && (
        <div className="card bg-red-900/30 text-red-300">
          ❌ This order has been cancelled
        </div>
      )}

      {/* Status Timeline */}
      <OrderStatusTimeline status={currentStatus} />

      {/* Order Items */}
      <OrderItems items={order.items} total={order.total} />

      {/* ETA */}
      <DeliveryETA eta={eta} />

      {/* Actions */}
      <div className="space-y-3 pt-2">
        {canCancel && (
          <button
            className="w-full py-3 rounded-xl bg-red-600/90 hover:bg-red-600 transition font-medium"
            onClick={() =>
              cancelOrder({
                variables: {
                  orderId,
                  reason: "Customer cancelled"
                }
              })
            }
          >
            Cancel Order
          </button>
        )}

      </div>
    </div>
  );
}
