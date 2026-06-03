import bcrypt from "bcrypt";
import { Request, Response } from "express";
import prisma from "../../lib/db";
import jwt from "jsonwebtoken";
import "dotenv/config";
import transporter from "../../lib/nodemailer";
import { env } from "../../lib/env";
import {
  generateOtp,
  setTokenCookie,
  sendOtpEmail,
} from "../../helpers/authHelpers";

export const registerUser = async (req: Request, res: Response) => {
  const { name, email, password } = req.body;
  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      if (existingUser.isAccountVerified) {
        return res
          .status(400)
          .json({ success: false, message: "User already exists" });
      } else {
        return res.status(400).json({
          success: false,
          message:
            "Account pending verification. Please check your email or request a new OTP.",
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const otp = generateOtp();

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        verifyOtp: otp,
        verifyOtpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    const token = jwt.sign({ id: user.id }, env.JWT_SECRET, {
      expiresIn: "1d",
    });
    setTokenCookie(res, token);
    await sendOtpEmail(email, otp);

    return res
      .status(201)
      .json({ success: true, message: "OTP sent to your email" });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const verifyEmail = async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { otp } = req.body;

  if (!userId || !otp) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    if (user.verifyOtp === "" || user.verifyOtp != otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }

    if (!user.verifyOtpExpiresAt || user.verifyOtpExpiresAt < new Date()) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        isAccountVerified: true,
        verifyOtp: "",
        verifyOtpExpiresAt: null,
      },
    });

    return res
      .status(200)
      .json({ success: true, message: "Email verified successfully" });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const resendVerifyOtp = async (req: Request, res: Response) => {
  const userId = req.user.id;
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    if (user.isAccountVerified) {
      return res
        .status(400)
        .json({ success: false, message: "Account already verified" });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));

    await prisma.user.update({
      where: { id: userId },
      data: {
        verifyOtp: otp,
        verifyOtpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),
      },
    });

    await sendOtpEmail(user.email, otp);

    return res
      .status(200)
      .json({ success: true, message: "OTP resent successfully" });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(400).json({ message: "Invalid email" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const isVerified = user.isAccountVerified;
    if (!isVerified) {
      return res
        .status(400)
        .json({ message: "Please verify your email to login" });
    }

    const token = jwt.sign({ id: user.id }, env.JWT_SECRET, {
      expiresIn: "1d",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });

    return res.status(200).json({ message: "Login successful", success: true });
  } catch (error: any) {
    return res.status(500).json({
      success: true,
      message: error.message,
    });
  }
};

export const isAuthenticated = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } });

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    return res.status(200).json({
      message: "User is authenticated",
      success: true,
      isAuthenticated: true,
      isAccountVerified: user.isAccountVerified,
    });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const logoutUser = (req: Request, res: Response) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "strict",
    });
    return res
      .status(200)
      .json({ message: "Logout successful", success: true });
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const sendResetOtp = async (req: Request, res: Response) => {
  const { email } = req.body;
  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "Email is required" });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000));

    await prisma.user.update({
      where: { email },
      data: {
        resetOtp: otp,
        resetOtpExpiresAt: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    const mailOptions = {
      from: env.SENDER_EMAIL,
      to: user.email,
      subject: "Password Reset OTP",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #4F46E5;">Password Reset</h2>
          <div style="background: #F3F4F6; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0;">
            <p style="color: #6B7280; margin: 0 0 8px;">Your OTP</p>
            <h1 style="color: #4F46E5; font-size: 40px; letter-spacing: 8px; margin: 0;">${otp}</h1>
            <p style="color: #9CA3AF; font-size: 12px; margin: 8px 0 0;">Expires in 15 minutes</p>
          </div>
          <p style="color: #6B7280; font-size: 13px;">If you didn't request this, ignore this email.</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res
      .status(200)
      .json({ success: true, message: "Reset OTP sent successfully" });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ message: "All fields are required" });
  }
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    if (!user.resetOtp || user.resetOtp !== otp) {
      return res.status(400).json({ success: false, message: "Invalid OTP" });
    }
    if (!user.resetOtpExpiresAt || user.resetOtpExpiresAt < new Date()) {
      return res.status(400).json({ success: false, message: "OTP expired" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;

    await prisma.user.update({
      where: { email },
      data: {
        password: hashedPassword,
        resetOtp: "",
        resetOtpExpiresAt: null,
      },
    });

    return res
      .status(200)
      .json({ success: true, message: "Password reset successful" });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
