import { Router } from "express";
import { authGuard, requireAdmin } from "../../middleware/auth";
import {
  getAllUsers,
  updateUser,
  deleteUser,
} from "./users.controller";

const router = Router();
router.use(authGuard);

router.get("/", requireAdmin, getAllUsers);

router.put("/:userId", updateUser);

router.delete("/:userId", requireAdmin, deleteUser);

export default router;
