import { Request, Response } from "express";
import prisma from "../../lib/db";
import { env } from "../../lib/env";
import transporter from "../../lib/nodemailer";
import slugify from "slugify";

const generateUniqueSlug = async (name: string) => {
  const base = slugify(name, { lower: true, strict: true });
  let slug = base;
  let count = 1;
  while (await prisma.organization.findUnique({ where: { slug } })) {
    slug = `${base}-${count}`;
    count++;
  }
  return slug;
};

// POST /organisations
export const createOrganisation = async (req: Request, res: Response) => {
  const { name } = req.body;
  const userId = req.user.id;

  try {
    const slug = await generateUniqueSlug(name.trim());

    const existingOrg = await prisma.organization.findUnique({
      where: { slug },
    });

    if (existingOrg) {
      return res.status(400).json({
        success: false,
        message:
          "Organisation with similar name already exists, please choose a different name",
      });
    }

    const org = await prisma.organization.create({
      data: {
        name: name.trim(),
        slug,
        members: {
          create: {
            userId,
            role: "OWNER",
          },
        },
      },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
      },
    });

    return res.status(201).json({ success: true, data: org });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrganisations = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;

    const organisations = await prisma.organization.findMany({
      where: {
        members: {
          some: {
            userId,
          },
        },
      },
    });

    return res.status(200).json({
      success: true,
      organisations,
      message: "Organisations fetched Successfully",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch organisations",
    });
  }
};

// GET /organisations/:id
export const getOrganisation = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const userId = req.user.id;

  if (!id) {
    return res
      .status(400)
      .json({ success: false, message: "Organisation ID is required" });
  }

  try {
    const org = await prisma.organization.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        boards: true,
      },
    });

    if (!org) {
      return res
        .status(404)
        .json({ success: false, message: "Organisation not found" });
    }

    const isMember = org.members.some((m) => m.userId === userId);
    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this organisation",
      });
    }

    return res.status(200).json({ success: true, data: org });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const updateOrganisation = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const { name } = req.body;
  const userId = req.user.id;

  if (!id) {
    return res
      .status(400)
      .json({ success: false, message: "Organisation ID is required" });
  }

  try {
    const org = await prisma.organization.findUnique({ where: { id } });
    if (!org) {
      return res
        .status(404)
        .json({ success: false, message: "Organisation not found" });
    }

    const member = await prisma.organizationMember.findUnique({
      where: { userId_organizationId: { userId, organizationId: id } },
    });

    if (!member) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this organisation",
      });
    }

    if (member.role !== "OWNER") {
      return res.status(403).json({
        success: false,
        message: "Only owners can update the organisation",
      });
    }

    // only regenerate slug if name actually changed
    const slug =
      name.trim() !== org.name
        ? await generateUniqueSlug(name.trim())
        : org.slug;

    const updated = await prisma.organization.update({
      where: { id },
      data: { name: name.trim(), slug },
    });

    return res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /organisations/:id
export const deleteOrganisation = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const userId = req.user.id;

  if (!id) {
    return res
      .status(400)
      .json({ success: false, message: "Organisation ID is required" });
  }

  try {
    const org = await prisma.organization.findUnique({ where: { id } });
    if (!org) {
      return res
        .status(404)
        .json({ success: false, message: "Organisation not found" });
    }

    const member = await prisma.organizationMember.findUnique({
      where: { userId_organizationId: { userId, organizationId: id } },
    });

    if (!member) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this organisation",
      });
    }

    if (member.role !== "OWNER") {
      return res.status(403).json({
        success: false,
        message: "Only owners can delete the organisation",
      });
    }

    await prisma.organization.delete({ where: { id } });

    return res
      .status(200)
      .json({ success: true, message: "Organisation deleted successfully" });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /organisations/:id/members
