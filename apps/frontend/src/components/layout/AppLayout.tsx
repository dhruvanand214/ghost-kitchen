import { useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "../Sidebar";

export default function AppLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebarOffset = collapsed ? "ml-[96px]" : "ml-[288px]";

  return (
    <div className="min-h-screen bg-black">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((v) => !v)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-4 left-4 z-40">
        <button
          onClick={() => setMobileOpen(true)}
          className="
            p-3 rounded-xl
            bg-gray-900/80
            backdrop-blur
            border border-gray-700
          "
        >
          <Menu size={20} />
        </button>
      </div>

      {/* Main content */}
      <main
        className={`
          ${sidebarOffset}
          p-6
          transition-all duration-300
        `}
      >
        {children}
      </main>
    </div>
  );
}
