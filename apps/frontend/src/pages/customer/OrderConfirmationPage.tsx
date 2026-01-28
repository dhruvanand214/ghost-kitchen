import { useParams, useNavigate } from "react-router-dom";

export default function OrderConfirmationPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="card max-w-md text-center space-y-4">
        <h1 className="text-2xl font-semibold">🎉 Order Placed!</h1>

        <p className="text-gray-400">
          Your order has been placed successfully.
        </p>

        <p className="font-mono text-sm">
          Order ID: {orderId}
        </p>

        <button
          onClick={() => navigate(`/order/track/${orderId}`)}
          className="btn-primary w-full"
        >
          Track Order
        </button>
      </div>
    </div>
  );
}
