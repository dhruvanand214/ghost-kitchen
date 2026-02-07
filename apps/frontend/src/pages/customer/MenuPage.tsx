import { gql } from "@apollo/client";
import { useParams, useNavigate } from "react-router-dom";
import { useState, useMemo } from "react";
import { useQuery } from "@apollo/client/react";

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

/* ---------------- Types ---------------- */

type Product = {
  id: string;
  name: string;
  price: number;
};

/* ---------------- Page ---------------- */

export default function MenuPage() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();

  const [cart, setCart] = useState<Record<string, number>>({});

  const { data, loading } = useQuery<{
    getProductsByRestaurant: Product[];
  }>(GET_PRODUCTS, {
    variables: { restaurantId }
  });

  /* ---------------- Cart Helpers ---------------- */

  const addToCart = (id: string) => {
    setCart((prev) => ({
      ...prev,
      [id]: (prev[id] || 0) + 1
    }));
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => {
      const copy = { ...prev };
      if (copy[id] > 1) copy[id]--;
      else delete copy[id];
      return copy;
    });
  };

  const cartSummary = useMemo(() => {
    let items = 0;
    let total = 0;

    data?.getProductsByRestaurant.forEach((p) => {
      const qty = cart[p.id] || 0;
      items += qty;
      total += qty * p.price;
    });

    return { items, total };
  }, [cart, data]);

  /* ---------------- UI ---------------- */

  if (loading) {
    return (
      <p className="p-6 text-gray-400">
        Loading menu…
      </p>
    );
  }

  return (
    <div className="relative pb-32">
      {/* Header */}
      <div className="max-w-6xl mx-auto p-6 space-y-2">
        <h1 className="text-3xl font-bold">
          Menu 🍽️
        </h1>
        <p className="text-gray-400">
          Choose your favourites
        </p>
      </div>

      {/* Products */}
      <div className="max-w-6xl mx-auto grid grid-cols-3 gap-6 px-6">
        {data?.getProductsByRestaurant.map(
          (product) => {
            const qty = cart[product.id] || 0;

            return (
              <div
                key={product.id}
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
                {/* Image placeholder */}
                <div className="
                  h-28
                  rounded-xl
                  bg-gradient-to-br
                  from-indigo-500/20
                  to-purple-600/20
                  flex items-center justify-center
                  text-3xl
                ">
                  🍲
                </div>

                {/* Info */}
                <div className="mt-4 space-y-1">
                  <h3 className="text-lg font-semibold">
                    {product.name}
                  </h3>
                  <p className="text-gray-400">
                    ₹{product.price}
                  </p>
                </div>

                {/* Actions */}
                <div className="mt-5 flex items-center justify-between">
                  {qty === 0 ? (
                    <button
                      onClick={() =>
                        addToCart(product.id)
                      }
                      className="
                        w-full
                        py-2 rounded-xl
                        bg-indigo-600
                        hover:bg-indigo-500
                        transition
                        font-medium
                      "
                    >
                      Add
                    </button>
                  ) : (
                    <div className="
                      flex items-center gap-3
                    ">
                      <button
                        onClick={() =>
                          removeFromCart(product.id)
                        }
                        className="
                          w-9 h-9
                          rounded-full
                          border border-gray-600
                          hover:bg-gray-800
                        "
                      >
                        −
                      </button>

                      <span className="font-medium">
                        {qty}
                      </span>

                      <button
                        onClick={() =>
                          addToCart(product.id)
                        }
                        className="
                          w-9 h-9
                          rounded-full
                          bg-indigo-600
                          hover:bg-indigo-500
                        "
                      >
                        +
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          }
        )}
      </div>

      {/* Sticky Cart Bar */}
      {cartSummary.items > 0 && (
        <div className="
          fixed bottom-0 inset-x-0
          bg-gray-900
          border-t border-gray-700
          p-4
        ">
          <div className="
            max-w-6xl mx-auto
            flex justify-between items-center
          ">
            <div>
              <p className="font-medium">
                {cartSummary.items} items
              </p>
              <p className="text-gray-400 text-sm">
                ₹{cartSummary.total}
              </p>
            </div>

            <button
              onClick={() =>
                navigate(`/checkout/${restaurantId}`, {
                  state: {
                    cart,
                    items:
                      data?.getProductsByRestaurant
                  }
                })
              }
              className="
                px-6 py-3
                rounded-xl
                bg-indigo-600
                hover:bg-indigo-500
                transition
                font-medium
              "
            >
              Proceed to Checkout →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
