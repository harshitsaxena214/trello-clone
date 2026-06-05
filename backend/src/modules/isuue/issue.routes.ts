// routes/issue.routes.ts
import express from "express";
import {
  createIssue,
  getIssues,
  getIssueById,
  updateIssue,
  updateIssuePosition,
  deleteIssue,
} from "./issue.controllers";
import { authMiddleware, verifiedMiddleware } from "../../middlewares/authMiddelware";
import { validate } from "../../middlewares/validate";
import {
  createIssueSchema,
  getIssuesSchema,
  getIssueByIdSchema,
  updateIssueSchema,
  updateIssuePositionSchema,
  deleteIssueSchema,
} from "./issue.validations";

const router = express.Router({ mergeParams: true });

router.use(authMiddleware);
router.use(verifiedMiddleware);

router.route("/")
  .get(validate(getIssuesSchema), getIssues)
  .post(validate(createIssueSchema), createIssue);

router.route("/:issueId")
  .get(validate(getIssueByIdSchema), getIssueById)
  .put(validate(updateIssueSchema), updateIssue)
  .delete(validate(deleteIssueSchema), deleteIssue);

router.patch("/:issueId/position", validate(updateIssuePositionSchema), updateIssuePosition);

export default router;