/* eslint-disable react-hooks/purity */
import { gql } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { useMemo, useState } from "react";
import { useQuery } from "@apollo/client/react";

/* ---------------- GraphQL ---------------- */

const GET_ALL_RESTAURANTS = gql`
  query {
    getAllRestaurants {
      id
      name
      cuisineType
      isActive
    }
  }
`;

/* ---------------- Types ---------------- */

type Restaurant = {
  id: string;
  name: string;
  cuisineType?: string;
  isActive: boolean;
};

/* ---------------- Page ---------------- */

export default function CustomerRestaurantsPage() {
  const navigate = useNavigate();
  const { data, loading } = useQuery<{ getAllRestaurants: Restaurant[] }>(
    GET_ALL_RESTAURANTS
  );

  const [search, setSearch] = useState("");
  const [selectedCuisine, setSelectedCuisine] = useState<string | null>(null);

  const restaurants = useMemo(
    () => data?.getAllRestaurants.filter((r) => r.isActive) ?? [],
    [data]
  );

  /* ---------------- Derived Data ---------------- */

  const cuisines = useMemo(() => {
    return Array.from(
      new Set(
        restaurants
          .map((r) => r.cuisineType)
          .filter(Boolean)
      )
    ) as string[];
  }, [restaurants]);

  const filteredRestaurants = useMemo(() => {
    return restaurants.filter((r) => {
      const matchesSearch = r.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesCuisine = selectedCuisine
        ? r.cuisineType === selectedCuisine
        : true;

      return matchesSearch && matchesCuisine;
    });
  }, [restaurants, search, selectedCuisine]);

  if (loading) {
    return (
      <p className="p-6 text-gray-400">
        Loading restaurants…
      </p>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold">
          Discover Restaurants 🍔
        </h1>
        <p className="text-gray-400">
          Find your next favourite meal
        </p>
      </div>

      {/* Search */}
      <input
        className="input max-w-md"
        placeholder="Search restaurants…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Cuisine Chips */}
      <div className="flex gap-2 flex-wrap">
        <Chip
          active={!selectedCuisine}
          label="All"
          onClick={() => setSelectedCuisine(null)}
        />

        {cuisines.map((cuisine) => (
          <Chip
            key={cuisine}
            active={selectedCuisine === cuisine}
            label={cuisine}
            onClick={() => setSelectedCuisine(cuisine)}
          />
        ))}
      </div>

      {/* Restaurant Grid */}
      <div className="grid grid-cols-4 gap-6">
        {filteredRestaurants.map((restaurant) => (
          <RestaurantCard
            key={restaurant.id}
            restaurant={restaurant}
            onClick={() =>
              navigate(`/menu/${restaurant.id}`)
            }
          />
        ))}
      </div>
    </div>
  );
}

/* ---------------- Components ---------------- */

function Chip({
  label,
  active,
  onClick
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        px-4 py-2 rounded-full text-sm
        transition
        ${
          active
            ? "bg-indigo-600 text-white"
            : "bg-gray-800 text-gray-300 hover:bg-gray-700"
        }
      `}
    >
      {label}
    </button>
  );
}

function RestaurantCard({
  restaurant,
  onClick
}: {
  restaurant: Restaurant;
  onClick: () => void;
}) {
  const rating = useMemo(
    () => (Math.random() * 1.5 + 3.5).toFixed(1),
    []
  );

  return (
    <div
      onClick={onClick}
      className="
        group cursor-pointer
        rounded-3xl
        bg-gray-900/80
        border border-gray-700
        overflow-hidden
        transition
        hover:-translate-y-2
        hover:shadow-2xl
      "
    >
      {/* Image */}
      <div className="
        h-36
        bg-gradient-to-br
        from-indigo-500/30
        to-purple-600/30
        flex items-center justify-center
        text-4xl
      ">
        🍽️
      </div>

      {/* Content */}
      <div className="p-4 space-y-1">
        <h3 className="font-semibold">
          {restaurant.name}
        </h3>

        <p className="text-sm text-gray-400">
          {restaurant.cuisineType}
        </p>

        <div className="text-sm text-yellow-400">
          ⭐ {rating}
        </div>
      </div>
    </div>
  );
}
