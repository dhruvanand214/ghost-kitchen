import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    role: string;
    kitchenId?: string;
  };
}

export const authMiddleware = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  const operationName =
    (req.body as any)?.operationName;

  const PUBLIC_OPERATIONS = [
    "Login",
    "KitchenSignup"
  ];

  // Allow public operations
  if (operationName && PUBLIC_OPERATIONS.includes(operationName)) {
    return next();
  }

  const authHeader = req.headers.authorization;

  // Allow guest access if no token
  if (!authHeader) {
    return next();
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as {
      userId: string;
      role: string;
      kitchenId?: string;
    };

    req.user = decoded;
  } catch {
    console.warn("Invalid token");
  }

  next();
};
