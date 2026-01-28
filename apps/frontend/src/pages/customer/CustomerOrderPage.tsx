import { gql } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import { useState } from "react";

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

export default function CustomerOrderPage() {
  const [createOrder] = useMutation(CREATE_ORDER);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  const handlePlaceOrder = async () => {
    await createOrder({
      variables: {
        kitchenId: "KITCHEN_ID_HERE",
        restaurantId: "RESTAURANT_ID_HERE",
        items: [
          { productId: "p1", quantity: 2, priceSnapshot: 199 }
        ],
        guestInfo: { name, phone }
      }
    });

    alert("Order placed successfully!");
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h1 className="text-xl font-semibold">Place Order</h1>

      <input
        placeholder="Your name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="input"
      />

      <input
        placeholder="Phone number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        className="input"
      />

      <button onClick={handlePlaceOrder} className="btn-primary w-full">
        Place Order
      </button>
    </div>
  );
}
