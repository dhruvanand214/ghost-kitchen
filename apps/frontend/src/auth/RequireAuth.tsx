import type { JSX } from "react";
import { Navigate } from "react-router-dom";

type Props = {
  children: JSX.Element;
  allowedRoles: ("ADMIN" | "KITCHEN")[];
};

export default function RequireAuth({
  children,
  allowedRoles
}: Props) {
  const token = localStorage.getItem("admin_token") || localStorage.getItem("kitchen_token") || localStorage.getItem("customer_token");
  const role = localStorage.getItem("role");

  if (!token || !role) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(role as any)) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
