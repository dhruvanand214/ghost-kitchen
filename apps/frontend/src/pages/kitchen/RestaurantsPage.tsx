import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useNavigate } from "react-router-dom";

const GET_MY_RESTAURANTS = gql`
  query {
    getMyRestaurants {
      id
      name
      cuisineType
      isActive
    }
  }
`;

type Restaurant = {
  id: string;
  name: string;
  cuisineType?: string;
  isActive: boolean;
};


/* ---------------- Page ---------------- */

export default function KitchenRestaurantsPage() {
  const navigate = useNavigate();

  const { data, loading } = useQuery<{
    getMyRestaurants: Restaurant[];
  }>(GET_MY_RESTAURANTS);

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold">
          Restaurants
        </h1>
        <p className="text-gray-400">
          Manage restaurants under this kitchen
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <p className="text-gray-400">
          Loading restaurants…
        </p>
      )}

      {/* Empty State */}
      {!loading &&
        data?.getMyRestaurants.length === 0 && (
          <div className="
            rounded-2xl
            border border-dashed border-gray-700
            p-10
            text-center
            text-gray-400
          ">
            <p className="text-lg">
              No restaurants found
            </p>
            <p className="text-sm mt-1">
              Contact admin to add restaurants
            </p>
          </div>
        )}

      {/* Restaurant Cards */}
      <div className="grid grid-cols-3 gap-6">
        {data?.getMyRestaurants.map(
          (restaurant) => (
            <div
              key={restaurant.id}
              className="
                group
                rounded-2xl
                bg-gray-900
                border border-gray-700
                p-6
                transition
                hover:-translate-y-1
                hover:shadow-xl
              "
            >
              {/* Info */}
              <div>
                <h3 className="text-xl font-semibold">
                  {restaurant.name}
                </h3>

                {restaurant.cuisineType && (
                  <p className="text-gray-400 mt-1">
                    {restaurant.cuisineType}
                  </p>
                )}
              </div>

              {/* Status */}
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

              {/* Action */}
              <button
                onClick={() =>
                  navigate(
                    `/kitchen/restaurants/${restaurant.id}`
                  )
                }
                className="
                  mt-6 w-full
                  btn-primary
                "
              >
                Manage Products
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
