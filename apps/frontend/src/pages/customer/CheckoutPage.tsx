import { gql } from "@apollo/client";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
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

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

type LocationState = {
  cartItems: CartItem[];
  kitchenId: string;
};

/* ---------------- Component ---------------- */

export default function CheckoutPage() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const isValidPhone = (phone: string) => {
    return /^[6-9]\d{9}$/.test(phone);
  };

  const state = location.state as LocationState | undefined;

  const cartItems = state?.cartItems;
  const kitchenId = state?.kitchenId;

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState("");

  const [createOrder, { loading }] = useMutation(CREATE_ORDER);

  // 🛑 Guard: no cart
  if (!cartItems || cartItems.length === 0 || !kitchenId) {
    return (
      <div className="p-6 text-gray-400">
        Cart is empty or invalid access.
      </div>
    );
  }

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const handlePlaceOrder = async () => {
    const items = cartItems.map((item) => ({
      productId: item.id,
      name: item.name,                  // ✅ SNAPSHOT
      quantity: item.quantity,
      priceSnapshot: item.price         // ✅ SNAPSHOT
    }));

    const res = await createOrder({
      variables: {
        kitchenId,
        restaurantId,
        items,
        guestInfo: { name, phone }
      }
    });

    const orderId = res.data.createOrder.id;
    navigate(`/order/confirmation/${orderId}`);
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-6">
      <h1 className="text-xl font-semibold">Checkout</h1>

      {/* Order Summary */}
      <div className="card space-y-3">
        <h3 className="font-medium">Your Order</h3>

        {cartItems.map((item) => (
          <div key={item.id} className="flex justify-between">
            <span>
              {item.name} × {item.quantity}
            </span>
            <span>₹{item.price * item.quantity}</span>
          </div>
        ))}

        <hr className="border-border" />

        <div className="flex justify-between font-semibold">
          <span>Total</span>
          <span>₹{total}</span>
        </div>
      </div>

      {/* Guest Info */}
      <input
        className="input"
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <input
        className="input"
        placeholder="Enter 10-digit phone number"
        value={phone}
        onChange={(e) => {
          const value = e.target.value.replace(/\D/g, "");
          setPhone(value);
          if (!isValidPhone(value)) {
            setPhoneError("Please enter a valid 10-digit phone number");
          } else {
            setPhoneError("");
          }
        }}
        maxLength={10}
      />
      {phoneError && (
        <p className="text-red-400 text-sm">
          {phoneError}
        </p>
      )}

      <button
        onClick={handlePlaceOrder}
        disabled={loading || !isValidPhone(phone) || name.trim() === "" || phone.length !== 10}
        className="btn-primary w-full"
      >
        {loading ? "Placing order..." : "Place Order"}
      </button>
    </div>
  );
}
