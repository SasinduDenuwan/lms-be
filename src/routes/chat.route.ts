import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { postChat } from "../controllers/chat.controller";
import { requireRole } from "../middleware/role.middleware";
import { Role } from "../models/user.model";

const router = Router();

router.post(["/post-chat", "/post-chat/:prompt"], authenticate, requireRole([Role.USER]), postChat);

export default router;