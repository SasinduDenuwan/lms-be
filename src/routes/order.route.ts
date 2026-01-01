import { Router } from "express";
import { createOrder } from "../controllers/order.controller";
import { authenticate } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { Role } from "../models/user.model";

const router = Router();

router.post("/create-order", authenticate, requireRole([Role.USER]), createOrder);

export default router;