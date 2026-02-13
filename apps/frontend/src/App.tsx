import { Routes, Route, Navigate } from "react-router-dom";
import RequireAuth from "./auth/RequireAuth";

// layouts
import AdminLayout from "./layouts/AdminLayout";
import KitchenLayout from "./layouts/KitchenLayout";

// auth
import Login from "./auth/Login";
import SignupKitchen from "./auth/SignupKitchen";
import AdminDashboard from "./pages/admin/AdminDashboard";
import KitchenDashboard from "./pages/kitchen/KitchenDashboard";
import KitchensPage from "./pages/admin/KitchensPage";
import RestaurantsPage from "./pages/admin/RestaurantsPage";
import OrdersPage from "./pages/kitchen/OrdersPage";
import MenuPage from "./pages/customer/MenuPage";
import CheckoutPage from "./pages/customer/CheckoutPage";
import LandingPage from "./pages/LandingPage";
import KitchenRestaurantsPage from "./pages/kitchen/RestaurantsPage";
import RestaurantProductsPage from "./pages/kitchen/RestaurantProductsPage";
import CustomerRestaurantsPage from "./pages/customer/RestaurantsPage";
import OrderConfirmationPage from "./pages/customer/OrderConfirmationPage";
import OrderTrackingPage from "./pages/customer/OrderTrackingPage";
import OrderLookupPage from "./pages/customer/OrderLookupPage";
import OrderHistoryPage from "./pages/kitchen/OrderHistoryPage";
import RestaurantProductsAdminPage from "./pages/admin/RestaurantProductsAdminPage";
import KitchenDetailPage from "./pages/admin/KitchenDetailPage";
import AppLayout from "./components/layout/AppLayout";
import CuisinesPage from "./pages/admin/CuisinesPage";
import Unauthorized401 from "./pages/errors/Unauthorized401";
import NotFound404 from "./pages/errors/NotFound404";
import ServerError500 from "./pages/errors/ServerError500";

export default function App() {
  return (
    <Routes>
      {/* PUBLIC */}
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<SignupKitchen />} />
      <Route path="/menu/:restaurantId" element={<MenuPage />} />
      <Route path="/checkout/:restaurantId" element={<CheckoutPage />} />
      <Route path="/menu" element={<CustomerRestaurantsPage />} />
      <Route path="/order/confirmation/:orderId" element={<OrderConfirmationPage />} />
      <Route path="/order/track/:orderId" element={<OrderTrackingPage />} />
      <Route path="/orders" element={<OrderLookupPage />} />

      {/* Error routes */}
      <Route path="/401" element={<Unauthorized401 />} />
      <Route path="/500" element={<ServerError500 />} />

      {/* Catch-all */}
      <Route path="*" element={<NotFound404 />} />

      {/* ADMIN */}
      <Route
        path="/admin"
        element={
          <RequireAuth allowedRoles={["ADMIN"]}>
            <AppLayout>
              <AdminLayout />
            </AppLayout>
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="dashboard" />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="kitchens" element={<KitchensPage />} />
        <Route path="restaurants" element={<RestaurantsPage />} />
        <Route path="restaurants/:restaurantId" element={<RestaurantProductsAdminPage />} />
        <Route path="kitchens/:kitchenId" element={<KitchenDetailPage />} />
        <Route path="cuisines" element={<CuisinesPage />} />

      </Route>

      {/* KITCHEN */}
      <Route
        path="/kitchen"
        element={
          <RequireAuth allowedRoles={["KITCHEN"]}>
            <AppLayout>
              <KitchenLayout />
            </AppLayout>
          </RequireAuth>
        }
      >
        <Route index element={<Navigate to="dashboard" />} />
        <Route path="dashboard" element={<KitchenDashboard />} />
        <Route path="orders" element={<OrdersPage />} />
        <Route path="restaurants" element={<KitchenRestaurantsPage />} />
        <Route path="restaurants/:restaurantId" element={<RestaurantProductsPage />} />
        <Route path="orders/history" element={<OrderHistoryPage />} />

      </Route>

      {/* ROOT */}
      <Route path="/" element={<LandingPage />} />
    </Routes>
  );
}
