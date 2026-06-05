import { z } from "zod";

const nameField = z
  .string("Name is required")
  .min(2, "Name must be at least 2 characters")
  .max(50, "Name must be at most 50 characters")
  .trim();

export const createOrganisationSchema = z.object({
  body: z.object({
    name: nameField,
  }),
});

export const updateOrganisationSchema = z.object({
  body: z.object({
    name: nameField,
  }),
  params: z.object({
    id: z.string("Organisation ID is required").cuid("Invalid organisation ID"),
  }),
});

export const sendInviteSchema = z.object({
  body: z.object({
    email: z.string("Email is required").email("Invalid email address").trim(),
  }),
  params: z.object({
    id: z.string("Organisation ID is required").cuid("Invalid organisation ID"),
  }),
});
