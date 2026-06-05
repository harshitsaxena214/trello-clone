import { z } from "zod";

const emailField = z.string("Email is required").email("Invalid email address");

const passwordField = z
  .string("Password is required")
  .min(6, "Password must be at least 6 characters long");

const otpField = z
  .string("OTP is required")
  .length(6, "OTP must be 6 digits")
  .regex(/^\d+$/, "OTP must be numeric");

export const registerSchema = z.object({
  body: z.object({
    name: z
      .string("Name is required")
      .min(2, "Name must be at least 2 characters long"),
    email: emailField,
    password: passwordField,
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: emailField,
    password: passwordField,
  }),
});

export const verifyEmailSchema = z.object({
  body: z.object({
    otp: otpField,
  }),
});

export const sendResetOtpSchema = z.object({
  body: z.object({
    email: emailField,
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    email: emailField,
    otp: otpField,
    newPassword: passwordField,
  }),
});
