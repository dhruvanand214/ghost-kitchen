import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";
import { useState } from "react";
import Modal from "../../components/ui/Modal";

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
      cuisineType
    }
  }
`;

const CREATE_RESTAURANT = gql`
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
};

type Restaurant = {
  id: string;
  name: string;
  cuisineType?: string;
};

export default function RestaurantsPage() {
  const [restaurantName, setRestaurantName] = useState("");
  const [cuisineType, setCuisineType] = useState("");
  const [open, setOpen] = useState(false);

  const [selectedKitchen, setSelectedKitchen] = useState<string | null>(null);

  const { data: kitchens } = useQuery<{ getAllKitchens: Kitchen[] }>(
    GET_KITCHENS
  );

  const { data: restaurants, refetch } = useQuery<{
    getRestaurantsByKitchen: Restaurant[];
  }>(GET_RESTAURANTS, {
    skip: !selectedKitchen,
    variables: { kitchenId: selectedKitchen }
  });

  const [createRestaurant] = useMutation(CREATE_RESTAURANT);

  const handleCreateRestaurant = async () => {
    if (!selectedKitchen || !restaurantName) return;

    await createRestaurant({
      variables: {
        name: restaurantName,
        kitchenId: selectedKitchen,
        cuisineType
      }
    });

    setRestaurantName("");
    setCuisineType("");
    refetch();
  };


  return (

    <div className="space-y-6">
      <div className="fixed top-6 right-6 z-50">

        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium shadow-lg hover:scale-[1.02] hover:shadow-xl transition"
        >
          <span className="text-xl">+</span>
          Add Restaurant
        </button>

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
              onChange={(e) => setRestaurantName(e.target.value)}
            />

            <input
              className="input"
              placeholder="Cuisine type (optional)"
              value={cuisineType}
              onChange={(e) => setCuisineType(e.target.value)}
            />

            <div className="flex gap-3 pt-2">
              <button
                className="btn-secondary flex-1"
                onClick={() => setOpen(false)}
              >
                Cancel
              </button>

              <button
                disabled={!restaurantName || !selectedKitchen}
                className="btn-primary disabled:opacity-50 flex-1"
                onClick={() => {
                  handleCreateRestaurant();
                  setOpen(false);
                }}
              >
                Create
              </button>
            </div>
          </div>
        </Modal>

      </div>

      <h1 className="text-2xl font-semibold">Restaurants</h1>

      <div className="flex gap-3">
        {kitchens?.getAllKitchens.map((k) => (
          <button
            key={k.id}
            onClick={() => setSelectedKitchen(k.id)}
            className={`px-3 py-1 rounded-lg border ${selectedKitchen === k.id
              ? "border-accent text-white"
              : "border-border text-gray-400"
              }`}
          >
            {k.name}
          </button>
        ))}
      </div>

      {selectedKitchen && (
        <>
          <div className="grid grid-cols-3 gap-4">
            {restaurants?.getRestaurantsByKitchen.map((r) => (
              <div key={r.id} className="card">
                <h3 className="font-medium">{r.name}</h3>
                <p className="text-sm text-gray-400">
                  {r.cuisineType}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
