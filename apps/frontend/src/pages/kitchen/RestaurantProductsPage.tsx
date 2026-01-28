import { gql } from "@apollo/client";
import { useParams } from "react-router-dom";
import { useState } from "react";
import { useMutation, useQuery } from "@apollo/client/react";

/* ---------------- GraphQL ---------------- */

const GET_PRODUCTS = gql`
  query GetProductsByRestaurant($restaurantId: ID!) {
    getProductsByRestaurant(restaurantId: $restaurantId) {
      id
      name
      price
    }
  }
`;

const CREATE_PRODUCT = gql`
  mutation CreateProduct(
    $restaurantId: ID!
    $name: String!
    $price: Float!
  ) {
    createProduct(
      restaurantId: $restaurantId
      name: $name
      price: $price
    ) {
      id
      name
      price
    }
  }
`;

/* ---------------- Types ---------------- */

type Product = {
  id: string;
  name: string;
  price: number;
};

/* ---------------- Component ---------------- */

export default function RestaurantProductsPage() {
  const { restaurantId } = useParams<{ restaurantId: string }>();

  const { data, loading, refetch } = useQuery<{
    getProductsByRestaurant: Product[];
  }>(GET_PRODUCTS, {
    variables: { restaurantId }
  });

  const [createProduct] = useMutation(CREATE_PRODUCT);

  const [name, setName] = useState("");
  const [price, setPrice] = useState("");

  const handleAddProduct = async () => {
    if (!name || !price) return;

    await createProduct({
      variables: {
        restaurantId,
        name,
        price: Number(price)
      }
    });

    setName("");
    setPrice("");
    refetch();
  };

  if (loading) {
    return <p className="text-gray-400">Loading products…</p>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Products</h1>

      {/* Add Product */}
      <div className="card space-y-3 max-w-md">
        <h3 className="font-medium">Add Product</h3>

        <input
          className="input"
          placeholder="Product name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="input"
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
        />

        <button
          onClick={handleAddProduct}
          className="btn-primary"
        >
          Add Product
        </button>
      </div>

      {/* Product List */}
      <div className="grid grid-cols-3 gap-4">
        {data?.getProductsByRestaurant.map((product) => (
          <div key={product.id} className="card">
            <h3 className="font-medium">{product.name}</h3>
            <p className="text-gray-400">₹{product.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
