

import "express"; 

import { UserRole } from "../modules/users/user.types";

declare global {
  namespace Express {
    interface UserPayload {
      id: number;
      email: string;
      role: UserRole;
    }

    interface Request {
      user?: UserPayload;
    }
  }
}

export {};
