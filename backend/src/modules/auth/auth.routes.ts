import { Router } from "express";
import { syncUser } from "./auth.controllers";

const router = Router();

router.post("/sync", syncUser);

export default router;
