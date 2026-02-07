import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useState } from "react";

/* ---------------- GraphQL ---------------- */

const GET_KITCHENS = gql`
  query {
    getAllKitchens {
      id
      name
      location
      isActive
    }
  }
`;

const GET_RESTAURANTS = gql`
  query GetRestaurantsByKitchen($kitchenId: ID!) {
    getRestaurantsByKitchen(kitchenId: $kitchenId) {
      id
      name
      cuisineType
      isActive
    }
  }
`;

/* ---------------- Types ---------------- */

type Kitchen = {
  id: string;
  name: string;
  location?: string;
  isActive: boolean;
};

type Restaurant = {
  id: string;
  name: string;
  cuisineType?: string;
  isActive: boolean;
};

/* ---------------- Page ---------------- */

export default function AdminDashboard() {
  const [selectedKitchen, setSelectedKitchen] =
    useState<Kitchen | null>(null);

  const { data, loading } = useQuery<{
    getAllKitchens: Kitchen[];
  }>(GET_KITCHENS);

  const { data: restaurantData } = useQuery<{
    getRestaurantsByKitchen: Restaurant[];
  }>(GET_RESTAURANTS, {
    variables: { kitchenId: selectedKitchen?.id },
    skip: !selectedKitchen
  });

  /* ---------------- UI ---------------- */

  return (
    <div className="space-y-10 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold">
          Admin Dashboard
        </h1>
        <p className="text-gray-400">
          Platform-wide kitchen & restaurant management
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-6">
        <StatCard
          title="Total Kitchens"
          value={data?.getAllKitchens.length ?? 0}
        />
        <StatCard
          title="Active Kitchens"
          value={
            data?.getAllKitchens.filter(
              (k) => k.isActive
            ).length ?? 0
          }
        />
        <StatCard
          title="Selected Kitchen"
          value={selectedKitchen ? "1" : "0"}
        />
        <StatCard title="Platform Status" value="Live" />
      </div>

      {/* Kitchens */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">
          Kitchens
        </h2>

        {loading && (
          <p className="text-gray-400">
            Loading kitchens…
          </p>
        )}

        <div className="grid grid-cols-3 gap-6">
          {data?.getAllKitchens.map((kitchen) => (
            <div
              key={kitchen.id}
              onClick={() => setSelectedKitchen(kitchen)}
              className={`
                cursor-pointer
                rounded-2xl
                bg-gray-900
                border
                p-6
                transition
                hover:-translate-y-1
                hover:shadow-xl
                ${
                  selectedKitchen?.id === kitchen.id
                    ? "border-indigo-500"
                    : "border-gray-700"
                }
              `}
            >
              <h3 className="text-lg font-semibold">
                {kitchen.name}
              </h3>

              {kitchen.location && (
                <p className="text-gray-400 mt-1">
                  📍 {kitchen.location}
                </p>
              )}

              <span
                className={`
                  inline-block mt-3
                  px-3 py-1 text-xs rounded-full
                  ${
                    kitchen.isActive
                      ? "bg-green-900 text-green-300"
                      : "bg-red-900 text-red-300"
                  }
                `}
              >
                {kitchen.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Restaurants */}
      {selectedKitchen && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            Restaurants under{" "}
            <span className="text-indigo-400">
              {selectedKitchen.name}
            </span>
          </h2>

          {restaurantData?.getRestaurantsByKitchen
            .length === 0 && (
            <p className="text-gray-400">
              No restaurants added yet.
            </p>
          )}

          <div className="grid grid-cols-3 gap-6">
            {restaurantData?.getRestaurantsByKitchen.map(
              (restaurant) => (
                <div
                  key={restaurant.id}
                  className="
                    rounded-2xl
                    bg-gray-900
                    border border-gray-700
                    p-5
                  "
                >
                  <h3 className="font-semibold">
                    {restaurant.name}
                  </h3>

                  {restaurant.cuisineType && (
                    <p className="text-gray-400 mt-1">
                      {restaurant.cuisineType}
                    </p>
                  )}

                  <span
                    className={`
                      inline-block mt-3
                      px-3 py-1 text-xs rounded-full
                      ${
                        restaurant.isActive
                          ? "bg-green-900 text-green-300"
                          : "bg-red-900 text-red-300"
                      }
                    `}
                  >
                    {restaurant.isActive
                      ? "Active"
                      : "Inactive"}
                  </span>
                </div>
              )
            )}
          </div>
        </div>
      )}
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
