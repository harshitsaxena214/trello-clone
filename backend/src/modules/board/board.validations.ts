import { z } from "zod";

export const createBoardSchema = z.object({
  body: z.object({
    name: z
      .string("Board name is required")
      .trim()
      .min(1, "Board name cannot be empty")
      .max(100, "Board name cannot exceed 100 characters"),
  }),
  params: z.object({
    orgId: z
      .string("Organisation ID is required")
      .cuid("Invalid organisation ID"),
  }),
});

export const getBoardsSchema = z.object({
  params: z.object({
    orgId: z
      .string("Organisation ID is required")
      .cuid("Invalid organisation ID"),
  }),
});

export const getBoardByIdSchema = z.object({
  params: z.object({
    orgId: z
      .string("Organisation ID is required")
      .cuid("Invalid organisation ID"),
    boardId: z.string("Board ID is required").cuid("Invalid board ID"),
  }),
});

// export const updateBoardSchema = z.object({
//   body: z.object({
//     name: z
//       .string("Board name is required")
//       .trim()
//       .min(1, "Board name cannot be empty")
//       .max(100, "Board name cannot exceed 100 characters"),
//   }),
//   params: z.object({
//     orgId: z
//       .string("Organisation ID is required")
//       .cuid("Invalid organisation ID"),
//     boardId: z.string("Board ID is required").cuid("Invalid board ID"),
//   }),
// });

export const deleteBoardSchema = z.object({
  params: z.object({
    orgId: z
      .string("Organisation ID is required")
      .cuid("Invalid organisation ID"),
    boardId: z.string("Board ID is required").cuid("Invalid board ID"),
  }),
});
