import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function KitchenLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar collapsed={false} onToggle={function (): void {
        throw new Error("Function not implemented.");
      } } mobileOpen={false} onMobileClose={function (): void {
        throw new Error("Function not implemented.");
      } } />
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
