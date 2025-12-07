// src/modules/users/users.controller.ts
import { Response } from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import { sendSuccess } from "../../utils/response";
import { UserService } from "./users.service";
import { AuthRequest } from "../../middleware/auth"; 
export const getAllUsers = asyncHandler(async (_req: AuthRequest, res: Response) => {
  const users = await UserService.getAllUsers();
  return sendSuccess(res, 200, "Users fetched successfully", users);
});

export const updateUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { user } = req; 
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

export const deleteUser = asyncHandler(async (req: AuthRequest, res: Response) => {
  const { userId } = req.params;
  const id = Number(userId);

  await UserService.deleteUser(id);

  return sendSuccess(res, 200, "User deleted successfully");
});
