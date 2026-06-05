import express from "express";

import {
  authMiddleware,
  verifiedMiddleware,
} from "../../middlewares/authMiddelware";

import {
  createBoard,
  getBoards,
  getBoardbyId,
  deleteBoard,
} from "./board.controllers";
import { validate } from "../../middlewares/validate";
import {
  createBoardSchema,
  getBoardsSchema,
  getBoardByIdSchema,
  deleteBoardSchema,
} from "./board.validations";

const router = express.Router({ mergeParams: true });

router.use(authMiddleware);
router.use(verifiedMiddleware);

router.route("/")
  .get(validate(getBoardsSchema), getBoards)
  .post(validate(createBoardSchema), createBoard);

router.route("/:boardId")
  .get(validate(getBoardByIdSchema), getBoardbyId)
  .delete(validate(deleteBoardSchema), deleteBoard);

export default router;