export const getMembers = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const userId = req.user.id;

  if (!id) {
    return res
      .status(400)
      .json({ success: false, message: "Organisation ID is required" });
  }

  try {
    const org = await prisma.organization.findUnique({ where: { id } });
    if (!org) {
      return res
        .status(404)
        .json({ success: false, message: "Organisation not found" });
    }

    const member = await prisma.organizationMember.findUnique({
      where: { userId_organizationId: { userId, organizationId: id } },
    });

    if (!member) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this organisation",
      });
    }

    const members = await prisma.organizationMember.findMany({
      where: { organizationId: id },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return res.status(200).json({ success: true, data: members });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /organisations/:id/members/:userId
export const removeMember = async (req: Request, res: Response) => {
  const { id, userId: targetUserId } = req.params as {
    id: string;
    userId: string;
  };
  const userId = req.user.id;

  if (!id || !targetUserId) {
    return res.status(400).json({
      success: false,
      message: "Organisation ID and User ID are required",
    });
  }

  try {
    const org = await prisma.organization.findUnique({ where: { id } });
    if (!org) {
      return res
        .status(404)
        .json({ success: false, message: "Organisation not found" });
    }

    const requester = await prisma.organizationMember.findUnique({
      where: { userId_organizationId: { userId, organizationId: id } },
    });

    if (!requester) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this organisation",
      });
    }

    if (requester.role !== "OWNER") {
      return res
        .status(403)
        .json({ success: false, message: "Only owners can remove members" });
    }

    if (targetUserId === userId) {
      return res.status(400).json({
        success: false,
        message:
          "Owners cannot remove themselves, delete the organisation instead",
      });
    }

    const targetMember = await prisma.organizationMember.findUnique({
      where: {
        userId_organizationId: { userId: targetUserId, organizationId: id },
      },
    });

    if (!targetMember) {
      return res.status(404).json({
        success: false,
        message: "Member not found in this organisation",
      });
    }

    await prisma.organizationMember.delete({
      where: {
        userId_organizationId: { userId: targetUserId, organizationId: id },
      },
    });

    return res
      .status(200)
      .json({ success: true, message: "Member removed successfully" });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /organisations/:id/leave
export const leaveOrganisation = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const userId = req.user.id;

  if (!id) {
    return res
      .status(400)
      .json({ success: false, message: "Organisation ID is required" });
  }

  try {
    const org = await prisma.organization.findUnique({ where: { id } });
    if (!org) {
      return res
        .status(404)
        .json({ success: false, message: "Organisation not found" });
    }

    const member = await prisma.organizationMember.findUnique({
      where: { userId_organizationId: { userId, organizationId: id } },
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "You are not a member of this organisation",
      });
    }

    if (member.role === "OWNER") {
      return res.status(400).json({
        success: false,
        message: "Owners cannot leave, delete the organisation instead",
      });
    }

    await prisma.organizationMember.delete({
      where: { userId_organizationId: { userId, organizationId: id } },
    });

    return res
      .status(200)
      .json({ success: true, message: "Left organisation successfully" });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// GET /organisations/:id/invite-link
export const getInviteLink = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const userId = req.user.id;

  if (!id) {
    return res
      .status(400)
      .json({ success: false, message: "Organisation ID is required" });
  }

  try {
    const org = await prisma.organization.findUnique({ where: { id } });
    if (!org) {
      return res
        .status(404)
        .json({ success: false, message: "Organisation not found" });
    }

    const member = await prisma.organizationMember.findUnique({
      where: { userId_organizationId: { userId, organizationId: id } },
    });

    if (!member) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this organisation",
      });
    }

    if (member.role !== "OWNER") {
      return res.status(403).json({
        success: false,
        message: "Only owners can get the invite link",
      });
    }

    const inviteLink = `${env.CLIENT_URL}/join/${org.inviteCode}`;

    return res.status(200).json({ success: true, inviteLink });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /organisations/:id/invite
