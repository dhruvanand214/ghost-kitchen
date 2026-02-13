import { UserRole } from "../shared/role.enum";
import { AuthRequest } from "./auth";

export const requireAdmin = (req: AuthRequest) => {
  if (req.user?.role !== UserRole.ADMIN) {
    throw new Error("Admin access only");
  }
};

export const requireKitchenAccess = (
  req: AuthRequest,
  kitchenId: string
) => {
  if (
    req.user?.role === UserRole.KITCHEN &&
    req.user.kitchenId !== kitchenId
  ) {
    throw new Error("Unauthorized kitchen access");
  }
};

export const requireKitchenOrAdmin = (
  req: AuthRequest,
  kitchenId: string
) => {
  if (!req.user) {
    throw new Error("Unauthorized access");
  }

  // Admin can access anything
  if (req.user.role === "ADMIN") {
    return;
  }

  // Kitchen can only access own kitchen
  if (
    req.user.role === "KITCHEN" &&
    req.user.kitchenId === kitchenId
  ) {
    return;
  }

  throw new Error("Forbidden");
};

