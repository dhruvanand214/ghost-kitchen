import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

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

type Kitchen = {
  id: string;
  name: string;
  location?: string;
  isActive: boolean;
};

export default function KitchensPage() {
  const { data, loading, error } = useQuery<{
    getAllKitchens: Kitchen[];
  }>(GET_KITCHENS);

  if (loading) return <p className="text-gray-400">Loading kitchens…</p>;
  if (error) return <p className="text-red-400">{error.message}</p>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">Kitchens</h1>

      <div className="grid grid-cols-3 gap-4">
        {data?.getAllKitchens.map((kitchen: Kitchen) => (
          <div key={kitchen.id} className="card">
            <h3 className="font-medium">{kitchen.name}</h3>
            <p className="text-sm text-gray-400">
              {kitchen.location || "No location"}
            </p>
            <span
              className={`text-sm ${
                kitchen.isActive ? "text-green-400" : "text-red-400"
              }`}
            >
              {kitchen.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
