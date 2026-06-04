import { z } from "zod";

export const createOrganisationSchema = z.object({
  name: z
    .string("Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters")
    .trim(),
});

export const updateOrganisationSchema = z.object({
  name: z
    .string("Name is required")
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be at most 50 characters")
    .trim(),
});

export const sendInviteSchema = z.object({
  email: z.string("Email is required").email("Invalid email address").trim(),
});
