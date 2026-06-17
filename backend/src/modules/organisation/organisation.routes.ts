import express from "express";

import {
  createOrganisationSchema,
  updateOrganisationSchema,
} from "./organisation.validations";
import { validate } from "../../middlewares/validate";
import {
  createOrganisation,
  deleteOrganisation,
  getInviteLink,
  getMembers,
  getOrganisation,
  getOrganisations,
  getOrgByInviteCode,
  getOrgBySlug,
  joinOrganisation,
  leaveOrganisation,
  removeMember,
  resetInviteLink,
  updateOrganisation,
} from "./organisation.controllers";
import {
  authMiddleware,
} from "../../middlewares/authMiddelware";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  validate(createOrganisationSchema),
  createOrganisation,
);
router.get("/", authMiddleware, getOrganisations);
router.get("/slug/:slug", authMiddleware,  getOrgBySlug);
router.get("/invite/:inviteCode", authMiddleware, getOrgByInviteCode);
router.post(
  "/join/:inviteCode",
  authMiddleware,
  joinOrganisation,
);
router.get("/:id", authMiddleware,  getOrganisation);
router.put(
  "/:id",
  authMiddleware,
  validate(updateOrganisationSchema),
  updateOrganisation,
);
router.delete("/:id", authMiddleware, deleteOrganisation);

router.get("/:id/members", authMiddleware,  getMembers);
router.delete(
  "/:id/members/:userId",
  authMiddleware,
  removeMember,
);
router.delete(
  "/:id/leave",
  authMiddleware,
  leaveOrganisation,
);

router.get(
  "/:id/invite-link",
  authMiddleware,
  getInviteLink,
);
router.patch(
  "/:id/reset-invite",
  authMiddleware,
  resetInviteLink,
);

export default router;
