import { Request, Response } from "express";
import { prisma } from "../../lib/db";
import { success } from "zod";

export const createBoard = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const { orgId } = req.params as { orgId: string };
    const userId = req.user.id;

    const member = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId: orgId,
        },
      },
    });
    if (!member) {
      return res
        .status(403)
        .json({ message: "You are not a member of this organization" });
    }

    if (member.role !== "OWNER") {
      return res
        .status(403)
        .json({ message: "Only the organization owner can create boards" });
    }

    const board = await prisma.board.create({
      data: {
        name: name.trim(),
        organizationId: orgId,
      },
    });
    return res
      .status(201)
      .json({ success: true, message: "Board created successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const getBoards = async (req: Request, res: Response) => {
  try {
    const { orgId } = req.params as { orgId: string };
    const userId = req.user.id;

    const member = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId: orgId,
        },
      },
    });
    if (!member) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this organization",
      });
    }
    const boards = await prisma.board.findMany({
      where: {
        organizationId: orgId,
      },
      orderBy: { createdAt: "asc" },
      include: {
        _count: {
          select: { issues: true },
        },
      },
    });

    return res.status(200).json({
      success: true,
      data: boards,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getBoardbyId = async (req: Request, res: Response) => {
  try {
    const { boardId, orgId } = req.params as { boardId: string; orgId: string };
    const userId = req.user.id;

    const member = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId: orgId,
        },
      },
    });
    if (!member) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this organization",
      });
    }
    const board = await prisma.board.findFirst({
      where: {
        id: boardId,
        organizationId: orgId,
      },
      include: {
        issues: {
          orderBy: { position: "asc" },
          include: {
            assignee: {
              select: { id: true, name: true, email: true },
            },
            creator: {
              select: { id: true, name: true, email: true },
            },
          },
        },
      },
    });
    if (!board) {
      return res.status(404).json({
        success: false,
        message: "Board not found",
      });
    }
    return res.status(200).json({
      success: true,
      data: board,
    });
  } catch (erroro) {}
};

export const deleteBoard = async (req: Request, res: Response) => {
  try {
    const { boardId, orgId } = req.params as { boardId: string; orgId: string };
    const userId = req.user.id;
    const member = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: {
          userId,
          organizationId: orgId,
        },
      },
    });
    if (!member) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this organization",
      });
    }
    if (member.role !== "OWNER") {
      return res.status(403).json({
        success: false,
        message: "Only the organization owner can delete boards",
      });
    }
    const board = await prisma.board.findFirst({
      where: {
        id: boardId,
        organizationId: orgId,
      },
    });
    if (!board) {
      return res.status(404).json({
        success: false,
        message: "Board not found",
      });
    }
    await prisma.board.delete({
      where: {
        id: boardId,
      },
    });
    return res
      .status(200)
      .json({ success: true, message: "Board deleted successfully" });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
