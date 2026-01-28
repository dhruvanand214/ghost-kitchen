import { useNavigate } from "react-router-dom";
import { Store, ChefHat, Shield } from "lucide-react";
import { useEffect } from "react";

export default function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("role");
    localStorage.removeItem("kitchenId");
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-bg text-white px-6">
      <h1 className="text-3xl font-bold mb-2">Ghost Kitchen</h1>
      <p className="text-gray-400 mb-10 text-center">
        Choose how you want to continue
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
        {/* CUSTOMER */}
        <div
          onClick={() => navigate("/menu")}
          className="card cursor-pointer hover:border-accent transition"
        >
          <Store size={28} className="mb-3 text-accent" />
          <h3 className="font-semibold text-lg">Customer</h3>
          <p className="text-sm text-gray-400">
            Browse menu & place an order
          </p>
        </div>

        {/* KITCHEN */}
        <div
          onClick={() => navigate("/login")}
          className="card cursor-pointer hover:border-accent transition"
        >
          <ChefHat size={28} className="mb-3 text-accent" />
          <h3 className="font-semibold text-lg">Kitchen</h3>
          <p className="text-sm text-gray-400">
            Manage orders & products
          </p>
        </div>

        {/* ADMIN */}
        <div
          onClick={() => navigate("/login")}
          className="card cursor-pointer hover:border-accent transition"
        >
          <Shield size={28} className="mb-3 text-accent" />
          <h3 className="font-semibold text-lg">Admin</h3>
          <p className="text-sm text-gray-400">
            Control kitchens & restaurants
          </p>
        </div>

        {/* Track Orders */}
        <div
          onClick={() => navigate("/orders")}
          className="card cursor-pointer hover:border-accent transition"
        >
          <Shield size={28} className="mb-3 text-accent" />
          <h3 className="font-semibold text-lg">Track Order</h3>
          <p className="text-sm text-gray-400">
            Track your order
          </p>
        </div>
      </div>
    </div>
  );
}
