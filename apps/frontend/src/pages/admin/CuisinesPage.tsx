import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { useState } from "react";

/* ---------------- Types ---------------- */

interface Cuisines {
  id: string;
  name: string;
  isActive: boolean;
}

/* ---------------- GraphQL ---------------- */

const GET_CUISINES = gql`
  query {
    getCuisines {
      id
      name
      isActive
    }
  }
`;

const CREATE_CUISINE = gql`
  mutation CreateCuisine($name: String!) {
    createCuisine(name: $name) {
      id
      name
    }
  }
`;

const TOGGLE_CUISINE = gql`
  mutation ToggleCuisine($id: ID!, $isActive: Boolean!) {
    toggleCuisine(id: $id, isActive: $isActive) {
      id
      isActive
    }
  }
`;

/* ---------------- Page ---------------- */

export default function CuisinesPage() {
  const [name, setName] = useState("");

  const { data, refetch } = useQuery(GET_CUISINES);
  const [createCuisine] = useMutation(CREATE_CUISINE);
  const [toggleCuisine] = useMutation(TOGGLE_CUISINE);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">
        Cuisine Management 🍽️
      </h1>

      {/* Add cuisine */}
      <div className="flex gap-3 max-w-md">
        <input
          className="input flex-1"
          placeholder="Cuisine name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          className="btn-primary"
          onClick={async () => {
            await createCuisine({
              variables: { name }
            });
            setName("");
            refetch();
          }}
        >
          Add
        </button>
      </div>

      {/* Cuisine list */}
      <div className="grid grid-cols-3 gap-4">
        {data?.getCuisines.map((c: Cuisines) => (
          <div
            key={c.id}
            className="card flex justify-between items-center"
          >
            <span>{c.name}</span>

            <button
              onClick={() =>
                toggleCuisine({
                  variables: {
                    id: c.id,
                    isActive: !c.isActive
                  }
                })
              }
              className={`text-sm ${
                c.isActive
                  ? "text-green-400"
                  : "text-gray-400"
              }`}
            >
              {c.isActive ? "Active" : "Disabled"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
