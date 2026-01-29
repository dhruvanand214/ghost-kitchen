import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const GET_KITCHENS = gql`
  query {
    getAllKitchens {
      id
      name
      location
    }
  }
`;

export const GET_RESTAURANTS = gql`
  query GetRestaurants($kitchenId: ID!) {
    getRestaurantsByKitchen(kitchenId: $kitchenId) {
      id
      name
      cuisineType
    }
  }
`;


export const CREATE_RESTAURANT = gql`
  mutation CreateRestaurant(
    $name: String!
    $kitchenId: ID!
    $cuisineType: String
  ) {
    createRestaurant(
      name: $name
      kitchenId: $kitchenId
      cuisineType: $cuisineType
    ) {
      id
      name
    }
  }
`;

type Kitchen = {
  id: string;
  name: string;
  location: string;
};

type Restaurant = {
  id: string;
  name: string;
  cuisineType: string;
};

export default function AdminDashboard() {
  const [selectedKitchen, setSelectedKitchen] = useState<Kitchen | null>(null);
  const navigate = useNavigate();

  const { data: kitchensData, loading } = useQuery<{
    getAllKitchens: Kitchen[];
  }>(GET_KITCHENS);

  const {
    data: restaurantsData,
  } = useQuery<{ getRestaurantsByKitchen: Restaurant[] }>(
    GET_RESTAURANTS,
    {
      skip: !selectedKitchen,
      variables: { kitchenId: selectedKitchen?.id }
    }
  );

  const handleCreateRestaurant = async () => {
    navigate('/admin/restaurants', { state: { kitchenId: selectedKitchen?.id } })
  };


  return (
    <div className="flex min-h-screen">
      {/* <Sidebar /> */}

      <main className="flex-1 p-6 space-y-6">
        <h1 className="text-2xl font-semibold">Admin Dashboard</h1>

        {/* Kitchens */}
        <section>
          <h2 className="text-lg font-medium mb-3">Kitchens</h2>

          {loading && <p className="text-gray-400">Loading...</p>}

          <div className="grid grid-cols-3 gap-4">
            {kitchensData?.getAllKitchens.map((kitchen) => (
              <div
                key={kitchen.id}
                className={`card cursor-pointer ${selectedKitchen?.id === kitchen.id
                    ? "border-accent"
                    : ""
                  }`}
                onClick={() => setSelectedKitchen(kitchen)}
              >
                <h3 className="font-medium">{kitchen.name}</h3>
                <p className="text-sm text-gray-400">
                  {kitchen.location || "No location"}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Restaurants */}
        {selectedKitchen && (
          <section className="space-y-3">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium">
                Restaurants – {selectedKitchen.name}
              </h2>

              <button
                onClick={() => handleCreateRestaurant()}
                className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium shadow-lg hover:scale-[1.02] hover:shadow-xl transition"
              >
                <span className="text-xl">+</span>
                Add Restaurant
              </button>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {restaurantsData?.getRestaurantsByKitchen.map(
                (restaurant) => (
                  <div key={restaurant.id} className="card">
                    <h3 className="font-medium">{restaurant.name}</h3>
                    <p className="text-sm text-gray-400">
                      {restaurant.cuisineType}
                    </p>
                  </div>
                )
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
