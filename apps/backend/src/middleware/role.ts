import { UserRole } from "@ghost/shared-types";
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
