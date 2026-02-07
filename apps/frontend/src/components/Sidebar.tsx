import { NavLink } from "react-router-dom";
import {
  LayoutGrid,
  ClipboardList,
  LogOut,
  Menu,
  X,
  Hotel,
  Building2,
} from "lucide-react";
import { logout } from "../auth/logout";

type Props = {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
};

export default function Sidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose
}: Props) {
  const role = localStorage.getItem("role");

  const navItemClass = ({ isActive }: { isActive: boolean }) =>
    `
      flex items-center gap-3 px-4 py-3 rounded-xl
      transition-all duration-200
      ${
        isActive
          ? "bg-gradient-to-r from-indigo-500/20 to-purple-600/20 text-white"
          : "text-gray-400 hover:bg-gray-800 hover:text-white"
      }
    `;

  const sidebarWidth = collapsed ? "w-20" : "w-64";

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onMobileClose}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
        />
      )}

      <aside
        className={`
          fixed top-4 bottom-4 left-4
          ${sidebarWidth}
          rounded-3xl
          bg-gray-900/70
          backdrop-blur-xl
          border border-gray-700
          p-4
          flex flex-col
          shadow-2xl
          z-50
          transition-all duration-300
          ${
            mobileOpen
              ? "translate-x-0"
              : "-translate-x-[120%] lg:translate-x-0"
          }
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
              GK
            </div>

            {!collapsed && (
              <span className="text-lg font-semibold">
                Ghost Kitchen
              </span>
            )}
          </div>

          {/* Collapse button (desktop) */}
          <button
            onClick={onToggle}
            className="hidden lg:block text-gray-400 hover:text-white"
          >
            <Menu size={18} />
          </button>

          {/* Close button (mobile) */}
          <button
            onClick={onMobileClose}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Links */}
        <nav className="flex-1 space-y-1">
          {role === "ADMIN" && (
            <>
              <NavLink to="/admin/dashboard" className={navItemClass}>
                <LayoutGrid size={18} />
                {!collapsed && "Dashboard"}
              </NavLink>

              <NavLink to="/admin/kitchens" className={navItemClass}>
                <Building2 size={18} />
                {!collapsed && "Kitchens"}
              </NavLink>

              <NavLink to="/admin/restaurants" className={navItemClass}>
                <Hotel size={18} />
                {!collapsed && "Restaurants"}
              </NavLink>

              <NavLink to="/admin/cuisines" className={navItemClass}>
                <Hotel size={18} />
                {!collapsed && "Cuisines"}
              </NavLink>
            </>
          )}

          {role === "KITCHEN" && (
            <>
              <NavLink to="/kitchen/dashboard" className={navItemClass}>
                <LayoutGrid size={18} />
                {!collapsed && "Dashboard"}
              </NavLink>

              <NavLink to="/kitchen/orders" className={navItemClass}>
                <ClipboardList size={18} />
                {!collapsed && "Orders"}
              </NavLink>

              <NavLink to="/kitchen/restaurants" className={navItemClass}>
                <ClipboardList size={18} />
                {!collapsed && "Restaurants"}
              </NavLink>

              <NavLink to="/kitchen/orders/history" className={navItemClass}>
                <ClipboardList size={18} />
                {!collapsed && "Order History"}
              </NavLink>
            </>
          )}
        </nav>

        {/* Logout */}
        <button
          onClick={logout}
          className="
            mt-auto
            flex items-center gap-3
            px-4 py-3 rounded-xl
            text-red-400
            hover:bg-red-500/10
            hover:text-red-300
            transition
          "
        >
          <LogOut size={18} />
          {!collapsed && "Logout"}
        </button>
      </aside>
    </>
  );
}
