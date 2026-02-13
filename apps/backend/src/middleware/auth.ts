import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export type AuthRequest = Request & {
  user?: {
    userId: string;
    role: string;
    kitchenId?: string;
  };
};

export const authMiddleware = (
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) => {
  const operationName = (req.body as any)?.operationName;

  const PUBLIC_OPERATIONS = ["Login", "KitchenSignup"];

  if (operationName && PUBLIC_OPERATIONS.includes(operationName)) {
    return next();
  }

  const authHeader = req.headers?.authorization;

  if (!authHeader) {
    return next();
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as AuthRequest["user"];

    req.user = decoded;
  } catch {
    console.warn("Invalid token");
  }

  next();
};
