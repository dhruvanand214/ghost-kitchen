import { gql } from "@apollo/client";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@apollo/client/react";

/* ---------------- GraphQL ---------------- */

const GET_ORDER = gql`
  query GetOrderById($orderId: ID!) {
    getOrderById(orderId: $orderId) {
      id
      orderNumber
      status
      createdAt
      eta
    }
  }
`;

const STATUS_STEPS = [
  "RECEIVED",
  "PREPARING",
  "OUT_FOR_DELIVERY",
  "DELIVERED"
];

/* ---------------- Page ---------------- */

export default function OrderConfirmationPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const { data, loading } = useQuery<{
    getOrderById: {
      id: string;
      orderNumber: string;
      status: string;
      createdAt: string;
      eta?: string;
    };
  }>(GET_ORDER, {
    variables: { orderId }
  });

  if (loading) {
    return (
      <p className="p-6 text-gray-400 text-center">
        Loading order details…
      </p>
    );
  }

  const order = data?.getOrderById;
  if (!order) return null;

  const currentStep = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="
        w-full max-w-xl
        space-y-8
        text-center
      ">
        {/* Success */}
        <div className="space-y-2">
          <div className="
            w-20 h-20 mx-auto
            rounded-full
            bg-green-500/20
            flex items-center justify-center
            text-3xl
          ">
            ✅
          </div>

          <h1 className="text-2xl font-bold">
            Order Confirmed!
          </h1>

          <p className="text-gray-400">
            Order #{order.orderNumber}
          </p>
        </div>

        {/* Timeline */}
        <div className="
          rounded-2xl
          bg-gray-900
          border border-gray-700
          p-6
        ">
          <h3 className="font-semibold mb-4">
            Order Status
          </h3>

          <div className="flex justify-between items-center">
            {STATUS_STEPS.map((step, index) => (
              <div
                key={step}
                className="flex-1 text-center"
              >
                <div
                  className={`
                    mx-auto w-8 h-8 rounded-full
                    flex items-center justify-center
                    ${
                      index <= currentStep
                        ? "bg-indigo-600"
                        : "bg-gray-700"
                    }
                  `}
                >
                  {index <= currentStep ? "✓" : ""}
                </div>

                <p className={`
                  mt-2 text-xs
                  ${
                    index <= currentStep
                      ? "text-white"
                      : "text-gray-500"
                  }
                `}>
                  {step.replaceAll("_", " ")}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="
          grid grid-cols-2 gap-4
        ">
          <div className="card">
            <p className="text-sm text-gray-400">
              Ordered at
            </p>
            <p className="font-medium">
              {new Date(order.createdAt).toLocaleTimeString()}
            </p>
          </div>

          <div className="card">
            <p className="text-sm text-gray-400">
              Estimated Delivery
            </p>
            <p className="font-medium">
              {order.eta
                ? new Date(order.eta).toLocaleTimeString()
                : "Calculating…"}
            </p>
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() =>
            navigate(`/order/track/${order.id}`)
          }
          className="
            w-full
            py-4
            rounded-2xl
            bg-gradient-to-r from-indigo-500 to-purple-600
            font-semibold
            text-lg
            hover:opacity-90
            transition
          "
        >
          Track Order Live →
        </button>

        <p className="text-xs text-gray-500">
          You’ll receive live updates on this page
        </p>
      </div>
    </div>
  );
}
