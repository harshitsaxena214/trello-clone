import express, { Request, Response } from "express";

import { validate } from "../../middlewares/validate";
import { authMiddleware } from "../../middlewares/authMiddelware";
import {
  registerUser,
  loginUser,
  sendResetOtp,
  resetPassword,
  verifyEmail,
  resendVerifyOtp,
  isAuthenticated,
  logoutUser,
} from "./auth.controllers";
import {
  registerSchema,
  loginSchema,
  sendResetOtpSchema,
  resetPasswordSchema,
  verifyEmailSchema,
} from "./auth.validations";

const router = express.Router();

router.post("/register", validate(registerSchema), registerUser);
router.post("/login", validate(loginSchema), loginUser);
router.post("/send-reset-otp", validate(sendResetOtpSchema), sendResetOtp);
router.post("/reset-password", validate(resetPasswordSchema), resetPassword);

router.post(
  "/verify-email",
  authMiddleware,
  validate(verifyEmailSchema),
  verifyEmail,
);

router.post("/resend-otp", authMiddleware, resendVerifyOtp);
router.get("/is-authenticated", authMiddleware, isAuthenticated);
router.post("/logout", authMiddleware, logoutUser);

export default router;
