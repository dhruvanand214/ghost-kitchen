import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import { useNavigate } from "react-router-dom";

const GET_MY_RESTAURANTS = gql`
  query {
    getMyRestaurants {
      id
      name
      cuisineType
    }
  }
`;

type Restaurant = {
  id: string;
  name: string;
  cuisineType?: string;
};

export default function KitchenRestaurantsPage() {
  const navigate = useNavigate();

  const { data, loading, error } = useQuery<{
    getMyRestaurants: Restaurant[];
  }>(GET_MY_RESTAURANTS);

  if (loading) return <p className="text-gray-400">Loading…</p>;
  if (error) return <p className="text-red-400">{error.message}</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">My Restaurants</h1>

      {data?.getMyRestaurants.length === 0 && (
        <p className="text-gray-400">
          No restaurants assigned yet
        </p>
      )}

      <div className="grid grid-cols-3 gap-4">
        {data?.getMyRestaurants.map((restaurant) => (
          <div
            key={restaurant.id}
            className="card cursor-pointer hover:border-accent transition"
            onClick={() =>
              navigate(`/kitchen/restaurants/${restaurant.id}`)
            }
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
