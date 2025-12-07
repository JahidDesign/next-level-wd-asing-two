// src/modules/users/users.controller.ts
import { Request, Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import { sendSuccess } from "../../utils/response";
import { UserService } from "./users.service";

export const getAllUsers = asyncHandler(async (_req: Request, res: Response) => {
  const users = await UserService.getAllUsers();
  return sendSuccess(res, 200, "Users fetched successfully", users);
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const { user } = req; // set by authGuard
  const { userId } = req.params;

  if (!user) {
    
    return sendSuccess(res, 401, "Unauthorized");
  }

  const targetUserId = Number(userId);

  const updated = await UserService.updateUser(
    { id: user.id, role: user.role },
    targetUserId,
    req.body
  );

  return sendSuccess(res, 200, "User updated successfully", updated);
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const id = Number(userId);

  await UserService.deleteUser(id);

  return sendSuccess(res, 200, "User deleted successfully");
});
