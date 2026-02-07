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
      location
      isActive
    }
  }
`;

const CREATE_KITCHEN = gql`
  mutation CreateKitchen($name: String!, $location: String) {
    createKitchen(name: $name, location: $location) {
      id
      name
      location
      isActive
    }
  }
`;

const TOGGLE_KITCHEN = gql`
  mutation ToggleKitchen($kitchenId: ID!, $isActive: Boolean!) {
    toggleKitchenStatus(kitchenId: $kitchenId, isActive: $isActive) {
      id
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

/* ---------------- Page ---------------- */

export default function KitchensPage() {
  const navigate = useNavigate();
  const { data, loading } = useQuery<{
    getAllKitchens: Kitchen[];
  }>(GET_KITCHENS);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");

  const [createKitchen, { loading: creating }] =
    useMutation(CREATE_KITCHEN, {
      refetchQueries: ["getAllKitchens"]
    });

  const [toggleKitchen] = useMutation(TOGGLE_KITCHEN, {
    refetchQueries: ["getAllKitchens"]
  });


  return (
    <div className="space-y-10 p-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-semibold">
            Kitchens
          </h1>
          <p className="text-gray-400">
            All operational kitchens on the platform
          </p>
        </div>

        {/* Future action */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="
    px-5 py-2
    rounded-xl
    bg-indigo-600
    hover:bg-indigo-500
    transition
    font-medium
  "
        >
          + New Kitchen
        </button>

      </div>

      {/* Loading */}
      {loading && (
        <p className="text-gray-400">
          Loading kitchens…
        </p>
      )}

      {/* Empty */}
      {!loading &&
        data?.getAllKitchens.length === 0 && (
          <div className="
            rounded-2xl
            border border-dashed border-gray-700
            p-12
            text-center
            text-gray-400
          ">
            No kitchens found
          </div>
        )}

      {/* Kitchen Grid */}
      <div className="grid grid-cols-3 gap-6">
        {data?.getAllKitchens.map((kitchen) => (
          <div
            key={kitchen.id}
            onClick={() =>
                  navigate(
                    `/admin/kitchens/${kitchen.id}`
                  )
                }
            className="
              group
              relative
              rounded-2xl
              bg-gray-900
              border border-gray-700
              p-6
              transition
              hover:-translate-y-1
              hover:shadow-2xl
            "
          >
            {/* Glow accent */}
            {kitchen.isActive && (
              <div
                className="
                  absolute inset-0
                  rounded-2xl
                  border border-indigo-500/30
                  opacity-0
                  group-hover:opacity-100
                  transition
                "
              />
            )}

            {/* Content */}
            <div className="relative z-10 space-y-3">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-semibold">
                  {kitchen.name}
                </h3>

                <span
                  className={`
                    px-3 py-1 text-xs rounded-full
                    ${kitchen.isActive
                      ? "bg-green-900 text-green-300"
                      : "bg-red-900 text-red-300"
                    }
                  `}
                >
                  {kitchen.isActive
                    ? "Active"
                    : "Inactive"}
                </span>
              </div>

              {kitchen.location && (
                <p className="text-gray-400">
                  📍 {kitchen.location}
                </p>
              )}

              {/* Meta */}
              <div className="
                text-sm text-gray-500
                pt-3 border-t border-gray-800
              ">
                Kitchen ID:{" "}
                <span className="font-mono">
                  {kitchen.id.slice(0, 8)}…
                </span>
              </div>
            </div>

            <button
              onClick={() =>
                toggleKitchen({
                  variables: {
                    kitchenId: kitchen.id,
                    isActive: !kitchen.isActive
                  }
                })
              }
              className={`
    mt-4 w-full
    px-3 py-2 rounded-lg text-sm
    ${kitchen.isActive
                  ? "bg-red-900 text-red-300"
                  : "bg-green-900 text-green-300"
                }
  `}
            >
              {kitchen.isActive ? "Disable Kitchen" : "Enable Kitchen"}
            </button>

          </div>
        ))}
      </div>

      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Create New Kitchen"
      >

        <div className="
      w-full max-w-md
      rounded-2xl
      bg-gray-900
      p-6
      space-y-5
    ">

          <input
            placeholder="Kitchen name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input w-full"
          />

          <input
            placeholder="Location (optional)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="input w-full"
          />

          <div className="flex justify-end gap-3 pt-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>

            <button
              disabled={!name || creating}
              onClick={async () => {
                await createKitchen({
                  variables: { name, location }
                });

                setIsModalOpen(false);
                setName("");
                setLocation("");
              }}
              className="btn-primary flex-1"
            >
              {creating ? "Creating…" : "Create"}
            </button>
          </div>
        </div>
      </Modal>


    </div>
  );
}
