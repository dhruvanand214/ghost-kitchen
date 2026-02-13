import { gql } from "@apollo/client";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useState, useMemo } from "react";
import { useMutation } from "@apollo/client/react";

/* ---------------- GraphQL ---------------- */

const CREATE_ORDER = gql`
  mutation CreateOrder(
    $kitchenId: ID!
    $restaurantId: ID!
    $items: [OrderItemInput!]!
    $guestInfo: GuestInfoInput
  ) {
    createOrder(
      kitchenId: $kitchenId
      restaurantId: $restaurantId
      items: $items
      guestInfo: $guestInfo
    ) {
      id
      orderNumber
    }
  }
`;

/* ---------------- Types ---------------- */

type Product = {
  id: string;
  name: string;
  price: number;
};

type LocationState = {
  cart: Record<string, number>;
  items: Product[];
};

type CreateOrderMutationData = {
  createOrder: {
    id: string;
    orderNumber: string;
  };
};

/* ---------------- Component ---------------- */

export default function CheckoutPage() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const state = location.state as LocationState | undefined;

  const cart = state?.cart;
  const products = state?.items;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const [createOrder, { loading }] =
    useMutation<CreateOrderMutationData>(CREATE_ORDER);

  /* ---------------- Guards ---------------- */

  if (!cart || !products || Object.keys(cart).length === 0) {
    return (
      <div className="p-6 text-gray-400 text-center">
        Cart is empty or invalid access.
      </div>
    );
  }

  /* ---------------- Helpers ---------------- */

  const isValidPhone = (phone: string) =>
    /^[6-9]\d{9}$/.test(phone);

  /* ---------------- Derived Cart Items ---------------- */

  const cartItems = useMemo(() => {
    return products
      .filter((p) => cart[p.id])
      .map((p) => ({
        productId: p.id,
        name: p.name,
        quantity: cart[p.id],
        price: p.price,
        total: cart[p.id] * p.price
      }));
  }, [cart, products]);

  const total = cartItems.reduce(
    (sum, item) => sum + item.total,
    0
  );

  /* ---------------- Submit ---------------- */

  const handlePlaceOrder = async () => {
    const kitchenId =
      localStorage.getItem("kitchenId") || "";

    const items = cartItems.map((item) => ({
      productId: item.productId,
      name: item.name,               // snapshot
      quantity: item.quantity,
      priceSnapshot: item.price      // snapshot
    }));

    const res = await createOrder({
      variables: {
        kitchenId,
        restaurantId,
        items,
        guestInfo: { name, phone }
      }
    });

    if (res.data?.createOrder?.id) {
      navigate(`/order/confirmation/${res.data.createOrder.id}`);
    }
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold">
            Checkout 🧾
          </h1>
          <p className="text-gray-400 text-sm">
            Review your order & place it
          </p>
        </div>

        {/* Order Summary */}
        <div className="card space-y-4">
          <h3 className="font-semibold">
            Your Order
          </h3>

          {cartItems.map((item) => (
            <div
              key={item.productId}
              className="flex justify-between text-sm"
            >
              <span>
                {item.name} × {item.quantity}
              </span>
              <span>₹{item.total}</span>
            </div>
          ))}

          <div className="border-t border-border pt-3 flex justify-between font-semibold">
            <span>Total</span>
            <span className="text-lg">₹{total}</span>
          </div>
        </div>

        {/* Guest Info */}
        <div className="card space-y-4">
          <h3 className="font-semibold">
            Your Details
          </h3>

          <input
            className="input"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div>
            <input
              className="input"
              placeholder="10-digit phone number"
              value={phone}
              maxLength={10}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                setPhone(value);

                if (!isValidPhone(value)) {
                  setPhoneError(
                    "Please enter a valid 10-digit phone number"
                  );
                } else {
                  setPhoneError("");
                }
              }}
            />

            {phoneError && (
              <p className="text-red-400 text-xs mt-1">
                {phoneError}
              </p>
            )}
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={handlePlaceOrder}
          disabled={
            loading ||
            !isValidPhone(phone) ||
            name.trim() === ""
          }
          className="btn-primary w-full"
        >
          {loading ? "Placing Order…" : "Place Order"}
        </button>

        <p className="text-xs text-gray-500 text-center">
          You’ll receive order updates on this number
        </p>
      </div>
    </div>
  );
}
