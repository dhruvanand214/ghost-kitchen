import { NavLink } from "react-router-dom";
import { LayoutGrid, ClipboardList, LogOut } from "lucide-react";
import { logout } from "../auth/logout";

export default function Sidebar() {
  const role = localStorage.getItem("role");

  return (
    <aside className="w-64 bg-panel border-r border-border p-4 flex flex-col gap-2">
      <h2 className="text-xl font-bold mb-6">Ghost Kitchen</h2>

      {role === "ADMIN" && (
        <>
          <NavLink to="/admin/dashboard" className="nav-item">
            <LayoutGrid size={18} /> Dashboard
          </NavLink>
          <NavLink to="/admin/kitchens" className="nav-item">
            <ClipboardList size={18} /> Kitchens
          </NavLink>
          <NavLink to="/admin/restaurants" className="nav-item">
            <ClipboardList size={18} /> Restaurants
          </NavLink>
        </>
      )}

      {role === "KITCHEN" && (
        <>
          <NavLink to="/kitchen/dashboard" className="nav-item">
            <LayoutGrid size={18} /> Dashboard
          </NavLink>
          <NavLink to="/kitchen/orders" className="nav-item">
            <ClipboardList size={18} /> Orders
          </NavLink>
          <NavLink to="/kitchen/restaurants" className="nav-item">
            <ClipboardList size={18} /> Restaurants
          </NavLink>
        </>
      )}

      <button
        onClick={logout}
        className="mt-auto text-red-400 hover:text-red-500"
      >
        <LogOut size={18} /> Logout
      </button>
    </aside>
  );
}
