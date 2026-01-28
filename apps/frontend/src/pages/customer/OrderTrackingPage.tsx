import { gql } from "@apollo/client";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { socket } from "../../sockets/socket";
import OrderStatusTimeline from "../../components/OrderStatusTimeline";
import { useMutation, useQuery } from "@apollo/client/react";
import OrderItems from "../../components/OrderItems";
import DeliveryETA from "../../components/DeliveryETA";

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

export default function OrderTrackingPage() {
  const { orderId } = useParams();
  const [status, setStatus] = useState<string | null>(null);
  const [cancelOrder] = useMutation(CANCEL_ORDER);

  const { data } = useQuery(GET_ORDER, {
    variables: { orderId },
  });

  const order = data?.getOrderById;
  const [eta, setEta] = useState<string | undefined>(order?.eta);
  const [etaNote, setEtaNote] = useState<string | undefined>(order?.etaNotes);

  useEffect(() => {
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

  return (
    <div className='max-w-md mx-auto p-6 space-y-6'>
      <h1 className='text-xl font-semibold'>Order #{order.orderNumber}</h1>

      {etaNote && (
        <p className='text-xs text-gray-400 mt-1'>
          Note from kitchen: {etaNote}
        </p>
      )}

      {order.status === "RECEIVED" && (
        <button
          className='btn-danger w-full mt-4'
          onClick={() => {
            cancelOrder({
              variables: {
                orderId,
                reason: "Customer cancelled",
              },
            });
          }}
        >
          Cancel Order
        </button>
      )}

      {status === "CANCELLED" && (
        <div className="card bg-red-900/30 text-red-300">
          ❌ Order Cancelled
        </div>
      )}

      <OrderStatusTimeline status={status || order.status} />

      <OrderItems items={order.items} total={order.total} />

      <DeliveryETA eta={eta} />
    </div>
  );
}
