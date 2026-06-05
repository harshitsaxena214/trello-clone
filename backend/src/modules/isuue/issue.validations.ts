// validations/issue.validation.ts
import { z } from "zod";

const issueStatusEnum = z.enum(["TODO", "IN_PROGRESS", "IN_REVIEW", "DONE"], {
  message: "Status must be TODO, IN_PROGRESS, IN_REVIEW or DONE",
});

const orgBoardParams = z.object({
  orgId: z
    .string("Organisation ID is required")
    .cuid("Invalid organisation ID"),
  boardId: z.string("Board ID is required").cuid("Invalid board ID"),
});

const orgBoardIssueParams = orgBoardParams.extend({
  issueId: z.string("Issue ID is required").cuid("Invalid issue ID"),
});

export const createIssueSchema = z.object({
  params: orgBoardParams,
  body: z.object({
    title: z
      .string("Title is required")
      .trim()
      .min(1, "Title cannot be empty")
      .max(200, "Title cannot exceed 200 characters"),
    description: z
      .string()
      .trim()
      .max(5000, "Description cannot exceed 5000 characters")
      .optional(),
    status: issueStatusEnum.optional(),
    assigneeId: z.string().cuid("Invalid assignee ID").optional().nullable(),
  }),
});

export const getIssuesSchema = z.object({
  params: orgBoardParams,
});

export const getIssueByIdSchema = z.object({
  params: orgBoardIssueParams,
});

export const updateIssueSchema = z.object({
  params: orgBoardIssueParams,
  body: z
    .object({
      title: z
        .string()
        .trim()
        .min(1, "Title cannot be empty")
        .max(200, "Title cannot exceed 200 characters")
        .optional(),
      description: z
        .string()
        .trim()
        .max(5000, "Description cannot exceed 5000 characters")
        .nullable()
        .optional(),
      status: issueStatusEnum.optional(),
      assigneeId: z.string().cuid("Invalid assignee ID").nullable().optional(),
    })
    .refine((data) => Object.values(data).some((v) => v !== undefined), {
      message: "At least one field must be provided to update",
    }),
});

export const updateIssuePositionSchema = z.object({
  params: orgBoardIssueParams,
  body: z.object({
    status: issueStatusEnum,
    position: z
      .number("Position is required")
      .int("Position must be an integer")
      .min(0, "Position cannot be negative"),
  }),
});

export const deleteIssueSchema = z.object({
  params: orgBoardIssueParams,
});
