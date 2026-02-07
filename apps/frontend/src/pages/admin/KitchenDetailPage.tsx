import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useParams } from "react-router-dom";

/* ---------------- GraphQL ---------------- */

const GET_KITCHEN_DATA = gql`
  query KitchenDetail($kitchenId: ID!) {
    getAllKitchens {
      id
      name
      location
      isActive
    }

    getRestaurantsByKitchen(kitchenId: $kitchenId) {
      id
      name
      cuisineType
      isActive
    }

    getOrdersByKitchen(kitchenId: $kitchenId) {
      id
      status
      createdAt
      deliveredAt
    }

    getOrderHistoryByKitchen(kitchenId: $kitchenId) {
      id
      status
      createdAt
      deliveredAt
    }
  }
`;

/* ---------------- Types ---------------- */

type Order = {
  status: string;
  createdAt: string;
  deliveredAt?: string;
};

type Restaurant = {
  id: string;
  name: string;
  cuisineType?: string;
  isActive: boolean;
};

type Kitchen = {
  id: string;
  name: string;
  location: string;
  isActive: boolean;
};

type KitchenDetailData = {
  getAllKitchens: Kitchen[];
  getRestaurantsByKitchen: Restaurant[];
  getOrdersByKitchen: Order[];
  getOrderHistoryByKitchen: Order[];
};

export default function KitchenDetailPage() {
  const { kitchenId } = useParams();

  const { data, loading } = useQuery<KitchenDetailData>(GET_KITCHEN_DATA, {
    variables: { kitchenId }
  });

  if (loading) {
    return (
      <p className="p-6 text-gray-400">
        Loading kitchen details…
      </p>
    );
  }

  const kitchen = data?.getAllKitchens.find(
    (k: Kitchen) => k.id === kitchenId
  );

  const restaurants: Restaurant[] =
    data?.getRestaurantsByKitchen ?? [];

  const activeOrders: Order[] =
    data?.getOrdersByKitchen ?? [];

  const historyOrders: Order[] =
    data?.getOrderHistoryByKitchen ?? [];

  /* ---------------- Analytics ---------------- */

  const totalOrders =
    activeOrders.length + historyOrders.length;

  const deliveredOrders = historyOrders.filter(
    (o) => o.status === "DELIVERED"
  );

  const cancelledOrders = historyOrders.filter(
    (o) => o.status === "CANCELLED"
  );

  const avgDeliveryTimeMinutes =
    deliveredOrders.length === 0
      ? 0
      : Math.round(
          deliveredOrders.reduce((sum, o) => {
            const start = new Date(o.createdAt).getTime();
            const end = new Date(
              o.deliveredAt!
            ).getTime();
            return sum + (end - start);
          }, 0) /
            deliveredOrders.length /
            60000
        );

  /* ---------------- UI ---------------- */

  return (
    <div className="space-y-10 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold">
          {kitchen?.name}
        </h1>
        <p className="text-gray-400">
          {kitchen?.location || "Location not specified"}
        </p>
      </div>

      {/* Status */}
      <span
        className={`
          inline-block
          px-4 py-1
          rounded-full
          text-sm
          ${
            kitchen?.isActive
              ? "bg-green-900 text-green-300"
              : "bg-red-900 text-red-300"
          }
        `}
      >
        {kitchen?.isActive ? "Active" : "Inactive"}
      </span>

      {/* KPI Cards */}
      <div className="grid grid-cols-5 gap-6">
        <StatCard title="Total Orders" value={totalOrders} />
        <StatCard
          title="Delivered"
          value={deliveredOrders.length}
        />
        <StatCard
          title="Cancelled"
          value={cancelledOrders.length}
        />
        <StatCard
          title="Avg Delivery Time"
          value={`${avgDeliveryTimeMinutes} min`}
        />
        <StatCard
          title="Active Restaurants"
          value={
            restaurants.filter((r) => r.isActive).length
          }
        />
      </div>

      {/* Restaurants */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          Restaurants
        </h2>

        <div className="grid grid-cols-3 gap-6">
          {restaurants.map((r) => (
            <div
              key={r.id}
              className="
                rounded-2xl
                bg-gray-900
                border border-gray-700
                p-5
              "
            >
              <h3 className="font-semibold text-lg">
                {r.name}
              </h3>

              {r.cuisineType && (
                <p className="text-gray-400 mt-1">
                  {r.cuisineType}
                </p>
              )}

              <span
                className={`
                  inline-block mt-3
                  px-3 py-1 text-xs rounded-full
                  ${
                    r.isActive
                      ? "bg-green-900 text-green-300"
                      : "bg-red-900 text-red-300"
                  }
                `}
              >
                {r.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          ))}
        </div>
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
  value: string | number;
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
