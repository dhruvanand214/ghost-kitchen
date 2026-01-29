import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

const GET_KITCHEN_ORDERS = gql`
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

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  createdAt: string;
  deliveredAt?: string;
};

export default function OrderHistoryPage() {
  const kitchenId = localStorage.getItem("kitchenId");

  const { data, loading } = useQuery<{ getOrderHistoryByKitchen: Order[] }>(
    GET_KITCHEN_ORDERS,
    {
      variables: { kitchenId },
      skip: !kitchenId
    }
  );

  const historyOrders =
    data?.getOrderHistoryByKitchen.filter(
      (o) =>
        o.status === "DELIVERED" ||
        o.status === "CANCELLED"
    ) ?? [];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold">
          Order History
        </h1>
        <p className="text-gray-400">
          Completed and cancelled orders
        </p>
      </div>

      {loading && (
        <p className="text-gray-400">Loading history…</p>
      )}

      {!loading && historyOrders.length === 0 && (
        <p className="text-gray-400">
          No completed orders yet.
        </p>
      )}

      <div className="grid grid-cols-3 gap-6">
        {historyOrders.map((order) => (
          <div
            key={order.id}
            className="
              rounded-2xl
              bg-gray-900
              border border-gray-700
              p-5
              opacity-90
            "
          >
            {/* Header */}
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-400">
                  Order
                </p>
                <h3 className="font-semibold text-lg">
                  {order.orderNumber}
                </h3>
              </div>

              <span
                className={`
                  px-3 py-1 text-xs rounded-full
                  ${
                    order.status === "DELIVERED"
                      ? "bg-green-900 text-green-300"
                      : "bg-red-900 text-red-300"
                  }
                `}
              >
                {order.status}
              </span>
            </div>

            {/* Meta */}
            <p className="text-sm text-gray-400 mt-3">
              Placed:{" "}
              {new Date(order.createdAt).toLocaleString()}
            </p>

            {order.deliveredAt && (
              <p className="text-sm text-green-400 mt-1">
                Delivered:{" "}
                {new Date(
                  order.deliveredAt
                ).toLocaleString()}
              </p>
            )}

            {order.status === "CANCELLED" && (
              <p className="text-sm text-red-400 mt-1">
                Cancelled
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
