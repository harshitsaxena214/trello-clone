import { Request, Response, NextFunction } from "express";
import { decode } from "@auth/core/jwt";
import prisma from "../lib/db";
import { env } from "../lib/env";

const SALT = "taskflow-session-token";

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
    const payload = await decode({
      token,
      secret: env.AUTH_SECRET,
      salt: SALT,
    });
    if (!payload?.email)
      return res.status(401).json({ error: "Invalid session" });

    let user = await prisma.user.findUnique({
      where: { email: payload.email as string },
    });
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: payload.email as string,
          name: payload.name as string,
          avatar: payload.picture as string | undefined,
        },
      });
    }

    req.user = { id: user.id };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid session" });
  }
};