export const sendInviteLink = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const { email } = req.body;
  const userId = req.user.id;

  if (!id) {
    return res
      .status(400)
      .json({ success: false, message: "Organisation ID is required" });
  }

  try {
    const org = await prisma.organization.findUnique({ where: { id } });
    if (!org) {
      return res
        .status(404)
        .json({ success: false, message: "Organisation not found" });
    }

    const member = await prisma.organizationMember.findUnique({
      where: { userId_organizationId: { userId, organizationId: id } },
    });

    if (!member) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this organisation",
      });
    }

    if (member.role !== "OWNER") {
      return res
        .status(403)
        .json({ success: false, message: "Only owners can send invites" });
    }

    const invitedUser = await prisma.user.findUnique({ where: { email } });
    if (invitedUser) {
      const alreadyMember = await prisma.organizationMember.findUnique({
        where: {
          userId_organizationId: { userId: invitedUser.id, organizationId: id },
        },
      });
      if (alreadyMember) {
        return res.status(400).json({
          success: false,
          message: "User is already a member of this organisation",
        });
      }
    }

    const inviteLink = `${env.CLIENT_URL}/join/${org.inviteCode}`;

    await transporter.sendMail({
      from: env.SENDER_EMAIL,
      to: email,
      subject: `You've been invited to ${org.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>You've been invited to join <strong>${org.name}</strong></h2>
          <p>Click the button below to join the organisation.</p>
          <a href="${inviteLink}"
             style="background: #4F46E5; color: white; padding: 12px 24px;
                    border-radius: 6px; text-decoration: none; display: inline-block;">
            Join Organisation
          </a>
          <p style="color: #9CA3AF; font-size: 12px; margin-top: 16px;">
            If you didn't expect this, ignore this email.
          </p>
        </div>
      `,
    });

    return res
      .status(200)
      .json({ success: true, message: "Invite sent successfully" });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

// POST /organisations/join/:inviteCode
export const joinOrganisation = async (req: Request, res: Response) => {
  const { inviteCode } = req.params as { inviteCode: string };
  const userId = req.user.id;

  if (!inviteCode) {
    return res
      .status(400)
      .json({ success: false, message: "Invite code is required" });
  }

  try {
    const org = await prisma.organization.findUnique({ where: { inviteCode } });
    if (!org) {
      return res
        .status(404)
        .json({ success: false, message: "Invalid or expired invite link" });
    }

    const existingMember = await prisma.organizationMember.findUnique({
      where: { userId_organizationId: { userId, organizationId: org.id } },
    });

    if (existingMember) {
      return res.status(400).json({
        success: false,
        message: "You are already a member of this organisation",
      });
    }

    await prisma.organizationMember.create({
      data: {
        userId,
        organizationId: org.id,
        role: "MEMBER",
      },
    });

    return res.status(200).json({
      success: true,
      message: "Joined organisation successfully",
      data: { orgId: org.id },
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const resetInviteLink = async (req: Request, res: Response) => {
  const { id } = req.params as { id: string };
  const userId = req.user.id;

  if (!id) {
    return res
      .status(400)
      .json({ success: false, message: "Organisation ID is required" });
  }

  try {
    const org = await prisma.organization.findUnique({ where: { id } });
    if (!org) {
      return res
        .status(404)
        .json({ success: false, message: "Organisation not found" });
    }

    const member = await prisma.organizationMember.findUnique({
      where: { userId_organizationId: { userId, organizationId: id } },
    });

    if (!member) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this organisation",
      });
    }

    if (member.role !== "OWNER") {
      return res.status(403).json({
        success: false,
        message: "Only owners can reset the invite link",
      });
    }

    const updated = await prisma.organization.update({
      where: { id },
      data: { inviteCode: crypto.randomUUID() },
    });

    const newInviteLink = `${env.CLIENT_URL}/join/${updated.inviteCode}`;

    return res.status(200).json({
      success: true,
      message: "Invite link reset successfully",
      inviteLink: newInviteLink,
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getOrgBySlug = async (req: Request, res: Response) => {
  const { slug } = req.params as { slug: string };

  try {
    const org = await prisma.organization.findUnique({
      where: { slug },
      select: { id: true, name: true, slug: true },
    });

    if (!org) {
      return res
        .status(404)
        .json({ success: false, message: "Organisation not found" });
    }

    return res.status(200).json({ success: true, data: org });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
