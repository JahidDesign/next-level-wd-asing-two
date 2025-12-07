import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config/env";
import { sendError } from "../utils/response";

type UserRole = "admin" | "customer";

interface JwtPayload {
  id: number;
  email: string;
  role: UserRole;
}

export function authGuard(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return sendError(
      res,
      401,
      "Unauthorized",
      "Missing or invalid authentication token"
    );
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as JwtPayload;

    
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
    };

    return next();
  } catch {
    return sendError(
      res,
      401,
      "Unauthorized",
      "Invalid authentication token"
    );
  }
}

export function requireRole(role: UserRole) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 401, "Unauthorized");
    }

    if (req.user.role !== role) {
      return sendError(
        res,
        403,
        "Forbidden",
        "Insufficient permissions"
      );
    }

    next();
  };
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return sendError(res, 401, "Unauthorized");
  }

  if (req.user.role !== "admin") {
    return sendError(res, 403, "Forbidden", "Admin access required");
  }

  next();
}
