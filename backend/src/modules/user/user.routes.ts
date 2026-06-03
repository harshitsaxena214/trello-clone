import express from "express";
import { authMiddleware } from "../../middlewares/authMiddelware";
import { deleteUserAccount, getuserProfile } from "./user.controllers";

const router = express.Router();

router.get("/get-profile", authMiddleware, getuserProfile);
router.delete("/delete-user", authMiddleware, deleteUserAccount);

export default router;
