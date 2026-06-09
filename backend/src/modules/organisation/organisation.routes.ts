import express from "express";

import {
  createOrganisationSchema,
  updateOrganisationSchema,
  sendInviteSchema,
} from "./organisation.validations";
import { validate } from "../../middlewares/validate";
import {
  createOrganisation,
  deleteOrganisation,
  getInviteLink,
  getMembers,
  getOrganisation,
  getOrganisations,
  joinOrganisation,
  leaveOrganisation,
  removeMember,
  resetInviteLink,
  sendInviteLink,
  updateOrganisation,
} from "./organisation.controllers";
import {
  authMiddleware,
  verifiedMiddleware,
} from "../../middlewares/authMiddelware";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  verifiedMiddleware,
  validate(createOrganisationSchema),
  createOrganisation,
);
router.get("/", authMiddleware, verifiedMiddleware, getOrganisations)
router.get("/:id", authMiddleware, verifiedMiddleware, getOrganisation);
router.put(
  "/:id",
  authMiddleware,
  verifiedMiddleware,
  validate(updateOrganisationSchema),
  updateOrganisation,
);
router.delete("/:id", authMiddleware, verifiedMiddleware, deleteOrganisation);

router.get("/:id/members", authMiddleware, verifiedMiddleware, getMembers);
router.delete(
  "/:id/members/:userId",
  authMiddleware,
  verifiedMiddleware,
  removeMember,
);
router.delete(
  "/:id/leave",
  authMiddleware,
  verifiedMiddleware,
  leaveOrganisation,
);

router.get(
  "/:id/invite-link",
  authMiddleware,
  verifiedMiddleware,
  getInviteLink,
);
router.post(
  "/:id/invite",
  authMiddleware,
  verifiedMiddleware,
  validate(sendInviteSchema),
  sendInviteLink,
);
router.post(
  "/join/:inviteCode",
  authMiddleware,
  verifiedMiddleware,
  joinOrganisation,
);
router.patch(
  "/:id/reset-invite",
  authMiddleware,
  verifiedMiddleware,
  resetInviteLink,
);

export default router;
