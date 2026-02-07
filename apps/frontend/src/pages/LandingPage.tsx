import { useNavigate } from "react-router-dom";
import { Store, Users, Utensils } from "lucide-react";
import { useEffect } from "react";

export default function LandingPage() {
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem("role");
    localStorage.removeItem("kitchenId");
    localStorage.removeItem("admin_token");
    localStorage.removeItem("kitchen_token");
    localStorage.removeItem("customer_token");
  }, []);

  return (
    <div className="
      min-h-screen
      bg-gradient-to-br from-black via-gray-900 to-black
      flex items-center justify-center
      p-6
    ">
      <div className="max-w-5xl w-full space-y-12 text-center">
        {/* Hero */}
        <div className="space-y-4">
          <h1 className="text-5xl font-bold tracking-tight">
            Ghost Kitchen Platform
          </h1>
          <p className="text-gray-400 text-lg">
            One system. Multiple kitchens. Real-time orders.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-3 gap-8">
          {/* Customer */}
          <Card
            icon={<Utensils size={28} />}
            title="Customer"
            description="Browse restaurants and order food"
            onClick={() => navigate("/menu")}
          />

          {/* Kitchen */}
          <Card
            icon={<Store size={28} />}
            title="Kitchen"
            description="Manage orders & live preparation"
            onClick={() => navigate("/login")}
          />

          {/* Admin */}
          <Card
            icon={<Users size={28} />}
            title="Admin"
            description="Control kitchens, restaurants & data"
            onClick={() => navigate("/login")}
          />

          {/* Order lookup */}
          <Card
            icon={<Users size={28} />}
            title="Order Lookup"
            description="Track your order status"
            onClick={() => navigate("/orders")}
          />
        </div>

        {/* Footer */}
        <p className="text-xs text-gray-500">
          Built with MERN • GraphQL • Socket.IO
        </p>
      </div>
    </div>
  );
}

/* ---------------- Card ---------------- */

function Card({
  icon,
  title,
  description,
  onClick
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="
        group
        cursor-pointer
        rounded-3xl
        bg-gray-900/70
        backdrop-blur
        border border-gray-700
        p-8
        space-y-4
        transition
        hover:-translate-y-2
        hover:shadow-2xl
      "
    >
      <div className="
        w-14 h-14
        rounded-2xl
        bg-gradient-to-br from-indigo-500 to-purple-600
        flex items-center justify-center
        text-white
      ">
        {icon}
      </div>

      <h3 className="text-xl font-semibold">
        {title}
      </h3>

      <p className="text-gray-400 text-sm">
        {description}
      </p>

      <span className="
        inline-block
        mt-2
        text-indigo-400
        group-hover:translate-x-1
        transition
      ">
        Continue →
      </span>
    </div>
  );
}
