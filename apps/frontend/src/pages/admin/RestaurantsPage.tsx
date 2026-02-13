import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Modal from "../../components/ui/Modal";

/* ---------------- GraphQL ---------------- */

const GET_KITCHENS = gql`
  query {
    getAllKitchens {
      id
      name
    }
  }
`;

const GET_RESTAURANTS = gql`
  query GetRestaurants($kitchenId: ID!) {
    getRestaurantsByKitchen(kitchenId: $kitchenId) {
      id
      name
      cuisines
    }
  }
`;

const CREATE_RESTAURANT = gql`
  mutation CreateRestaurant(
    $name: String!
    $kitchenId: ID!
    $cuisines: [String!]!
  ) {
    createRestaurant(
      name: $name
      kitchenId: $kitchenId
      cuisines: $cuisines
    ) {
      id
      name
      cuisineType
    }
  }
`;

const GET_CUISINES = gql`
  query {
    getCuisines(activeOnly: true) {
      id
      name
    }
  }
`;


/* ---------------- Types ---------------- */

type Kitchen = {
  id: string;
  name: string;
};

type Restaurant = {
  id: string;
  name: string;
  cuisines?: string[];
};

type Cuisine = {
  id: string;
  name: string;
};

/* ---------------- Page ---------------- */

export default function RestaurantsPage() {
  const [selectedKitchen, setSelectedKitchen] =
    useState<Kitchen | null>(null);
  const navigate = useNavigate();

  const [restaurantName, setRestaurantName] =
    useState("");
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([]);
  const [open, setOpen] = useState(false);

  const { data: cuisines } = useQuery<{
    getCuisines: Cuisine[];
  }>(GET_CUISINES);

  const { data: kitchens } = useQuery<{
    getAllKitchens: Kitchen[];
  }>(GET_KITCHENS);

  const {
    data: restaurants,
    refetch
  } = useQuery<{
    getRestaurantsByKitchen: Restaurant[];
  }>(GET_RESTAURANTS, {
    skip: !selectedKitchen,
    variables: {
      kitchenId: selectedKitchen?.id
    }
  });

  const [createRestaurant, { loading }] =
    useMutation(CREATE_RESTAURANT);

  const handleCreateRestaurant = async () => {
    if (!selectedKitchen || !restaurantName || selectedCuisines.length === 0) return;

    await createRestaurant({
      variables: {
        name: restaurantName,
        kitchenId: selectedKitchen.id,
        cuisines: selectedCuisines
      }
    });

    setRestaurantName("");
    setSelectedCuisines([]);
    setOpen(false);
    refetch();
  };

  return (
    <div className="flex gap-8 p-6">
      {/* ---------------- Kitchens Panel ---------------- */}
      <aside className="
        w-64
        shrink-0
        rounded-2xl
        bg-gray-900
        border border-gray-700
        p-4
        space-y-3
      ">
        <h2 className="text-lg font-semibold">
          Kitchens
        </h2>

        {kitchens?.getAllKitchens.map((k) => (
          <button
            key={k.id}
            onClick={() => setSelectedKitchen(k)}
            className={`
              w-full text-left px-4 py-2 rounded-lg
              transition
              ${selectedKitchen?.id === k.id
                ? "bg-indigo-600 text-white"
                : "text-gray-400 hover:bg-gray-800"
              }
            `}
          >
            {k.name}
          </button>
        ))}
      </aside>

      {/* ---------------- Main Content ---------------- */}
      <main className="flex-1 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-semibold">
              Restaurants
            </h1>
            <p className="text-gray-400">
              {selectedKitchen
                ? `Managing restaurants for ${selectedKitchen.name}`
                : "Select a kitchen to view restaurants"}
            </p>
          </div>

          <button
            disabled={!selectedKitchen}
            onClick={() => setOpen(true)}
            className="
              px-5 py-3 rounded-xl
              bg-gradient-to-r from-indigo-500 to-purple-600
              text-white font-medium
              shadow-lg
              hover:scale-[1.02]
              hover:shadow-xl
              transition
              disabled:opacity-40
            "
          >
            + Add Restaurant
          </button>
        </div>

        {/* Restaurants Grid */}
        {!selectedKitchen && (
          <div className="
            rounded-2xl
            border border-dashed border-gray-700
            p-12
            text-center
            text-gray-400
          ">
            Select a kitchen to view its restaurants
          </div>
        )}

        {selectedKitchen &&
          restaurants?.getRestaurantsByKitchen
            .length === 0 && (
            <div className="
              rounded-2xl
              border border-dashed border-gray-700
              p-12
              text-center
              text-gray-400
            ">
              No restaurants yet for this kitchen
            </div>
          )}

        <div className="grid grid-cols-3 gap-6">
          {restaurants?.getRestaurantsByKitchen.map(
            (r) => (
              <div
                key={r.id}
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
                <h3 className="text-lg font-semibold">
                  {r.name}
                </h3>

                {r.cuisines && (
                  <p className="text-gray-400 mt-1">
                    [{r.cuisines.join(", ")}]
                  </p>
                )}

                <button
                  onClick={() =>
                    navigate(
                      `/admin/restaurants/${r.id}`, {
                      state: { kitchenId: selectedKitchen?.id }
                    }
                    )
                  }
                  className="
                    mt-5 w-full
                    btn-secondary
                    opacity-0
                    group-hover:opacity-100
                    transition
                  "
                >
                  Manage Products
                </button>
              </div>
            )
          )}
        </div>
      </main>

      {/* ---------------- Modal ---------------- */}
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Create Restaurant"
      >
        <div className="space-y-4">
          <input
            className="input"
            placeholder="Restaurant name"
            value={restaurantName}
            onChange={(e) =>
              setRestaurantName(e.target.value)
            }
          />

          {/* Cuisine Multi Select */}
          <div className="space-y-2">
            <label className="text-sm text-gray-400">
              Select cuisines
            </label>

            <div className="flex flex-wrap gap-2">
              {cuisines?.getCuisines.map((c) => {
                const active = selectedCuisines.includes(c.name);

                return (
                  <button
                    key={c.id}
                    onClick={() =>
                      setSelectedCuisines((prev) =>
                        active
                          ? prev.filter((x) => x !== c.name)
                          : [...prev, c.name]
                      )
                    }
                    className={`
                      px-3 py-1 rounded-full text-sm transition
                      ${
                        active
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                      }
                    `}
                  >
                    {c.name}
                  </button>
                );
              })}
            </div>
          </div>


          <div className="flex gap-3 pt-2">
            <button
              className="btn-secondary flex-1"
              onClick={() => setOpen(false)}
            >
              Cancel
            </button>

            <button
              disabled={!restaurantName || loading}
              className="btn-primary flex-1"
              onClick={handleCreateRestaurant}
            >
              {loading ? "Creating…" : "Create"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
