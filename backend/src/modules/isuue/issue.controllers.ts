import { Request, Response } from "express";
import prisma from "../../lib/db";

// POST /organisations/:orgId/boards/:boardId/issues
export const createIssue = async (req: Request, res: Response) => {
  const { orgId, boardId } = req.params as { orgId: string; boardId: string };
  const { title, description, status, assigneeId } = req.body;
  const userId = req.user.id;

  try {
    const member = await prisma.organizationMember.findUnique({
      where: { userId_organizationId: { userId, organizationId: orgId } },
    });

    if (!member) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this organisation",
      });
    }

    const board = await prisma.board.findFirst({
      where: { id: boardId, organizationId: orgId },
    });

    if (!board) {
      return res
        .status(404)
        .json({ success: false, message: "Board not found" });
    }

    const lastIssue = await prisma.issue.findFirst({
      where: { boardId, status: status ?? "TODO" },
      orderBy: { position: "desc" },
    });

    const position = lastIssue ? lastIssue.position + 1 : 0;

    if (assigneeId) {
      const assigneeMembership = await prisma.organizationMember.findUnique({
        where: {
          userId_organizationId: { userId: assigneeId, organizationId: orgId },
        },
      });

      if (!assigneeMembership) {
        return res.status(400).json({
          success: false,
          message: "Assignee is not a member of this organisation",
        });
      }
    }

    const issue = await prisma.issue.create({
      data: {
        title,
        description,
        status: status ?? "TODO",
        position,
        boardId,
        assigneeId: assigneeId ?? null,
        creatorId: userId,
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true, email: true } },
      },
    });

    return res
      .status(201)
      .json({ success: true, message: "Issue created successfully", issue });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getIssues = async (req: Request, res: Response) => {
  const { orgId, boardId } = req.params as { orgId: string; boardId: string };
  const userId = req.user.id;

  try {
    const member = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: { userId, organizationId: orgId },
      },
    });

    if (!member) {
      return res.status(403).json({
        success: false,
        message: "ONly members can access the issues",
      });
    }
    const board = await prisma.board.findFirst({
      where: { id: boardId, organizationId: orgId },
    });
    if (!board) {
      return res.status(404).json({
        success: false,
        message: "Board not found",
      });
    }
    const issues = await prisma.issue.findMany({
      where: { boardId },
      orderBy: { position: "asc" },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true, email: true } },
      },
    });
    const grouped = {
      TODO: issues.filter((i) => i.status === "TODO"),
      IN_PROGRESS: issues.filter((i) => i.status === "IN_PROGRESS"),
      IN_REVIEW: issues.filter((i) => i.status === "IN_REVIEW"),
      DONE: issues.filter((i) => i.status === "DONE"),
    };

    return res.status(200).json({ success: true, data: grouped });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getIssueById = async (req: Request, res: Response) => {
  const { orgId, boardId, issueId } = req.params as {
    orgId: string;
    boardId: string;
    issueId: string;
  };
  const userId = req.user.id;

  try {
    const member = await prisma.organizationMember.findUnique({
      where: { userId_organizationId: { userId, organizationId: orgId } },
    });

    if (!member) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this organisation",
      });
    }

    const issue = await prisma.issue.findFirst({
      where: { id: issueId, boardId, board: { organizationId: orgId } },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true, email: true } },
      },
    });

    if (!issue) {
      return res
        .status(404)
        .json({ success: false, message: "Issue not found" });
    }

    return res.status(200).json({ success: true, data: issue });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateIssue = async (req: Request, res: Response) => {
  const { orgId, boardId, issueId } = req.params as {
    orgId: string;
    boardId: string;
    issueId: string;
  };
  const { title, description, status, assigneeId } = req.body;
  const userId = req.user.id;

  try {
    const member = await prisma.organizationMember.findUnique({
      where: { userId_organizationId: { userId, organizationId: orgId } },
    });

    if (!member) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this organisation",
      });
    }

    const issue = await prisma.issue.findFirst({
      where: { id: issueId, boardId, board: { organizationId: orgId } },
    });

    if (!issue) {
      return res
        .status(404)
        .json({ success: false, message: "Issue not found" });
    }

    if (assigneeId) {
      const assigneeMembership = await prisma.organizationMember.findUnique({
        where: {
          userId_organizationId: { userId: assigneeId, organizationId: orgId },
        },
      });

      if (!assigneeMembership) {
        return res.status(400).json({
          success: false,
          message: "Assignee is not a member of this organisation",
        });
      }
    }

    const updatedIssue = await prisma.issue.update({
      where: { id: issueId },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(assigneeId !== undefined && { assigneeId }),
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        creator: { select: { id: true, name: true, email: true } },
      },
    });

    return res.status(200).json({
      success: true,
      message: "Issue updated successfully",
      data: updatedIssue,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateIssuePosition = async (req: Request, res: Response) => {
  const { orgId, boardId, issueId } = req.params as {
    orgId: string;
    boardId: string;
    issueId: string;
  };
  const { status, position } = req.body;
  const userId = req.user.id;

  try {
    const member = await prisma.organizationMember.findUnique({
      where: { userId_organizationId: { userId, organizationId: orgId } },
    });

    if (!member) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this organisation",
      });
    }

    const issue = await prisma.issue.findFirst({
      where: { id: issueId, boardId, board: { organizationId: orgId } },
    });

    if (!issue) {
      return res
        .status(404)
        .json({ success: false, message: "Issue not found" });
    }

    await prisma.issue.updateMany({
      where: {
        boardId,
        status,
        position: { gte: position },
        id: { not: issueId },
      },
      data: { position: { increment: 1 } },
    });

    const updatedIssue = await prisma.issue.update({
      where: { id: issueId },
      data: { status, position },
    });

    return res.status(200).json({
      success: true,
      message: "Issue position updated",
      data: updatedIssue,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteIssue = async (req: Request, res: Response) => {
  const { orgId, boardId, issueId } = req.params as {
    orgId: string;
    boardId: string;
    issueId: string;
  };
  const userId = req.user.id;
  try {
    const member = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: { userId, organizationId: orgId },
      },
    });
    if (!member) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this organisation",
      });
    }
    const issue = await prisma.issue.findFirst({
      where: { id: issueId, boardId, board: { organizationId: orgId } },
    });

    if (!issue) {
      return res
        .status(404)
        .json({ success: false, message: "Issue not found" });
    }
    const isCreator = issue.creatorId === userId;
    const isOwner = member.role === "OWNER";

    if (!isCreator && !isOwner) {
      return res.status(403).json({
        success: false,
        message:
          "Only the creator or the organisation owner can delete the issue",
      });
    }

    await prisma.issue.delete({
      where: {
        id: issueId,
      },
    });
    return res.status(200).json({
      success: true,
      message: "Issue Deleted Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
