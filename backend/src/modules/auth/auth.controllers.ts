import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import prisma from "../../lib/db";
import { env } from "../../lib/env";

export const syncUser = async (req: Request, res: Response) => {
  const { email, name, image } = req.body;

  let user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        name,
        avatar: image,
      },
    });
  }

  const token = jwt.sign(
    {
      id: user.id,
    },
    env.JWT_SECRET,
    {
      expiresIn: "7d",
    },
  );

  return res.json({
    token,
    user,
  });
};
