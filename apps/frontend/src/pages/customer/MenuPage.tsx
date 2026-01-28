import {  useParams, useNavigate, useLocation } from "react-router-dom";
import { useState } from "react";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

const GET_PRODUCTS = gql`
  query GetProductsByRestaurant($restaurantId: ID!) {
    getProductsByRestaurant(restaurantId: $restaurantId) {
      id
      name
      price
    }
  }
`;

type Product = {
  id: string;
  name: string;
  price: number;
};

type LocationState = {
  kitchenId: string;
};

export default function MenuPage() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { kitchenId } = location.state as LocationState;

  const [cart, setCart] = useState<Record<string, number>>({});

  const { data, loading } = useQuery<{
    getProductsByRestaurant: Product[];
  }>(GET_PRODUCTS, {
    variables: { restaurantId }
  });

  const addToCart = (productId: string) => {
    setCart((prev) => ({
      ...prev,
      [productId]: (prev[productId] || 0) + 1
    }));
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => {
      const copy = { ...prev };
      if (copy[productId] > 1) copy[productId]--;
      else delete copy[productId];
      return copy;
    });
  };

  if (loading) {
    return <p className="text-gray-400 p-6">Loading menu…</p>;
  }

  const products = data?.getProductsByRestaurant ?? [];

  // ✅ BUILD SNAPSHOT-BASED CART ITEMS
  const cartItems = products
    .filter((p) => cart[p.id])
    .map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      quantity: cart[p.id]
    }));

  const totalItems = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Menu</h1>

      <div className="grid grid-cols-2 gap-4">
        {products.map((product) => (
          <div key={product.id} className="card">
            <h3 className="font-medium">{product.name}</h3>
            <p className="text-gray-400">₹{product.price}</p>

            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={() => removeFromCart(product.id)}
                className="px-2 py-1 border rounded"
              >
                −
              </button>
              <span>{cart[product.id] || 0}</span>
              <button
                onClick={() => addToCart(product.id)}
                className="px-2 py-1 border rounded"
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      {totalItems > 0 && (
        <button
          onClick={() =>
            navigate(`/checkout/${restaurantId}`, {
              state: {
                cartItems,
                kitchenId
              }
            })
          }
          className="btn-primary w-full"
        >
          Proceed to Checkout ({totalItems} items)
        </button>
      )}
    </div>
  );
}
