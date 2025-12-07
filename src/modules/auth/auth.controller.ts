import { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { asyncHandler } from "../../middleware/asyncHandler";
import { sendSuccess } from "../../utils/response";

export const signup = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, password, phone } = req.body;

  const user = await AuthService.signup({
    name,
    email,
    password,
    phone,
  });

  return sendSuccess(res, 201, "User registered successfully", user);
});

export const signin = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;

  // ✔ FIXED: pass email + password as ONE object
  const payload = await AuthService.signin({
    email,
    password,
  });

  return sendSuccess(res, 200, "Login successful", payload);
});
