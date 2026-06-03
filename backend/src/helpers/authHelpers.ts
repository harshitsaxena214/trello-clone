import { Response } from "express";
import transporter from "../lib/nodemailer";
import { env } from "../lib/env";

export const generateOtp = () =>
  String(Math.floor(100000 + Math.random() * 900000));

export const setTokenCookie = (res: Response, token: string) => {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    maxAge: 24 * 60 * 60 * 1000,
  });
};

export const sendOtpEmail = async (email: string, otp: string) => {
  await transporter.sendMail({
    from: env.SENDER_EMAIL,
    to: email,
    subject: "Verify your email",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #4F46E5;">Verify your email</h2>
        <div style="background: #F3F4F6; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
          <p style="color: #6B7280; margin: 0 0 8px;">Your OTP</p>
          <h1 style="color: #4F46E5; font-size: 40px; letter-spacing: 8px; margin: 0;">${otp}</h1>
          <p style="color: #9CA3AF; font-size: 12px; margin: 8px 0 0;">Expires in 10 minutes</p>
        </div>
        <p style="color: #6B7280; font-size: 13px;">If you didn't request this, ignore this email.</p>
      </div>
    `,
  });
};
