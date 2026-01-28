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
  _res: any,
  next: any
) => {
  const { operationName } = req.body || {};

  const PUBLIC_OPERATIONS = [
    "Login",
    "KitchenSignup"
  ];

  // Always allow known public ops
  if (PUBLIC_OPERATIONS.includes(operationName)) {
    return next();
  }

  const authHeader = req.headers.authorization;

  // 👇 No token? Allow as guest
  if (!authHeader) {
    return next();
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    );
    req.user = decoded as any;
  } catch (err) {
    console.warn("Invalid token");
  }

  next();
};


