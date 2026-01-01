import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { requireRole } from "../middleware/role.middleware";
import { Role } from "../models/user.model";
import { getAllCartItems, addCartItem, deleteCartItem } from "../controllers/cart.controller";

const router = Router();

router.get("/get-all-cart-items/:userId", authenticate, requireRole([Role.USER]), getAllCartItems);
router.post("/add-cart-item", authenticate, requireRole([Role.USER]), addCartItem);
router.delete("/delete-cart-item", authenticate, requireRole([Role.USER]), deleteCartItem);

export default router;