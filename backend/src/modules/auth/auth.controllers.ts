import { Request, Response } from "express";
import prisma from "../../lib/db";
import { env } from "../../lib/env";

export const syncUser = async (req: Request, res: Response) => {
  if (req.headers.authorization !== `Bearer ${env.AUTH_SECRET}`) {
    return res.status(403).json({ success: false, message: "Forbidden" });
  }

  const { email, name, avatar } = req.body;
  if (!email) {
    return res
      .status(400)
      .json({ success: false, message: "Email is required" });
  }

  try {
    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      user = await prisma.user.create({ data: { email, name, avatar } });
    } else if (user.name !== name || user.avatar !== avatar) {
      user = await prisma.user.update({
        where: { email },
        data: { name, avatar },
      });
    }

    return res.status(200).json({ success: true, data: user });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
