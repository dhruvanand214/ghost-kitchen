import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useNavigate } from "react-router-dom";

const GET_ALL_RESTAURANTS = gql`
  query {
    getAllRestaurants {
      id
      name
      cuisineType
      kitchenId
    }
  }
`;

type Restaurant = {
  id: string;
  name: string;
  cuisineType?: string;
  kitchenId: string;
};

export default function CustomerRestaurantsPage() {
  const navigate = useNavigate();

  const { data, loading, error } = useQuery<{
    getAllRestaurants: Restaurant[];
  }>(GET_ALL_RESTAURANTS);

  if (loading) return <p className="text-gray-400 p-6">Loading restaurants…</p>;
  if (error) return <p className="text-red-400 p-6">{error.message}</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Choose a Restaurant</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {data?.getAllRestaurants.map((restaurant) => (
          <div
            key={restaurant.id}
            onClick={() => {
              localStorage.setItem('kitchenId', restaurant.kitchenId);
              navigate(`/menu/${restaurant.id}`, {
                state: { kitchenId: restaurant.kitchenId }
              });
            }}
            className="card cursor-pointer hover:border-accent transition"
          >
            <h3 className="font-medium">{restaurant.name}</h3>
            <p className="text-sm text-gray-400">
              {restaurant.cuisineType}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
