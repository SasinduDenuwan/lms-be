import { Router } from "express";
import { getPayments, createPayment } from "../controllers/payment.controller";
import { authenticate } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { Role } from "../models/user.model";

const router = Router();

router.get("/get-all-payment", authenticate, requireRole([Role.ADMIN, Role.USER]), getPayments);

router.post("/create-payment", authenticate, requireRole([Role.USER]), createPayment);

export default router;